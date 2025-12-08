export const use13SalarioCalculos = () => {
  // Tabela INSS 2024/2025
  const calcularINSS = (valorBase: number): number => {
    const faixas = [
      { limite: 1412.00, aliquota: 0.075 },
      { limite: 2666.68, aliquota: 0.09 },
      { limite: 4000.03, aliquota: 0.12 },
      { limite: 7786.02, aliquota: 0.14 }
    ]
    
    let inss = 0
    let valorRestante = valorBase
    let faixaAnterior = 0
    
    for (const faixa of faixas) {
      if (valorRestante <= 0) break
      
      const baseCalculo = Math.min(valorRestante, faixa.limite - faixaAnterior)
      inss += baseCalculo * faixa.aliquota
      valorRestante -= baseCalculo
      faixaAnterior = faixa.limite
    }
    
    const tetoINSS = 908.85
    return Math.min(inss, tetoINSS)
  }

  // Tabela IRRF 2024/2025
  const calcularIRRF = (valorBase: number, inss: number): number => {
    const baseCalculo = valorBase - inss
    
    if (baseCalculo <= 2259.20) return 0
    if (baseCalculo <= 2826.65) return (baseCalculo * 0.075) - 169.44
    if (baseCalculo <= 3751.05) return (baseCalculo * 0.15) - 381.44
    if (baseCalculo <= 4664.68) return (baseCalculo * 0.225) - 662.77
    return (baseCalculo * 0.275) - 896.00
  }

  // Calcular meses trabalhados
  const calcularMesesTrabalhados = (dataAdmissao: string, ano: number): number => {
    const admissao = new Date(dataAdmissao + 'T00:00:00')
    const anoAdmissao = admissao.getFullYear()
    const mesAdmissao = admissao.getMonth() + 1
    const diaAdmissao = admissao.getDate()

    if (anoAdmissao > ano) return 0
    if (anoAdmissao < ano) return 12

    if (diaAdmissao <= 15) {
      return 12 - mesAdmissao + 1
    } else {
      return 12 - mesAdmissao
    }
  }

  // Calcular valor do 13º
  const calcularValor13 = (salarioBase: number, mesesTrabalhados: number, parcela: string): number => {
    const meses = mesesTrabalhados || 12
    const valorProporcional = (salarioBase / 12) * meses
    
    if (parcela === '1') {
      return valorProporcional * 0.5
    } 
    else if (parcela === '2') {
      const valorBrutoRestante = valorProporcional * 0.5
      const inss = calcularINSS(valorProporcional)
      const irrf = calcularIRRF(valorProporcional, inss)
      return Math.max(0, valorBrutoRestante - inss - irrf)
    } 
    else {
      const inss = calcularINSS(valorProporcional)
      const irrf = calcularIRRF(valorProporcional, inss)
      return Math.max(0, valorProporcional - inss - irrf)
    }
  }

  return {
    calcularINSS,
    calcularIRRF,
    calcularMesesTrabalhados,
    calcularValor13,
  }
}
