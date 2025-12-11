export const useFolhaPagamento = () => {
  const { calcularINSS, calcularIRRF } = useFolhaCalculos()

  // Recalcular resumo em tempo real
  const recalcularResumo = (
    edicao: any,
    dados: any
  ) => {
    if (!dados) return null

    const salarioBase = dados.salario_base || 0
    const valorHora = salarioBase / (dados.horas_contratadas || 220)

    // Calcular proventos
    const horasExtras50 = (parseFloat(String(edicao.horas_extras_50)) || 0) * valorHora * 1.5
    const horasExtras100 = (parseFloat(String(edicao.horas_extras_100)) || 0) * valorHora * 2
    const adicionalInsalubridade = salarioBase * ((parseFloat(String(edicao.adicional_insalubridade)) || 0) / 100)
    const adicionalPericulosidade = salarioBase * ((parseFloat(String(edicao.adicional_periculosidade)) || 0) / 100)
    
    // Calcular itens personalizados - PROVENTOS
    const itensPersonalizados = edicao.itens_personalizados || []
    const totalItensProventos = itensPersonalizados
      .filter((item: any) => item.tipo === 'provento')
      .reduce((sum: number, item: any) => sum + (parseFloat(String(item.valor)) || 0), 0)
    
    const totalProventos = 
      horasExtras50 +
      horasExtras100 +
      (parseFloat(String(edicao.bonus)) || 0) +
      (parseFloat(String(edicao.comissoes)) || 0) +
      adicionalInsalubridade +
      adicionalPericulosidade +
      (parseFloat(String(edicao.adicional_noturno)) || 0) +
      (parseFloat(String(edicao.outros_proventos)) || 0) +
      totalItensProventos

    const salarioBruto = salarioBase + totalProventos

    // Calcular impostos
    const inssCalculado = calcularINSS(salarioBruto)
    const irrfCalculado = calcularIRRF(salarioBruto, inssCalculado, dados.dependentes || 0)

    // Usar valores manuais se fornecidos, senão usar calculados
    const inss = edicao.inss_manual !== null && edicao.inss_manual !== undefined && edicao.inss_manual !== '' 
      ? parseFloat(String(edicao.inss_manual)) 
      : inssCalculado
    const irrf = edicao.irrf_manual !== null && edicao.irrf_manual !== undefined && edicao.irrf_manual !== ''
      ? parseFloat(String(edicao.irrf_manual)) 
      : irrfCalculado

    // Calcular descontos de faltas/atrasos
    const descontoFaltas = (parseFloat(String(edicao.faltas_horas)) || 0) * valorHora
    const descontoAtrasos = (parseFloat(String(edicao.atrasos_horas)) || 0) * valorHora

    // Calcular itens personalizados - DESCONTOS
    const totalItensDescontos = itensPersonalizados
      .filter((item: any) => item.tipo === 'desconto')
      .reduce((sum: number, item: any) => sum + (parseFloat(String(item.valor)) || 0), 0)

    const outrosDescontos = 
      (parseFloat(String(edicao.adiantamento)) || 0) +
      (parseFloat(String(edicao.emprestimos)) || 0) +
      descontoFaltas +
      descontoAtrasos +
      (parseFloat(String(edicao.outros_descontos)) || 0) +
      totalItensDescontos

    const totalDescontos = inss + irrf + outrosDescontos
    const salarioLiquido = salarioBruto - totalDescontos
    const fgts = salarioBruto * 0.08

    // Calcular total de benefícios
    const totalBeneficios = 
      (parseFloat(String(edicao.vale_transporte)) || 0) +
      (parseFloat(String(edicao.vale_refeicao)) || 0) +
      (parseFloat(String(edicao.vale_alimentacao)) || 0) +
      (parseFloat(String(edicao.plano_saude)) || 0) +
      (parseFloat(String(edicao.plano_odontologico)) || 0) +
      (parseFloat(String(edicao.seguro_vida)) || 0) +
      (parseFloat(String(edicao.auxilio_creche)) || 0) +
      (parseFloat(String(edicao.auxilio_educacao)) || 0) +
      (parseFloat(String(edicao.auxilio_combustivel)) || 0) +
      (parseFloat(String(edicao.outros_beneficios)) || 0)

    return {
      salario_base: salarioBase,
      total_proventos: totalProventos,
      salario_bruto: salarioBruto,
      inss,
      irrf,
      outros_descontos: outrosDescontos,
      total_descontos: totalDescontos,
      salario_liquido: salarioLiquido,
      fgts,
      total_beneficios: totalBeneficios,
      inss_calculado: inssCalculado,
      irrf_calculado: irrfCalculado,
    }
  }

  return {
    recalcularResumo,
  }
}
