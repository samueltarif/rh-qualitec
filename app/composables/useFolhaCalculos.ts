/**
 * ============================================================================
 * COMPOSABLE DE CÁLCULOS DA FOLHA DE PAGAMENTO
 * ============================================================================
 * 
 * Implementa cálculos de INSS e IRRF conforme legislação vigente.
 * IRRF atualizado para Lei 15.270/2025 (válida a partir de 01/01/2026).
 */

// Configuração do IRRF - Lei 15.270/2025
const IRRF_CONFIG = {
  tabela: {
    faixas: [
      { limite: 2259.20, aliquota: 0, deducao: 0 },
      { limite: 2826.65, aliquota: 0.075, deducao: 169.44 },
      { limite: 3751.05, aliquota: 0.15, deducao: 381.44 },
      { limite: 4664.68, aliquota: 0.225, deducao: 662.77 },
      { limite: Infinity, aliquota: 0.275, deducao: 896.00 },
    ],
    deducaoPorDependente: 189.59,
  },
  lei15270: {
    vigenciaInicio: new Date('2026-01-01'),
    limiteIsencaoTotal: 5000.00,
    limiteFaixaTransicao: 7350.00,
    redutorMaximo: 312.89,
    coeficienteReducao: 0.133145,
    constanteReducao: 978.62,
  },
}

