/**
 * ============================================================================
 * CÁLCULO DE IRRF - LEI 15.270/2025
 * ============================================================================
 * 
 * Este módulo implementa o cálculo de IRRF conforme a Lei nº 15.270/2025,
 * válida a partir de 01/01/2026.
 * 
 * REGRA DO REDUTOR LEGAL:
 * - Se rendimentos ≤ R$ 5.000,00 → Redutor = R$ 312,89
 * - Se rendimentos entre R$ 5.000,01 e R$ 7.350,00 → Redutor = 978,62 − (0,133145 × rendimentos)
 * - Se rendimentos > R$ 7.350,00 → Redutor = 0
 * 
 * FÓRMULA FINAL:
 * IR_Final = max(0, IR_Tabela − min(IR_Tabela, Redutor))
 * 
 * @author Sistema de Folha de Pagamento
 * @version 1.0.0
 * @since 2025-12-17
 */

// ============================================================================
// CONFIGURAÇÃO - CONSTANTES LEGAIS
// ============================================================================

export const IRRF_CONFIG = {
  // Tabela Progressiva IRRF 2024/2025
  tabela: {
    faixas: [
      { limite: 2259.20, aliquota: 0, deducao: 0 },           // Isento
      { limite: 2826.65, aliquota: 0.075, deducao: 169.44 },  // 7,5%
      { limite: 3751.05, aliquota: 0.15, deducao: 381.44 },   // 15%
      { limite: 4664.68, aliquota: 0.225, deducao: 662.77 },  // 22,5%
      { limite: Infinity, aliquota: 0.275, deducao: 896.00 }, // 27,5%
    ],
    deducaoPorDependente: 189.59,
  },

  // Lei 15.270/2025 - Redutor Legal (válido a partir de 01/01/2026)
  lei15270: {
    vigenciaInicio: new Date('2026-01-01'),
    limiteIsencaoTotal: 5000.00,      // Até R$ 5.000,00 - redutor máximo
    limiteFaixaTransicao: 7350.00,    // Até R$ 7.350,00 - redutor parcial
    redutorMaximo: 312.89,            // Valor do redutor para rendimentos ≤ 5.000
    coeficienteReducao: 0.133145,     // Coeficiente para faixa de transição
    constanteReducao: 978.62,         // Constante para cálculo do redutor parcial
  },
}

// ============================================================================
// INTERFACES
// ============================================================================

export interface ResultadoIRRF {
  /** Valor do IRRF efetivamente retido (após aplicação do redutor) */
  valor: number
  
  /** Detalhes completos do cálculo para auditoria */
  detalhes: DetalhesCalculoIRRF
}

export interface DetalhesCalculoIRRF {
  /** Salário bruto informado */
  salarioBruto: number
  
  /** Valor do INSS descontado */
  inss: number
  
  /** Número de dependentes */
  dependentes: number
  
  /** Dedução total por dependentes */
  deducaoDependentes: number
  
  /** Base de cálculo do IRRF */
  baseCalculo: number
  
  /** Rendimentos tributáveis considerados para o redutor */
  rendimentosTributaveis: number
  
  /** Faixa da tabela progressiva aplicada */
  faixaAplicada: string
  
  /** Alíquota aplicada */
  aliquota: number
  
  /** Parcela a deduzir da tabela */
  parcelaADeduzir: number
  
  /** IRRF calculado pela tabela progressiva (antes do redutor) */
  irrfTabela: number
  
  /** Valor do redutor calculado conforme Lei 15.270/2025 */
  redutorCalculado: number
  
  /** Valor do redutor efetivamente aplicado (limitado ao IR da tabela) */
  redutorAplicado: number
  
  /** IRRF final após aplicação do redutor */
  irrfFinal: number
  
  /** Indica se a Lei 15.270/2025 foi aplicada */
  lei15270Aplicada: boolean
  
  /** Observações sobre o cálculo */
  observacoes: string[]
}

// ============================================================================
// FUNÇÃO PRINCIPAL DE CÁLCULO
// ============================================================================

