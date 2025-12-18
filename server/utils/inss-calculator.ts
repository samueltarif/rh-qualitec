/**
 * CALCULADORA DE INSS 2025
 * Tabela progressiva de contribuição ao INSS
 */

// Tabela INSS 2025 (valores atualizados)
const TABELA_INSS_2025 = [
  { ate: 1412.00, aliquota: 0.075 },  // 7,5%
  { ate: 2666.68, aliquota: 0.09 },   // 9%
  { ate: 4000.03, aliquota: 0.12 },   // 12%
  { ate: 7786.02, aliquota: 0.14 }    // 14%
]

/**
 * Calcula o INSS sobre o salário usando tabela progressiva
 * @param salarioBruto Salário bruto do colaborador
 * @returns Valor do INSS a descontar
 */
export function calcularINSS(salarioBruto: number): number {
  if (!salarioBruto || salarioBruto <= 0) {
    return 0
  }

  let inss = 0
  let salarioRestante = salarioBruto
  let faixaAnterior = 0

  for (const faixa of TABELA_INSS_2025) {
    if (salarioRestante <= 0) break

    const limiteAtual = faixa.ate
    const valorFaixa = Math.min(salarioRestante, limiteAtual - faixaAnterior)
    
    inss += valorFaixa * faixa.aliquota
    salarioRestante -= valorFaixa
    faixaAnterior = limiteAtual

    // Se o salário está dentro desta faixa, para o cálculo
    if (salarioBruto <= limiteAtual) break
  }

  return Math.round(inss * 100) / 100 // Arredonda para 2 casas decimais
}

/**
 * Calcula a alíquota efetiva de INSS
 * @param salarioBruto Salário bruto do colaborador
 * @returns Alíquota efetiva em percentual
 */
export function calcularAliquotaEfetivaINSS(salarioBruto: number): number {
  const inss = calcularINSS(salarioBruto)
  if (salarioBruto <= 0) return 0
  return (inss / salarioBruto) * 100
}

/**
 * Retorna informações detalhadas do cálculo de INSS
 * @param salarioBruto Salário bruto do colaborador
 * @returns Objeto com detalhes do cálculo
 */
export function calcularINSSDetalhado(salarioBruto: number) {
  const valorINSS = calcularINSS(salarioBruto)
  const aliquotaEfetiva = calcularAliquotaEfetivaINSS(salarioBruto)
  
  return {
    salarioBruto,
    valorINSS,
    aliquotaEfetiva,
    salarioBase: salarioBruto - valorINSS
  }
}
