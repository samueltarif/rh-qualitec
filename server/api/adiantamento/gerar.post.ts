import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const supabase = await serverSupabaseClient(event)
  const user = await serverSupabaseUser(event)

  const userId = user?.sub || user?.id

  if (!user || !userId) {
    throw createError({
      statusCode: 401,
      message: 'Não autenticado',
    })
  }

  // Verificar se é admin
  const { data: userData } = await supabase
    .from('app_users')
    .select('id, role, email')
    .eq('auth_uid', userId)
    .single()

  if (!userData || userData.role !== 'admin') {
    throw createError({
      statusCode: 403,
      message: 'Acesso negado. Apenas administradores podem gerar adiantamentos.',
    })
  }

  const body = await readBody(event)
  const { mes, ano, colaborador_ids } = body

  if (!mes || !ano) {
    throw createError({
      statusCode: 400,
      message: 'Mês e ano são obrigatórios',
    })
  }

  try {
    // Buscar configurações de adiantamento
    const { data: parametros } = await supabase
      .from('parametros_folha')
      .select('*')
      .single()

    if (!parametros) {
      throw new Error('Parâmetros da folha não configurados')
    }

    if (!parametros.adiantamento_habilitado) {
      throw new Error('Adiantamento salarial não está habilitado. Ative em Configurações > Folha de Pagamento.')
    }

    const percentualAdiantamento = parseFloat(parametros.adiantamento_percentual || 40)
    const diaPagamento = parametros.adiantamento_dia_pagamento || 20

    console.log(`\n${'='.repeat(60)}`)
    console.log('💰 GERAÇÃO DE ADIANTAMENTOS SALARIAIS')
    console.log(`${'='.repeat(60)}`)
    console.log(`📅 Período: ${mes}/${ano}`)
    console.log(`💵 Percentual: ${percentualAdiantamento}%`)
    console.log(`📆 Dia de pagamento: ${diaPagamento}`)
    console.log(`${'='.repeat(60)}\n`)

    // Buscar colaboradores
    let query = supabase
      .from('colaboradores')
      .select(`
        *,
        cargo:cargos(nome),
        departamento:departamentos!colaboradores_departamento_id_fkey(nome)
      `)
      .eq('status', 'Ativo')

    if (colaborador_ids && colaborador_ids.length > 0) {
      query = query.in('id', colaborador_ids)
    }

    const { data: colaboradores, error: colabError } = await query

    if (colabError) {
      console.error('❌ Erro ao buscar colaboradores:', colabError)
      throw colabError
    }

    if (!colaboradores || colaboradores.length === 0) {
      throw new Error('Nenhum colaborador ativo encontrado')
    }

    const adiantamentosGerados: any[] = []
    const erros: any[] = []

    // Gerar adiantamento para cada colaborador
    for (const colab of colaboradores) {
      try {
        console.log(`\n📋 Processando: ${colab.nome}`)

        const salarioBase = parseFloat(colab.salario || 0)

        if (!salarioBase || salarioBase <= 0) {
          console.warn(`⚠️ ${colab.nome} sem salário definido`)
          erros.push({
            colaborador: colab.nome,
            erro: 'Colaborador sem salário definido',
          })
          continue
        }

        // Calcular valor do adiantamento
        const valorAdiantamento = (salarioBase * percentualAdiantamento) / 100
        const valorAdiantamentoArredondado = Math.round(valorAdiantamento * 100) / 100

        console.log(`   💰 Salário base: R$ ${salarioBase.toFixed(2)}`)
        console.log(`   💵 Adiantamento (${percentualAdiantamento}%): R$ ${valorAdiantamentoArredondado.toFixed(2)}`)

        // Verificar se já existe adiantamento para este período
        const { data: adiantamentoExistente } = await supabase
          .from('holerites')
          .select('id')
          .eq('colaborador_id', colab.id)
          .eq('mes', mes)
          .eq('ano', ano)
          .eq('tipo', 'adiantamento')
          .maybeSingle()

        const adiantamentoData = {
          colaborador_id: colab.id,
          mes,
          ano,
          tipo: 'adiantamento',
          nome_colaborador: colab.nome || 'Não informado',
          cpf: colab.cpf || '',
          cargo: (colab as any).cargo?.nome || 'Não informado',
          departamento: (colab as any).departamento?.nome || 'Não informado',
          salario_base: salarioBase,
          total_proventos: valorAdiantamentoArredondado,
          inss: 0, // Sem descontos no adiantamento
          irrf: 0,
          total_descontos: 0,
          salario_bruto: valorAdiantamentoArredondado,
          salario_liquido: valorAdiantamentoArredondado,
          fgts: 0,
          valor_adiantamento: valorAdiantamentoArredondado,
          banco: colab.banco || null,
          agencia: colab.agencia || null,
          conta: colab.conta || null,
          data_admissao: colab.data_admissao || null,
          observacoes: `Adiantamento Salarial - ${percentualAdiantamento}% do salário\nPagamento previsto: dia ${diaPagamento}/${mes}/${ano}\nSem descontos (INSS, IRRF)\nValor será descontado no holerite final do mês`,
          status: 'gerado',
          gerado_por: userData.id,
          gerado_em: new Date().toISOString(),
        }

        let resultado
        if (adiantamentoExistente) {
          // Atualizar adiantamento existente
          const { data, error } = await supabase
            .from('holerites')
            .update(adiantamentoData)
            .eq('id', adiantamentoExistente.id)
            .select()
            .single()

          if (error) throw error
          resultado = data
          console.log(`   ✅ Adiantamento ATUALIZADO`)
        } else {
          // Criar novo adiantamento
          const { data, error } = await supabase
            .from('holerites')
            .insert(adiantamentoData)
            .select()
            .single()

          if (error) throw error
          resultado = data
          console.log(`   ✅ Adiantamento CRIADO`)
        }

        adiantamentosGerados.push(resultado)
      } catch (error: any) {
        console.error(`❌ Erro ao gerar adiantamento para ${colab.nome}:`, error.message)
        erros.push({
          colaborador: colab.nome,
          erro: error.message,
        })
      }
    }

    console.log(`\n${'='.repeat(60)}`)
    console.log('📊 RESUMO DA GERAÇÃO')
    console.log(`${'='.repeat(60)}`)
    console.log(`✅ Adiantamentos gerados: ${adiantamentosGerados.length}`)
    console.log(`❌ Erros: ${erros.length}`)
    if (erros.length > 0) {
      console.log('\n⚠️ Detalhes dos erros:')
      erros.forEach(e => console.log(`   - ${e.colaborador}: ${e.erro}`))
    }
    console.log(`${'='.repeat(60)}\n`)

    return {
      success: true,
      data: {
        total_gerados: adiantamentosGerados.length,
        total_erros: erros.length,
        adiantamentos: adiantamentosGerados,
        erros,
      },
    }
  } catch (error: any) {
    console.error('Erro ao gerar adiantamentos:', error)
    throw createError({
      statusCode: 500,
      message: error.message || 'Erro ao gerar adiantamentos',
    })
  }
})
