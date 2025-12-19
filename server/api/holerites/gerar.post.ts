import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'
import { calcularIRRF as calcularIRRFComRedutor } from '../../utils/irrf-lei-15270-2025'

/**
 * API para gerar holerites
 * IRRF calculado conforme Lei 15.270/2025 (válida a partir de 01/01/2026)
 */
export default defineEventHandler(async (event) => {
  const startTime = Date.now()
  
  // Importar utilitários de diagnóstico do Vercel
  const { safeVercelOperation, logVercelInfo } = await import('../../utils/vercel-diagnostics')
  
  logVercelInfo('Iniciando geração de holerites')
  
  try {
    const supabase = await serverSupabaseClient(event)
    const user = await serverSupabaseUser(event)

    // O Supabase retorna o ID no campo 'sub', não 'id'
    const userId = user?.sub || user?.id

    console.log('🔍 [GERAR HOLERITES] User ID:', userId)

    if (!user || !userId) {
      throw createError({
        statusCode: 401,
        message: 'Não autenticado. Faça logout e login novamente.',
      })
    }

    // Verificar se é admin
    const { data: userData, error: userError } = await supabase
      .from('app_users')
      .select('id, role, email')
      .eq('auth_uid', userId)
      .single()

    if (userError || !userData) {
      console.error('[GERAR HOLERITES] Erro ao buscar usuário:', userError)
      throw createError({
        statusCode: 403,
        message: 'Usuário não encontrado no sistema',
      })
    }

    if (userData.role !== 'admin') {
      throw createError({
        statusCode: 403,
        message: `Acesso negado. Seu perfil é: ${userData.role}. Necessário: admin`,
      })
    }

    console.log('✅ [GERAR HOLERITES] Usuário autorizado:', userData.email)

    const body = await readBody(event).catch(() => {
      throw createError({
        statusCode: 400,
        message: 'Corpo da requisição inválido',
      })
    })

    const { mes, ano, colaborador_ids } = body

    if (!mes || !ano) {
      throw createError({
        statusCode: 400,
        message: 'Mês e ano são obrigatórios',
      })
    }

    // Validar formato
    const mesNum = parseInt(mes)
    const anoNum = parseInt(ano)

    if (isNaN(mesNum) || mesNum < 1 || mesNum > 12) {
      throw createError({
        statusCode: 400,
        message: 'Mês inválido. Deve ser entre 1 e 12.',
      })
    }

    if (isNaN(anoNum) || anoNum < 2020 || anoNum > 2100) {
      throw createError({
        statusCode: 400,
        message: 'Ano inválido. Deve ser entre 2020 e 2100.',
      })
    }
    // Buscar parâmetros da folha
    const { data: parametros } = await supabase
      .from('parametros_folha')
      .select('*')
      .single()

    if (!parametros) {
      throw new Error('Parâmetros da folha não configurados')
    }

    // Buscar colaboradores com cargo e departamento
    console.log('🔍 Buscando colaboradores...')
    console.log('   IDs específicos:', colaborador_ids)
    
    let query = supabase
      .from('colaboradores')
      .select(`
        *,
        cargo:cargos(nome),
        departamento:departamentos!colaboradores_departamento_id_fkey(nome)
      `)

    if (colaborador_ids && colaborador_ids.length > 0) {
      query = query.in('id', colaborador_ids)
    }

    const { data: colaboradores, error: colabError } = await query

    console.log('📋 Colaboradores encontrados:', colaboradores?.length || 0)
    if (colaboradores && colaboradores.length > 0) {
      colaboradores.forEach(c => {
        console.log(`   - ${c.nome}: salário = ${c.salario}`)
      })
    }

    if (colabError) {
      console.error('❌ Erro ao buscar colaboradores:', colabError)
      throw colabError
    }
    
    if (!colaboradores || colaboradores.length === 0) {
      throw new Error('Nenhum colaborador encontrado')
    }

    const holeritesGerados: any[] = []
    const erros: any[] = []

    // Processar colaboradores em lotes para evitar timeout
    const BATCH_SIZE = 5 // Processar 5 colaboradores por vez
    const batches = []
    
    for (let i = 0; i < colaboradores.length; i += BATCH_SIZE) {
      batches.push(colaboradores.slice(i, i + BATCH_SIZE))
    }
    
    logVercelInfo(`Processando ${colaboradores.length} colaboradores em ${batches.length} lotes`)
    
    // Processar cada lote
    for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
      const batch = batches[batchIndex]
      logVercelInfo(`Processando lote ${batchIndex + 1}/${batches.length} (${batch.length} colaboradores)`)
      
      // Verificar se ainda temos tempo (máximo 45 segundos para ser seguro)
      const elapsedTime = Date.now() - startTime
      if (elapsedTime > 45000) {
        console.warn('⚠️ Timeout preventivo - interrompendo processamento')
        erros.push({
          colaborador: 'Sistema',
          erro: `Timeout preventivo após ${Math.round(elapsedTime/1000)}s. Processados ${holeritesGerados.length} de ${colaboradores.length} colaboradores.`
        })
        break
      }
      
      // Processar colaboradores do lote atual
      for (const colab of batch) {
      try {
        console.log(`\n${'='.repeat(60)}`)
        console.log('📋 Processando colaborador:', colab.nome)
        console.log('💰 Salário do colaborador:', colab.salario)
        console.log(`${'='.repeat(60)}`)
        
        // Calcular valores - verificar se tem salário
        const salarioBase = parseFloat(colab.salario || 0)
        
        if (!salarioBase || salarioBase <= 0) {
          console.warn(`⚠️ Colaborador ${colab.nome} sem salário definido`)
          erros.push({
            colaborador: colab.nome,
            erro: 'Colaborador sem salário definido. Configure o salário antes de gerar o holerite.',
          })
          continue // Pula para o próximo colaborador
        }
        
        console.log('✅ Salário base válido:', salarioBase)
        
        // Calcular INSS (progressivo - tabela 2024 OFICIAL)
        const faixasINSS = [
          { limite: 1412.00, aliquota: 0.075 },
          { limite: 2666.68, aliquota: 0.09 },
          { limite: 4000.03, aliquota: 0.12 },
          { limite: 7786.02, aliquota: 0.14 },
        ]

        const tetoINSS = 908.85 // Teto INSS 2024
        let inss = 0
        let salarioRestante = salarioBase

        for (let i = 0; i < faixasINSS.length; i++) {
          const faixaAnterior = i > 0 ? faixasINSS[i - 1].limite : 0
          const faixaAtual = faixasINSS[i].limite
          const valorFaixa = Math.min(salarioRestante, faixaAtual - faixaAnterior)
          
          if (valorFaixa > 0) {
            inss += valorFaixa * faixasINSS[i].aliquota
            salarioRestante -= valorFaixa
          }
          
          if (salarioRestante <= 0) break
        }

        // Aplicar teto
        inss = Math.min(inss, tetoINSS)

        // Calcular IRRF (tabela progressiva + Lei 15.270/2025)
        const dependentes = colab.dependentes || 0 // Usar dependentes do colaborador
        const resultadoIRRF = calcularIRRFComRedutor(salarioBase, inss, dependentes, salarioBase)
        const irrf = resultadoIRRF.valor

        // Calcular FGTS (8% - pago pela empresa)
        const fgts = salarioBase * 0.08

        // Verificar se existe adiantamento pago no MÊS ANTERIOR
        // Exemplo: Se estamos gerando holerite de Janeiro, buscar adiantamento de Dezembro
        let mesAnterior = parseInt(mes) - 1
        let anoAnterior = parseInt(ano)
        
        if (mesAnterior === 0) {
          mesAnterior = 12
          anoAnterior = anoAnterior - 1
        }
        
        const mesAnteriorStr = mesAnterior.toString().padStart(2, '0')
        
        const { data: adiantamentoPago } = await supabase
          .from('holerites')
          .select('salario_liquido, valor_adiantamento')
          .eq('colaborador_id', colab.id)
          .eq('mes', mesAnteriorStr)
          .eq('ano', anoAnterior)
          .eq('tipo', 'adiantamento')
          .maybeSingle()

        const valorAdiantamento = adiantamentoPago 
          ? parseFloat(adiantamentoPago.salario_liquido || adiantamentoPago.valor_adiantamento || 0)
          : 0

        if (valorAdiantamento > 0) {
          console.log(`   💳 Adiantamento do mês anterior (${mesAnteriorStr}/${anoAnterior}): R$ ${valorAdiantamento.toFixed(2)}`)
        }

        // Calcular dias trabalhados no mês
        const diasTrabalhados = calcularDiasTrabalhados(colab.data_admissao, mes, ano)
        
        // Totais
        const totalProventos = salarioBase
        const totalDescontos = inss + irrf + valorAdiantamento
        const salarioLiquido = totalProventos - totalDescontos

        // Verificar se já existe holerite MENSAL para este período
        // IMPORTANTE: Filtrar por tipo='mensal' para não sobrescrever holerites de 13º
        const { data: holeriteExistente } = await supabase
          .from('holerites')
          .select('id')
          .eq('colaborador_id', colab.id)
          .eq('mes', mes)
          .eq('ano', ano)
          .eq('tipo', 'mensal')
          .maybeSingle()

        // Preparar observações
        let observacoes = `Salário Mensal - ${mes}/${ano}`
        if (valorAdiantamento > 0) {
          observacoes += `\n\n💳 ADIANTAMENTO DESCONTADO:\nValor pago em ${parametros.adiantamento_dia_pagamento || 20}/${mesAnteriorStr}/${anoAnterior}: R$ ${valorAdiantamento.toFixed(2)}`
        }

        const holeriteData = {
          colaborador_id: colab.id,
          mes,
          ano,
          tipo: 'mensal', // IMPORTANTE: Definir tipo para diferenciar de holerites de 13º
          nome_colaborador: colab.nome || 'Não informado',
          cpf: colab.cpf || '',
          cargo: (colab as any).cargo?.nome || 'Não informado',
          departamento: (colab as any).departamento?.nome || 'Não informado',
          salario_base: salarioBase,
          total_proventos: totalProventos,
          inss,
          irrf,
          total_descontos: totalDescontos,
          salario_bruto: totalProventos,
          salario_liquido: salarioLiquido,
          fgts,
          valor_adiantamento: valorAdiantamento,
          dias_trabalhados: diasTrabalhados,
          banco: colab.banco || null,
          agencia: colab.agencia || null,
          conta: colab.conta || null,
          data_admissao: colab.data_admissao || null,
          observacoes,
          status: 'gerado',
          gerado_por: userData.id,
          gerado_em: new Date().toISOString(),
        }

        let resultado
        if (holeriteExistente) {
          // Atualizar holerite existente
          const { data, error } = await supabase
            .from('holerites')
            .update(holeriteData)
            .eq('id', holeriteExistente.id)
            .select()
            .single()

          if (error) throw error
          resultado = data
        } else {
          // Criar novo holerite
          const { data, error } = await supabase
            .from('holerites')
            .insert(holeriteData)
            .select()
            .single()

          if (error) throw error
          resultado = data
        }

        holeritesGerados.push(resultado)
        console.log(`✅ Holerite MENSAL gerado para ${colab.nome}`)
        console.log(`   💰 Salário Bruto: R$ ${totalProventos.toFixed(2)}`)
        console.log(`   💳 INSS: R$ ${inss.toFixed(2)}`)
        console.log(`   💳 IRRF: R$ ${irrf.toFixed(2)}`)
        if (valorAdiantamento > 0) {
          console.log(`   💳 Adiantamento: R$ ${valorAdiantamento.toFixed(2)}`)
        }
        console.log(`   💰 Salário Líquido: R$ ${salarioLiquido.toFixed(2)}`)
      } catch (error: any) {
        console.error(`❌ Erro ao gerar holerite para ${colab.nome}:`, error.message)
        erros.push({
          colaborador: colab.nome,
          erro: error.message,
        })
      }
      }
      
      // Pequena pausa entre lotes para não sobrecarregar
      if (batchIndex < batches.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 100))
      }
    }

    console.log(`\n${'='.repeat(60)}`)
    console.log('📊 RESUMO DA GERAÇÃO DE HOLERITES MENSAIS')
    console.log(`${'='.repeat(60)}`)
    console.log(`✅ Holerites gerados: ${holeritesGerados.length}`)
    console.log(`❌ Erros: ${erros.length}`)
    console.log(`📅 Período: ${mes}/${ano}`)
    console.log(`📋 Tipo: SALÁRIO MENSAL`)
    if (erros.length > 0) {
      console.log('\n⚠️ Detalhes dos erros:')
      erros.forEach(e => console.log(`   - ${e.colaborador}: ${e.erro}`))
    }
    console.log(`${'='.repeat(60)}\n`)

    const duration = Date.now() - startTime
    console.log(`✅ [GERAR HOLERITES] Concluído em ${duration}ms - ${holeritesGerados.length} gerados, ${erros.length} erros`)

    return {
      success: true,
      data: {
        total_gerados: holeritesGerados.length,
        total_erros: erros.length,
        holerites: holeritesGerados,
        erros,
      },
    }
  } catch (error: any) {
    const duration = Date.now() - startTime
    console.error(`❌ [GERAR HOLERITES] Erro após ${duration}ms:`, error.message || error)
    
    // Se já é um erro do createError, apenas repassa
    if (error.statusCode) {
      throw error
    }
    
    // Caso contrário, cria um novo erro
    throw createError({
      statusCode: 500,
      message: error.message || 'Erro ao gerar holerites',
    })
  }
})

// Função auxiliar para calcular dias trabalhados no mês
function calcularDiasTrabalhados(dataAdmissao: string | null, mes: string, ano: string): number {
  if (!dataAdmissao) return 30 // Padrão se não tiver data de admissão
  
  const admissao = new Date(dataAdmissao + 'T00:00:00')
  const mesNum = parseInt(mes)
  const anoNum = parseInt(ano)
  
  // Primeiro e último dia do mês
  const primeiroDiaMes = new Date(anoNum, mesNum - 1, 1)
  const ultimoDiaMes = new Date(anoNum, mesNum, 0)
  
  // Se foi admitido depois do mês em questão, não trabalhou
  if (admissao > ultimoDiaMes) return 0
  
  // Se foi admitido antes do mês, trabalhou o mês todo
  if (admissao < primeiroDiaMes) return ultimoDiaMes.getDate()
  
  // Foi admitido durante o mês - contar dias a partir da admissão
  const diasTrabalhados = ultimoDiaMes.getDate() - admissao.getDate() + 1
  return Math.max(0, diasTrabalhados)
}
