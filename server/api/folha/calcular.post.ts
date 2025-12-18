import { calcularIRRF as calcularIRRFComRedutor } from '../../utils/irrf-lei-15270-2025'

/**
 * API para calcular folha de pagamento
 * Recebe mês e ano e retorna cálculos detalhados
 * 
 * IRRF calculado conforme Lei 15.270/2025 (válida a partir de 01/01/2026)
 */
export default defineEventHandler(async (event) => {
  const startTime = Date.now()
  
  try {
    // Validar body
    const body = await readBody(event).catch(() => {
      throw createError({ 
        statusCode: 400, 
        message: 'Corpo da requisição inválido ou ausente' 
      })
    })

    const { mes, ano } = body

    // Validar campos obrigatórios
    if (!mes || !ano) {
      throw createError({ 
        statusCode: 400, 
        message: 'Campos obrigatórios ausentes: mes e ano são necessários' 
      })
    }

    // Validar formato dos campos
    const mesNum = parseInt(mes)
    const anoNum = parseInt(ano)

    if (isNaN(mesNum) || mesNum < 1 || mesNum > 12) {
      throw createError({ 
        statusCode: 400, 
        message: 'Mês inválido. Deve ser entre 1 e 12.' 
      })
    }

    if (isNaN(anoNum) || anoNum < 2020 || anoNum > 2100) {
      throw createError({ 
        statusCode: 400, 
        message: 'Ano inválido. Deve ser entre 2020 e 2100.' 
      })
    }

    const config = useRuntimeConfig()
    const supabaseUrl = config.public.supabaseUrl
    const serviceKey = config.supabaseServiceKey

    if (!serviceKey) {
      throw createError({ statusCode: 500, message: 'Service key não configurada' })
    }

    const headers = { 'Authorization': `Bearer ${serviceKey}`, 'apikey': serviceKey }

    // Buscar colaboradores ativos com benefícios
    const colaboradores = await $fetch<any[]>(
      `${supabaseUrl}/rest/v1/colaboradores?select=id,nome,cpf,cargo_id,departamento_id,salario,status,data_admissao,data_desligamento,recebe_vt,valor_vt,recebe_vr,valor_vr,recebe_va,valor_va,recebe_va_vr,valor_va_vr&status=eq.Ativo`,
      { headers }
    ).catch((error) => {
      console.error('[CALCULAR FOLHA] Erro ao buscar colaboradores:', error)
      throw createError({
        statusCode: 500,
        message: 'Erro ao buscar colaboradores. Verifique a conexão com o banco de dados.',
      })
    })

    if (!colaboradores || colaboradores.length === 0) {
      console.warn('[CALCULAR FOLHA] Nenhum colaborador ativo encontrado', { mes, ano })
      throw createError({
        statusCode: 404,
        message: 'Nenhum colaborador ativo encontrado para calcular a folha.',
      })
    }

    // Buscar adiantamentos do MÊS ANTERIOR para descontar
    // Exemplo: Se estamos calculando Janeiro/2025, buscar adiantamentos de Dezembro/2024
    let mesAnterior = parseInt(mes) - 1
    let anoAnterior = parseInt(ano)
    
    if (mesAnterior === 0) {
      mesAnterior = 12
      anoAnterior = anoAnterior - 1
    }
    
    const mesAnteriorStr = mesAnterior.toString().padStart(2, '0')
    
    const adiantamentos = await $fetch<any[]>(
      `${supabaseUrl}/rest/v1/holerites?select=colaborador_id,salario_liquido,valor_adiantamento&tipo=eq.adiantamento&mes=eq.${mesAnteriorStr}&ano=eq.${anoAnterior}`,
      { headers }
    ).catch(() => []) // Se não houver adiantamentos, retorna array vazio

    console.log(`🔍 Buscando adiantamentos de ${mesAnteriorStr}/${anoAnterior} para descontar em ${mes}/${ano}`)
    console.log(`📋 Adiantamentos encontrados: ${adiantamentos.length}`)

    // Criar mapa de adiantamentos por colaborador
    const adiantamentosPorColaborador = new Map()
    adiantamentos.forEach(adiant => {
      const valor = parseFloat(adiant.salario_liquido || adiant.valor_adiantamento || 0)
      adiantamentosPorColaborador.set(adiant.colaborador_id, valor)
      console.log(`   💳 Colaborador ${adiant.colaborador_id}: R$ ${valor.toFixed(2)}`)
    })

    // Calcular folha para cada colaborador
    const folhaCalculada = colaboradores.map(colab => {
      const salarioBruto = parseFloat(colab.salario) || 0

      // INSS (progressivo - tabela 2024 OFICIAL)
      const faixasINSS = [
        { limite: 1412.00, aliquota: 0.075 },
        { limite: 2666.68, aliquota: 0.09 },
        { limite: 4000.03, aliquota: 0.12 },
        { limite: 7786.02, aliquota: 0.14 },
      ]

      const tetoINSS = 908.85 // Teto INSS 2024
      let inss = 0
      let salarioRestante = salarioBruto

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

      // IRRF (progressivo - tabela 2024 + Lei 15.270/2025)
      const dependentes = 0 // Assumir 0 dependentes se não informado
      const resultadoIRRF = calcularIRRFComRedutor(salarioBruto, inss, dependentes, salarioBruto)
      const irrf = resultadoIRRF.valor

      // FGTS (8% - pago pelo empregador, não desconta do salário)
      const fgts = salarioBruto * 0.08

      // Benefícios (proventos pagos pela empresa)
      const valeTransporte = colab.recebe_vt ? (parseFloat(colab.valor_vt) || 0) : 0
      const valeRefeicao = colab.recebe_vr ? (parseFloat(colab.valor_vr) || 0) : 0
      const valeAlimentacao = colab.recebe_va ? (parseFloat(colab.valor_va) || 0) : 0
      const valeVaVr = colab.recebe_va_vr ? (parseFloat(colab.valor_va_vr) || 0) : 0
      const totalBeneficios = valeTransporte + valeRefeicao + valeAlimentacao + valeVaVr

      // Buscar adiantamento do mês anterior para descontar
      const adiantamento = adiantamentosPorColaborador.get(colab.id) || 0

      // Salário líquido (com desconto de adiantamento do mês anterior)
      const totalDescontos = inss + irrf + adiantamento
      const salarioLiquido = salarioBruto - totalDescontos

      return {
        colaborador_id: colab.id,
        nome: colab.nome,
        cpf: colab.cpf,
        cargo_id: colab.cargo_id,
        departamento_id: colab.departamento_id,
        salario_bruto: salarioBruto,
        inss: parseFloat(inss.toFixed(2)),
        irrf: parseFloat(irrf.toFixed(2)),
        fgts: parseFloat(fgts.toFixed(2)),
        adiantamento: parseFloat(adiantamento.toFixed(2)),
        total_descontos: parseFloat(totalDescontos.toFixed(2)),
        salario_liquido: parseFloat(salarioLiquido.toFixed(2)),
        total_beneficios: parseFloat(totalBeneficios.toFixed(2)),
      }
    })

    // Totalizadores
    const totais = {
      total_colaboradores: folhaCalculada.length,
      total_salario_bruto: folhaCalculada.reduce((acc, f) => acc + f.salario_bruto, 0),
      total_inss: folhaCalculada.reduce((acc, f) => acc + f.inss, 0),
      total_irrf: folhaCalculada.reduce((acc, f) => acc + f.irrf, 0),
      total_fgts: folhaCalculada.reduce((acc, f) => acc + f.fgts, 0),
      total_adiantamento: folhaCalculada.reduce((acc, f) => acc + f.adiantamento, 0),
      total_descontos: folhaCalculada.reduce((acc, f) => acc + f.total_descontos, 0),
      total_salario_liquido: folhaCalculada.reduce((acc, f) => acc + f.salario_liquido, 0),
      total_beneficios: folhaCalculada.reduce((acc, f) => acc + f.total_beneficios, 0),
      custo_empresa: 0, // Será calculado abaixo
    }

    // Custo total para empresa (salário bruto + FGTS + benefícios)
    totais.custo_empresa = totais.total_salario_bruto + totais.total_fgts + totais.total_beneficios

    const duration = Date.now() - startTime
    console.log(`✅ [CALCULAR FOLHA] Sucesso em ${duration}ms - ${folhaCalculada.length} colaboradores processados`)

    return {
      success: true,
      data: {
        mes,
        ano,
        data_calculo: new Date().toISOString(),
        folha: folhaCalculada,
        totais: {
          ...totais,
          total_salario_bruto: parseFloat(totais.total_salario_bruto.toFixed(2)),
          total_inss: parseFloat(totais.total_inss.toFixed(2)),
          total_irrf: parseFloat(totais.total_irrf.toFixed(2)),
          total_fgts: parseFloat(totais.total_fgts.toFixed(2)),
          total_adiantamento: parseFloat(totais.total_adiantamento.toFixed(2)),
          total_descontos: parseFloat(totais.total_descontos.toFixed(2)),
          total_salario_liquido: parseFloat(totais.total_salario_liquido.toFixed(2)),
          total_beneficios: parseFloat(totais.total_beneficios.toFixed(2)),
          custo_empresa: parseFloat(totais.custo_empresa.toFixed(2)),
        }
      }
    }
  } catch (error: any) {
    const duration = Date.now() - startTime
    console.error(`❌ [CALCULAR FOLHA] Erro após ${duration}ms:`, error.message || error)
    
    throw createError({ 
      statusCode: error.statusCode || 500, 
      message: error.message || 'Erro ao calcular folha de pagamento' 
    })
  }
})