/**
 * Calcula o IRRF conforme a tabela progressiva e aplica o redutor da Lei 15.270/2025.
 * 
 * @param salarioBruto - Salário bruto do colaborador
 * @param inss - Valor do INSS descontado
 * @param dependentes - Número de dependentes (padrão: 0)
 * @param rendimentosTributaveisNoMes - Rendimentos tributáveis totais no mês (opcional)
 *        Se não informado, assume o salário bruto.
 *        Para 13º salário, deve incluir salário do mês + 13º + outras verbas tributáveis.
 * @param dataReferencia - Data de referência para verificar vigência da lei (opcional)
 * @returns Objeto com valor do IRRF e detalhes completos do cálculo
 */
export function calcularIRRF(
  salarioBruto: number,
  inss: number,
  dependentes: number = 0,
  rendimentosTributaveisNoMes?: number,
  dataReferencia?: Date
): ResultadoIRRF {
  const config = IRRF_CONFIG
  const observacoes: string[] = []
  
  // Validações
  if (salarioBruto < 0) salarioBruto = 0
  if (inss < 0) inss = 0
  if (dependentes < 0) dependentes = 0
  
  // Se rendimentos tributáveis não informados, usar salário bruto
  const rendimentosTributaveis = rendimentosTributaveisNoMes ?? salarioBruto
  
  // Calcular dedução por dependentes
  const deducaoDependentes = dependentes * config.tabela.deducaoPorDependente
  
  // Calcular base de cálculo do IRRF
  const baseCalculo = Math.max(0, salarioBruto - inss - deducaoDependentes)
  
  // Encontrar faixa da tabela progressiva
  let faixaAplicada = 'Isento'
  let aliquota = 0
  let parcelaADeduzir = 0
  let irrfTabela = 0
  
  for (const faixa of config.tabela.faixas) {
    if (baseCalculo <= faixa.limite) {
      aliquota = faixa.aliquota
      parcelaADeduzir = faixa.deducao
      
      if (aliquota === 0) {
        faixaAplicada = `Isento (até R$ ${faixa.limite.toFixed(2)})`
        irrfTabela = 0
      } else {
        faixaAplicada = `${(aliquota * 100).toFixed(1)}% (até R$ ${faixa.limite.toFixed(2)})`
        irrfTabela = baseCalculo * aliquota - parcelaADeduzir
      }
      break
    }
  }
  
  // Garantir que IRRF da tabela não seja negativo
  irrfTabela = Math.max(0, irrfTabela)
  
  // Verificar se a Lei 15.270/2025 está em vigor
  const dataRef = dataReferencia ?? new Date()
  const lei15270EmVigor = dataRef >= config.lei15270.vigenciaInicio
  
  // Calcular redutor conforme Lei 15.270/2025
  let redutorCalculado = 0
  let redutorAplicado = 0
  let lei15270Aplicada = false
  
  if (lei15270EmVigor && irrfTabela > 0) {
    lei15270Aplicada = true
    
    if (rendimentosTributaveis <= config.lei15270.limiteIsencaoTotal) {
      // Rendimentos ≤ R$ 5.000,00 → Redutor máximo
      redutorCalculado = config.lei15270.redutorMaximo
      observacoes.push(`Rendimentos (R$ ${rendimentosTributaveis.toFixed(2)}) ≤ R$ ${config.lei15270.limiteIsencaoTotal.toFixed(2)}: Redutor máximo aplicado`)
      
    } else if (rendimentosTributaveis <= config.lei15270.limiteFaixaTransicao) {
      // Rendimentos entre R$ 5.000,01 e R$ 7.350,00 → Redutor parcial
      // Fórmula: 978,62 − (0,133145 × rendimentos)
      redutorCalculado = config.lei15270.constanteReducao - (config.lei15270.coeficienteReducao * rendimentosTributaveis)
      redutorCalculado = Math.max(0, redutorCalculado) // Nunca negativo
      observacoes.push(`Rendimentos (R$ ${rendimentosTributaveis.toFixed(2)}) na faixa de transição: Redutor parcial calculado`)
      
    } else {
      // Rendimentos > R$ 7.350,00 → Sem redutor
      redutorCalculado = 0
      observacoes.push(`Rendimentos (R$ ${rendimentosTributaveis.toFixed(2)}) > R$ ${config.lei15270.limiteFaixaTransicao.toFixed(2)}: Sem redutor`)
    }
    
    // Aplicar redutor (limitado ao valor do IR calculado)
    // Fórmula: IR_Final = max(0, IR_Tabela − min(IR_Tabela, Redutor))
    redutorAplicado = Math.min(irrfTabela, redutorCalculado)
  } else if (!lei15270EmVigor) {
    observacoes.push(`Lei 15.270/2025 ainda não em vigor (vigência: ${config.lei15270.vigenciaInicio.toLocaleDateString('pt-BR')})`)
  }
  
  // Calcular IRRF final
  // Fórmula: IR_Final = max(0, IR_Tabela − min(IR_Tabela, Redutor))
  const irrfFinal = Math.max(0, irrfTabela - redutorAplicado)
  
  // Arredondar para 2 casas decimais
  const valorFinal = parseFloat(irrfFinal.toFixed(2))
  
  // Adicionar observação sobre resultado
  if (irrfTabela > 0 && irrfFinal === 0) {
    observacoes.push('IRRF zerado pelo redutor da Lei 15.270/2025')
  } else if (redutorAplicado > 0) {
    observacoes.push(`Redutor aplicado: R$ ${redutorAplicado.toFixed(2)} (economia de ${((redutorAplicado / irrfTabela) * 100).toFixed(1)}%)`)
  }
  
  return {
    valor: valorFinal,
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
      irrfFinal: valorFinal,
      lei15270Aplicada,
      observacoes,
    },
  }
}