export const useFolhaCalculos = () => {
  // Calcular INSS progressivo (tabela 2024) - VERSÃO OFICIAL CORRIGIDA
  const calcularINSS = (salarioBruto: number): number => {
    const faixas = [
      { limite: 1412.00, aliquota: 0.075 },
      { limite: 2666.68, aliquota: 0.09 },
      { limite: 4000.03, aliquota: 0.12 },
      { limite: 7786.02, aliquota: 0.14 },
    ]

    const teto = 908.85 // Teto INSS 2024
    let inss = 0
    let salarioRestante = salarioBruto

    for (let i = 0; i < faixas.length; i++) {
      const faixaAtualObj = faixas[i]
      if (!faixaAtualObj) continue
      
      const faixaAnterior = i > 0 ? (faixas[i - 1]?.limite ?? 0) : 0
      const faixaAtual = faixaAtualObj.limite
      const valorFaixa = Math.min(salarioRestante, faixaAtual - faixaAnterior)
      
      if (valorFaixa > 0) {
        inss += valorFaixa * faixaAtualObj.aliquota
        salarioRestante -= valorFaixa
      }
      
      if (salarioRestante <= 0) break
    }

    // Aplicar teto e arredondar para 2 casas decimais
    return parseFloat(Math.min(inss, teto).toFixed(2))
  }

  /**
   * Calcula o redutor da Lei 15.270/2025
   */
  const calcularRedutorLei15270 = (rendimentosTributaveis: number): number => {
    const config = IRRF_CONFIG.lei15270
    
    if (rendimentosTributaveis <= config.limiteIsencaoTotal) {
      return config.redutorMaximo
    }
    
    if (rendimentosTributaveis <= config.limiteFaixaTransicao) {
      const redutor = config.constanteReducao - (config.coeficienteReducao * rendimentosTributaveis)
      return Math.max(0, parseFloat(redutor.toFixed(2)))
    }
    
    return 0
  }

  /**
   * Verifica se a Lei 15.270/2025 está em vigor
   */
  const isLei15270EmVigor = (data?: Date): boolean => {
    const dataRef = data ?? new Date()
    return dataRef >= IRRF_CONFIG.lei15270.vigenciaInicio
  }

  /**
   * Calcular IRRF progressivo com redutor da Lei 15.270/2025
   * 
   * @param salarioBruto - Salário bruto
   * @param inss - Valor do INSS
   * @param dependentes - Número de dependentes
   * @param rendimentosTributaveisNoMes - Rendimentos tributáveis totais (opcional)
   * @returns Valor do IRRF após aplicação do redutor
   */
  const calcularIRRF = (
    salarioBruto: number, 
    inss: number, 
    dependentes: number,
    rendimentosTributaveisNoMes?: number
  ): number => {
    const config = IRRF_CONFIG
    const rendimentosTributaveis = rendimentosTributaveisNoMes ?? salarioBruto
    
    // Calcular base de cálculo
    const deducaoDependentes = dependentes * config.tabela.deducaoPorDependente
    const baseCalculo = Math.max(0, salarioBruto - inss - deducaoDependentes)

    // Calcular IRRF pela tabela progressiva
    let irrfTabela = 0
    for (const faixa of config.tabela.faixas) {
      if (baseCalculo <= faixa.limite) {
        if (faixa.aliquota > 0) {
          irrfTabela = baseCalculo * faixa.aliquota - faixa.deducao
        }
        break
      }
    }
    irrfTabela = Math.max(0, irrfTabela)

    // Aplicar redutor da Lei 15.270/2025 se em vigor
    let irrfFinal = irrfTabela
    if (isLei15270EmVigor() && irrfTabela > 0) {
      const redutorCalculado = calcularRedutorLei15270(rendimentosTributaveis)
      const redutorAplicado = Math.min(irrfTabela, redutorCalculado)
      irrfFinal = Math.max(0, irrfTabela - redutorAplicado)
    }

    return parseFloat(irrfFinal.toFixed(2))
  }

  /**
   * Calcular IRRF com detalhes completos (para auditoria e holerite)
   */
  const calcularIRRFDetalhado = (
    salarioBruto: number,
    inss: number,
    dependentes: number,
    rendimentosTributaveisNoMes?: number
  ) => {
    const config = IRRF_CONFIG
    const rendimentosTributaveis = rendimentosTributaveisNoMes ?? salarioBruto
    
    // Calcular base de cálculo
    const deducaoDependentes = dependentes * config.tabela.deducaoPorDependente
    const baseCalculo = Math.max(0, salarioBruto - inss - deducaoDependentes)

    // Calcular IRRF pela tabela progressiva
    let irrfTabela = 0
    let faixaAplicada = 'Isento'
    let aliquota = 0
    let parcelaADeduzir = 0
    
    for (const faixa of config.tabela.faixas) {
      if (baseCalculo <= faixa.limite) {
        aliquota = faixa.aliquota
        parcelaADeduzir = faixa.deducao
        if (faixa.aliquota > 0) {
          irrfTabela = baseCalculo * faixa.aliquota - faixa.deducao
          faixaAplicada = `${(faixa.aliquota * 100).toFixed(1)}%`
        }
        break
      }
    }
    irrfTabela = Math.max(0, irrfTabela)

    // Aplicar redutor da Lei 15.270/2025
    let redutorCalculado = 0
    let redutorAplicado = 0
    const lei15270Aplicada = isLei15270EmVigor() && irrfTabela > 0
    
    if (lei15270Aplicada) {
      redutorCalculado = calcularRedutorLei15270(rendimentosTributaveis)
      redutorAplicado = Math.min(irrfTabela, redutorCalculado)
    }

    const irrfFinal = Math.max(0, irrfTabela - redutorAplicado)

    return {
      valor: parseFloat(irrfFinal.toFixed(2)),
      detalhes: {
        salarioBruto,
        inss,
        dependentes,
        deducaoDependentes: parseFloat(deducaoDependentes.toFixed(2)),
        baseCalculo: parseFloat(baseCalculo.toFixed(2)),
        rendimentosTributaveis,
        faixaAplicada,
        aliquota,
        parcelaADeduzir,
        irrfTabela: parseFloat(irrfTabela.toFixed(2)),
        redutorCalculado: parseFloat(redutorCalculado.toFixed(2)),
        redutorAplicado: parseFloat(redutorAplicado.toFixed(2)),
        irrfFinal: parseFloat(irrfFinal.toFixed(2)),
        lei15270Aplicada,
      }
    }
  }

  // Formatar moeda
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value)
  }

  // Formatar CPF
  const formatCPF = (cpf: string) => {
    if (!cpf) return '-'
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
  }

  // Nome do mês
  const nomeMes = (mes: string) => {
    const meses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']
    return meses[parseInt(mes) - 1]
  }

  return {
    calcularINSS,
    calcularIRRF,
    calcularIRRFDetalhado,
    calcularRedutorLei15270,
    isLei15270EmVigor,
    formatCurrency,
    formatCPF,
    nomeMes,
    IRRF_CONFIG,
  }
}
