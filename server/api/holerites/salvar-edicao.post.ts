import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'

export default defineEventHandler(async (event) => {
  try {
    const supabase = await serverSupabaseClient(event)
    const user = await serverSupabaseUser(event)
    const userId = user?.sub || user?.id

    if (!user || !userId) {
      throw createError({
        statusCode: 401,
        message: 'Não autenticado',
      })
    }

    const body = await readBody(event)
    const { 
      colaborador_id, 
      mes, 
      ano,
      edicao,
      resumo,
      itens_personalizados 
    } = body

    if (!colaborador_id || !mes || !ano) {
      throw createError({
        statusCode: 400,
        message: 'Colaborador, mês e ano são obrigatórios',
      })
    }

    console.log('💾 Salvando edição da folha:', {
      colaborador_id,
      mes,
      ano,
      itens_personalizados: itens_personalizados?.length || 0
    })

    // Buscar dados do colaborador
    const { data: colaborador, error: colabError } = await supabase
      .from('colaboradores')
      .select(`
        *,
        cargo:cargos(nome),
        departamento:departamentos!colaboradores_departamento_id_fkey(nome)
      `)
      .eq('id', colaborador_id)
      .single()

    if (colabError || !colaborador) {
      throw createError({
        statusCode: 404,
        message: 'Colaborador não encontrado',
      })
    }

    const colabData = colaborador as any

    // Verificar se já existe holerite
    const { data: holeriteExistente } = await supabase
      .from('holerites')
      .select('id')
      .eq('colaborador_id', colaborador_id)
      .eq('mes', mes)
      .eq('ano', ano)
      .eq('tipo', 'mensal')
      .maybeSingle()

    // Preparar dados do holerite
    const holeriteData = {
      colaborador_id,
      mes,
      ano,
      tipo: 'mensal',
      nome_colaborador: colabData.nome || 'Não informado',
      cpf: colabData.cpf || '',
      cargo: colabData.cargo?.nome || 'Não informado',
      departamento: colabData.departamento?.nome || 'Não informado',
      
      // Valores do resumo
      salario_base: resumo.salario_base || 0,
      
      // PROVENTOS - TODOS OS CAMPOS
      horas_extras_50: edicao.horas_extras_50 || 0,
      horas_extras_100: edicao.horas_extras_100 || 0,
      valor_horas_extras_50: edicao.horas_extras_50 ? (resumo.salario_base / 220) * edicao.horas_extras_50 * 1.5 : 0,
      valor_horas_extras_100: edicao.horas_extras_100 ? (resumo.salario_base / 220) * edicao.horas_extras_100 * 2 : 0,
      bonus: edicao.bonus || 0,
      comissoes: edicao.comissoes || 0,
      adicional_noturno: edicao.adicional_noturno || 0,
      adicional_insalubridade: edicao.adicional_insalubridade || 0,
      adicional_periculosidade: edicao.adicional_periculosidade || 0,
      outros_proventos: edicao.outros_proventos || 0,
      descricao_outros_proventos: edicao.descricao_outros_proventos || null,
      
      total_proventos: resumo.total_proventos || 0,
      salario_bruto: resumo.salario_bruto || 0,
      
      // IMPOSTOS
      inss: resumo.inss || 0,
      irrf: resumo.irrf || 0,
      
      // DESCONTOS - TODOS OS CAMPOS
      adiantamento: edicao.adiantamento || 0,
      emprestimos: edicao.emprestimos || 0,
      faltas: edicao.faltas_horas || 0,
      atrasos: edicao.atrasos_horas || 0,
      outros_descontos: edicao.outros_descontos || 0,
      descricao_outros_descontos: edicao.descricao_outros_descontos || null,
      
      // BENEFÍCIOS - TODOS OS CAMPOS
      vale_transporte: edicao.vale_transporte || 0,
      vale_refeicao: edicao.vale_refeicao || 0,
      vale_alimentacao: edicao.vale_alimentacao || 0,
      plano_saude: edicao.plano_saude || 0,
      plano_odontologico: edicao.plano_odontologico || 0,
      seguro_vida: edicao.seguro_vida || 0,
      auxilio_creche: edicao.auxilio_creche || 0,
      auxilio_educacao: edicao.auxilio_educacao || 0,
      auxilio_combustivel: edicao.auxilio_combustivel || 0,
      outros_beneficios: edicao.outros_beneficios || 0,
      
      total_descontos: resumo.total_descontos || 0,
      salario_liquido: resumo.salario_liquido || 0,
      fgts: resumo.fgts || 0,
      
      banco: colabData.banco || null,
      agencia: colabData.agencia || null,
      conta: colabData.conta || null,
      data_admissao: colabData.data_admissao || null,
      
      // IMPORTANTE: Salvar itens personalizados
      itens_personalizados: itens_personalizados || [],
      
      observacoes: `Salário Mensal - ${mes}/${ano}`,
      status: 'gerado',
      gerado_em: new Date().toISOString(),
    }

    console.log('📝 Dados do holerite:', {
      ...holeriteData,
      itens_personalizados: holeriteData.itens_personalizados.length
    })

    if (holeriteExistente) {
      // Atualizar holerite existente
      const { error: updateError } = await supabase
        .from('holerites')
        .update(holeriteData)
        .eq('id', (holeriteExistente as any).id)

      if (updateError) {
        console.error('❌ Erro ao atualizar holerite:', updateError)
        throw createError({
          statusCode: 500,
          message: `Erro ao atualizar holerite: ${updateError.message}`,
        })
      }

      console.log('✅ Holerite atualizado com sucesso')

      return {
        success: true,
        message: 'Holerite atualizado com sucesso',
        holerite_id: (holeriteExistente as any).id,
      }
    } else {
      // Criar novo holerite
      const { data: novoHolerite, error: insertError } = await supabase
        .from('holerites')
        .insert(holeriteData)
        .select()
        .single()

      if (insertError) {
        console.error('❌ Erro ao criar holerite:', insertError)
        throw createError({
          statusCode: 500,
          message: `Erro ao criar holerite: ${insertError.message}`,
        })
      }

      console.log('✅ Holerite criado com sucesso')

      return {
        success: true,
        message: 'Holerite criado com sucesso',
        holerite_id: (novoHolerite as any).id,
      }
    }
  } catch (error: any) {
    console.error('❌ Erro ao salvar edição:', error)
    
    if (error.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      message: error.message || 'Erro ao salvar edição',
    })
  }
})