// ============================================================================
// FUNÇÕES AUXILIARES
// ============================================================================

/**
 * Calcula apenas o valor do IRRF (versão simplificada).
 * Útil para cálculos rápidos onde não são necessários os detalhes.
 */
export function calcularIRRFSimples(
  salarioBruto: number,
  inss: number,
  dependentes: number = 0,
  rendimentosTributaveisNoMes?: number
): number {
  return calcularIRRF(salarioBruto, inss, dependentes, rendimentosTributaveisNoMes).valor
}

/**
 * Calcula o redutor da Lei 15.270/2025 para um determinado valor de rendimentos.
 */
export function calcularRedutorLei15270(rendimentosTributaveis: number): number {
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
 * Verifica se a Lei 15.270/2025 está em vigor para uma determinada data.
 */
export function isLei15270EmVigor(data?: Date): boolean {
  const dataRef = data ?? new Date()
  return dataRef >= IRRF_CONFIG.lei15270.vigenciaInicio
}

/**
 * Retorna a configuração atual do IRRF (útil para exibição no frontend).
 */
export function getConfigIRRF() {
  return { ...IRRF_CONFIG }
}

// ============================================================================
// FUNÇÃO PARA AUDITORIA
// ============================================================================

export interface ResultadoAuditoriaIRRF {
  colaboradorId: string
  periodo: string
  valorAnterior: number
  valorCorreto: number
  diferenca: number
  detalhesCalculo: DetalhesCalculoIRRF
  necessitaCorrecao: boolean
  observacoes: string[]
}

/**
 * Audita o cálculo de IRRF de um colaborador e identifica divergências.
 */
export function auditarIRRF(
  colaboradorId: string,
  mes: string,
  ano: string,
  salarioBruto: number,
  inss: number,
  dependentes: number,
  irrfAtual: number,
  rendimentosTributaveisNoMes?: number
): ResultadoAuditoriaIRRF {
  const resultado = calcularIRRF(salarioBruto, inss, dependentes, rendimentosTributaveisNoMes)
  const diferenca = parseFloat((irrfAtual - resultado.valor).toFixed(2))
  const necessitaCorrecao = Math.abs(diferenca) > 0.01
  
  const observacoes: string[] = [...resultado.detalhes.observacoes]
  
  if (necessitaCorrecao) {
    if (diferenca > 0) {
      observacoes.push(`⚠️ IRRF atual (R$ ${irrfAtual.toFixed(2)}) está MAIOR que o correto. Diferença: R$ ${diferenca.toFixed(2)}`)
    } else {
      observacoes.push(`⚠️ IRRF atual (R$ ${irrfAtual.toFixed(2)}) está MENOR que o correto. Diferença: R$ ${Math.abs(diferenca).toFixed(2)}`)
    }
  } else {
    observacoes.push('✅ IRRF está correto')
  }
  
  return {
    colaboradorId,
    periodo: `${mes}/${ano}`,
    valorAnterior: irrfAtual,
    valorCorreto: resultado.valor,
    diferenca,
    detalhesCalculo: resultado.detalhes,
    necessitaCorrecao,
    observacoes,
  }
}
