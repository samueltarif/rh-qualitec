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
      const faixaAnterior = i > 0 ? faixas[i - 1].limite : 0
      const faixaAtual = faixas[i].limite
      const valorFaixa = Math.min(salarioRestante, faixaAtual - faixaAnterior)
      
      if (valorFaixa > 0) {
        inss += valorFaixa * faixas[i].aliquota
        salarioRestante -= valorFaixa
      }
      
      if (salarioRestante <= 0) break
    }

    // Aplicar teto e arredondar para 2 casas decimais
    return parseFloat(Math.min(inss, teto).toFixed(2))
  }

  // Calcular IRRF progressivo (tabela 2024) - VERSÃO OFICIAL CORRIGIDA
  const calcularIRRF = (salarioBruto: number, inss: number, dependentes: number): number => {
    const deducaoPorDependente = 189.59
    const baseCalculo = salarioBruto - inss - (dependentes * deducaoPorDependente)

    if (baseCalculo <= 2259.20) return 0

    let irrf = 0
    if (baseCalculo <= 2826.65) {
      irrf = baseCalculo * 0.075 - 169.44
    } else if (baseCalculo <= 3751.05) {
      irrf = baseCalculo * 0.15 - 381.44
    } else if (baseCalculo <= 4664.68) {
      irrf = baseCalculo * 0.225 - 662.77
    } else {
      irrf = baseCalculo * 0.275 - 896.00
    }

    // Arredondar para 2 casas decimais e garantir que não seja negativo
    return parseFloat(Math.max(0, irrf).toFixed(2))
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
    formatCurrency,
    formatCPF,
    nomeMes,
  }
}
