/**
 * CALCULADORA DE RESCISÃO CLT
 * 
 * Implementa todos os cálculos de rescisão conforme legislação brasileira:
 * - CLT (Consolidação das Leis do Trabalho)
 * - Lei 8.036/90 (FGTS)
 * - Lei 12.506/2011 (Aviso Prévio Proporcional)
 * - Lei 15.270/2025 (IRRF)
 */

import { calcularINSS } from './inss-calculator'
import { calcularIRRFSimples } from './irrf-lei-15270-2025'

interface DadosColaborador {
  nome: string
  salario_base: number
  data_admissao: string
  tipo_contrato?: string
  dependentes?: number
}

interface DadosRescisao {
  tipo_rescisao: string
  data_desligamento: string
  aviso_previo: 'trabalhado' | 'indenizado' | 'nao_aplicavel'
  dias_trabalhados: number
  ferias_vencidas: boolean
  media_horas_extras: number
  adicionais: number
  faltas: number
  adiantamentos: number
}

interface ItemCalculo {
  descricao: string
  valor: number
  base_legal?: string
}

interface ResultadoRescisao {
  proventos: ItemCalculo[]
  descontos: ItemCalculo[]
  fgts: ItemCalculo[]
  total_proventos: number
  total_descontos: number
  total_fgts: number
  valor_liquido: number
  tempo_casa: string
  observacoes: string[]
}

export function calcularRescisao(
  colaborador: DadosColaborador,
  dados: DadosRescisao
): ResultadoRescisao {
  const proventos: ItemCalculo[] = []
  const descontos: ItemCalculo[] = []
  const fgts: ItemCalculo[] = []
  const observacoes: string[] = []

  // Calcular tempo de casa
  const dataAdmissao = new Date(colaborador.data_admissao + 'T00:00:00')
  const dataDesligamento = new Date(dados.data_desligamento + 'T00:00:00')
  const tempoServico = calcularTempoServico(dataAdmissao, dataDesligamento)

  // 1. SALDO DE SALÁRIO
  const saldoSalario = calcularSaldoSalario(
    colaborador.salario_base,
    dados.dias_trabalhados
  )
  if (saldoSalario > 0) {
    proventos.push({
      descricao: `Saldo de Salário (${dados.dias_trabalhados} dias)`,
      valor: saldoSalario,
      base_legal: 'CLT Art. 462'
    })
  }

  // 2. AVISO PRÉVIO
  const avisosPrevio = calcularAvisoPrevio(
    colaborador.salario_base,
    tempoServico.anos,
    dados.tipo_rescisao,
    dados.aviso_previo
  )
  
  if (avisosPrevio.valor > 0) {
    proventos.push({
      descricao: avisosPrevio.descricao,
      valor: avisosPrevio.valor,
      base_legal: 'Lei 12.506/2011'
    })
  } else if (avisosPrevio.desconto > 0) {
    descontos.push({
      descricao: 'Aviso Prévio Não Cumprido',
      valor: avisosPrevio.desconto,
      base_legal: 'CLT Art. 487 §2º'
    })
  }

  // 3. 13º SALÁRIO PROPORCIONAL
  const decimoTerceiro = calcular13Proporcional(
    colaborador.salario_base,
    dataAdmissao,
    dataDesligamento,
    dados.tipo_rescisao
  )
  if (decimoTerceiro > 0) {
    proventos.push({
      descricao: '13º Salário Proporcional',
      valor: decimoTerceiro,
      base_legal: 'Lei 4.090/62'
    })
  }

  // 4. FÉRIAS
  const ferias = calcularFerias(
    colaborador.salario_base,
    dataAdmissao,
    dataDesligamento,
    dados.ferias_vencidas,
    dados.tipo_rescisao
  )
  
  ferias.forEach(item => proventos.push(item))

  // 5. HORAS EXTRAS
  if (dados.media_horas_extras > 0) {
    const horasExtras = dados.media_horas_extras
    proventos.push({
      descricao: 'Média de Horas Extras',
      valor: horasExtras,
      base_legal: 'CLT Art. 59'
    })
  }

  // 6. ADICIONAIS
  if (dados.adicionais > 0) {
    proventos.push({
      descricao: 'Adicionais (Noturno/Insalubridade/Periculosidade)',
      valor: dados.adicionais,
      base_legal: 'CLT Arts. 73, 189, 193'
    })
  }

  // 7. DESCONTOS - FALTAS
  if (dados.faltas > 0) {
    const valorFaltas = (colaborador.salario_base / 30) * dados.faltas
    descontos.push({
      descricao: `Faltas Injustificadas (${dados.faltas} dias)`,
      valor: valorFaltas,
      base_legal: 'CLT Art. 130'
    })
  }

  // 8. DESCONTOS - ADIANTAMENTOS
  if (dados.adiantamentos > 0) {
    descontos.push({
      descricao: 'Adiantamento Salarial',
      valor: dados.adiantamentos,
      base_legal: 'CLT Art. 462'
    })
  }

  // 9. SEPARAR VERBAS TRIBUTÁVEIS E INDENIZATÓRIAS
  // ⚠️ CRÍTICO: Na rescisão, NEM TODAS as verbas sofrem INSS e IRRF
  
  // VERBAS TRIBUTÁVEIS (sofrem INSS e IRRF):
  // ✅ Saldo de salário
  // ✅ 13º salário proporcional
  
  // VERBAS INDENIZATÓRIAS (NÃO sofrem IRRF, mas algumas sofrem INSS):
  // ❌ Férias indenizadas (não sofrem IRRF, mas sofrem INSS)
  // ❌ 1/3 constitucional (não sofre IRRF nem INSS)
  // ❌ Aviso prévio indenizado (não sofre IRRF, mas sofre INSS)
  // ❌ Multa FGTS (não sofre IRRF nem INSS)
  // ❌ FGTS (não sofre IRRF nem INSS)
  
  // Base legal: IN RFB 1.500/2014, Súmula 386 STJ, Art. 28 Lei 8.212/91
  
  let baseTributavelIRRF = 0  // Apenas verbas que sofrem IRRF
  let baseTributavelINSS = 0  // Verbas que sofrem INSS
  let verbasIndenizatorias = 0 // Verbas isentas
  
  proventos.forEach(item => {
    // Saldo de salário: tributável para INSS e IRRF
    if (item.descricao.includes('Saldo de Salário')) {
      baseTributavelIRRF += item.valor
      baseTributavelINSS += item.valor
    }
    // 13º proporcional: tributável para INSS e IRRF
    else if (item.descricao.includes('13º Salário')) {
      baseTributavelIRRF += item.valor
      baseTributavelINSS += item.valor
    }
    // Aviso prévio indenizado: sofre INSS mas NÃO sofre IRRF
    else if (item.descricao.includes('Aviso Prévio Indenizado')) {
      baseTributavelINSS += item.valor
      verbasIndenizatorias += item.valor
    }
    // Férias (vencidas ou proporcionais): sofrem INSS mas NÃO sofrem IRRF
    else if (item.descricao.includes('Férias') && !item.descricao.includes('1/3')) {
      baseTributavelINSS += item.valor
      verbasIndenizatorias += item.valor
    }
    // 1/3 constitucional: NÃO sofre INSS nem IRRF
    else if (item.descricao.includes('1/3')) {
      verbasIndenizatorias += item.valor
    }
    // Horas extras e adicionais: tributáveis
    else if (item.descricao.includes('Horas Extras') || item.descricao.includes('Adicionais')) {
      baseTributavelIRRF += item.valor
      baseTributavelINSS += item.valor
    }
    // Outros: considerar indenizatórios por segurança
    else {
      verbasIndenizatorias += item.valor
    }
  })

  // 10. INSS (sobre base correta)
  const inss = calcularINSS(baseTributavelINSS)
  if (inss > 0) {
    descontos.push({
      descricao: 'INSS',
      valor: inss,
      base_legal: 'Lei 8.212/91'
    })
    observacoes.push(`Base INSS: R$ ${baseTributavelINSS.toFixed(2)} (saldo + 13º + aviso indenizado + férias)`)
  }

  // 11. IRRF (APENAS sobre verbas tributáveis)
  // ⚠️ CRÍTICO: Férias, 1/3 e aviso indenizado NÃO entram na base do IRRF
  const irrf = calcularIRRFSimples(baseTributavelIRRF, inss, colaborador.dependentes || 0)
  if (irrf > 0) {
    descontos.push({
      descricao: 'IRRF',
      valor: irrf,
      base_legal: 'Lei 15.270/2025 + IN RFB 1.500/2014'
    })
    observacoes.push(`Base IRRF: R$ ${baseTributavelIRRF.toFixed(2)} (apenas saldo + 13º proporcional)`)
  }
  
  // Adicionar observação sobre verbas isentas
  if (verbasIndenizatorias > 0) {
    observacoes.push(`Verbas indenizatórias (isentas de IRRF): R$ ${verbasIndenizatorias.toFixed(2)}`)
  }

  // 12. FGTS
  // Calcular base para FGTS (soma dos proventos até agora)
  const baseProventosFGTS = proventos.reduce((sum, item) => sum + item.valor, 0)
  
  const fgtsCalculos = calcularFGTS(
    colaborador.salario_base,
    baseProventosFGTS,
    dados.tipo_rescisao,
    dados.aviso_previo,
    dataAdmissao,
    dataDesligamento
  )
  fgtsCalculos.forEach(item => fgts.push(item))

  // 13. OBSERVAÇÕES LEGAIS
  observacoes.push(...gerarObservacoes(dados.tipo_rescisao, tempoServico))

  // TOTAIS
  const total_proventos = proventos.reduce((sum, item) => sum + item.valor, 0)
  const total_descontos = descontos.reduce((sum, item) => sum + item.valor, 0)
  const total_fgts = fgts.reduce((sum, item) => sum + item.valor, 0)
  const valor_liquido = total_proventos - total_descontos

  return {
    proventos,
    descontos,
    fgts,
    total_proventos,
    total_descontos,
    total_fgts,
    valor_liquido,
    tempo_casa: `${tempoServico.anos} anos, ${tempoServico.meses} meses e ${tempoServico.dias} dias`,
    observacoes
  }
}

// ============================================================================
// FUNÇÕES AUXILIARES
// ============================================================================

function calcularTempoServico(dataAdmissao: Date, dataDesligamento: Date) {
  let anos = dataDesligamento.getFullYear() - dataAdmissao.getFullYear()
  let meses = dataDesligamento.getMonth() - dataAdmissao.getMonth()
  let dias = dataDesligamento.getDate() - dataAdmissao.getDate()

  if (dias < 0) {
    meses--
    const ultimoDiaMesAnterior = new Date(
      dataDesligamento.getFullYear(),
      dataDesligamento.getMonth(),
      0
    ).getDate()
    dias += ultimoDiaMesAnterior
  }

  if (meses < 0) {
    anos--
    meses += 12
  }

  return { anos, meses, dias }
}

function calcularSaldoSalario(salarioBase: number, diasTrabalhados: number): number {
  return (salarioBase / 30) * diasTrabalhados
}

function calcularAvisoPrevio(
  salarioBase: number,
  anosServico: number,
  tipoRescisao: string,
  tipoAviso: string
): { valor: number; desconto: number; descricao: string } {
  // Tipos que NÃO têm direito a aviso prévio
  const semAvisoPrevio = [
    'dispensa_com_justa_causa',
    'termino_experiencia',
    'termino_determinado',
    'morte',
    'aposentadoria'
  ]

  if (semAvisoPrevio.includes(tipoRescisao) || tipoAviso === 'nao_aplicavel') {
    return { valor: 0, desconto: 0, descricao: '' }
  }

  // Lei 12.506/2011: 30 dias + 3 dias por ano (máximo 90 dias)
  const diasAviso = Math.min(30 + (anosServico * 3), 90)
  const valorAviso = (salarioBase / 30) * diasAviso

  // Pedido de demissão: desconta aviso se não trabalhar
  if (tipoRescisao === 'pedido_demissao' && tipoAviso !== 'trabalhado') {
    return {
      valor: 0,
      desconto: valorAviso,
      descricao: ''
    }
  }

  // Aviso indenizado
  if (tipoAviso === 'indenizado') {
    return {
      valor: valorAviso,
      desconto: 0,
      descricao: `Aviso Prévio Indenizado (${diasAviso} dias)`
    }
  }

  // Aviso trabalhado (já está no salário)
  return { valor: 0, desconto: 0, descricao: '' }
}

function calcular13Proporcional(
  salarioBase: number,
  dataAdmissao: Date,
  dataDesligamento: Date,
  tipoRescisao: string
): number {
  // Justa causa não tem direito a 13º
  if (tipoRescisao === 'dispensa_com_justa_causa') {
    return 0
  }

  // Calcular meses trabalhados no ano
  const anoDesligamento = dataDesligamento.getFullYear()
  const inicioAno = new Date(anoDesligamento, 0, 1)
  const dataInicio = dataAdmissao > inicioAno ? dataAdmissao : inicioAno

  let mesesTrabalhados = 0
  const mesInicio = dataInicio.getMonth()
  const mesDesligamento = dataDesligamento.getMonth()

  mesesTrabalhados = mesDesligamento - mesInicio + 1

  // Considera mês trabalhado se trabalhou 15 dias ou mais
  if (dataDesligamento.getDate() < 15) {
    mesesTrabalhados--
  }

  mesesTrabalhados = Math.max(0, Math.min(12, mesesTrabalhados))

  return (salarioBase / 12) * mesesTrabalhados
}

function calcularFerias(
  salarioBase: number,
  dataAdmissao: Date,
  dataDesligamento: Date,
  feriasVencidas: boolean,
  tipoRescisao: string
): ItemCalculo[] {
  const ferias: ItemCalculo[] = []

  // Justa causa não tem direito a férias
  if (tipoRescisao === 'dispensa_com_justa_causa') {
    return ferias
  }

  // Férias vencidas (período aquisitivo completo)
  if (feriasVencidas) {
    const valorFerias = salarioBase
    const umTerco = salarioBase / 3
    
    ferias.push({
      descricao: 'Férias Vencidas',
      valor: valorFerias,
      base_legal: 'CLT Art. 130'
    })
    
    ferias.push({
      descricao: 'Férias Vencidas - 1/3 Constitucional',
      valor: umTerco,
      base_legal: 'CF Art. 7º XVII'
    })
  }

  // Férias proporcionais
  const tempoServico = calcularTempoServico(dataAdmissao, dataDesligamento)
  let mesesProporcional = tempoServico.meses
  
  // Considera mês se trabalhou 15 dias ou mais
  if (tempoServico.dias >= 15) {
    mesesProporcional++
  }

  if (mesesProporcional > 0) {
    const valorProporcional = (salarioBase / 12) * mesesProporcional
    const umTercoProporcional = valorProporcional / 3
    
    ferias.push({
      descricao: `Férias Proporcionais (${mesesProporcional}/12)`,
      valor: valorProporcional,
      base_legal: 'CLT Art. 146'
    })
    
    ferias.push({
      descricao: 'Férias Proporcionais - 1/3 Constitucional',
      valor: umTercoProporcional,
      base_legal: 'CF Art. 7º XVII'
    })
  }

  return ferias
}

function calcularFGTS(
  salarioBase: number,
  totalProventos: number,
  tipoRescisao: string,
  tipoAviso: string,
  dataAdmissao: Date,
  dataDesligamento: Date
): ItemCalculo[] {
  const fgts: ItemCalculo[] = []

  // Calcular tempo total de serviço em meses
  const tempoServico = calcularTempoServico(dataAdmissao, dataDesligamento)
  const totalMeses = (tempoServico.anos * 12) + tempoServico.meses + (tempoServico.dias >= 15 ? 1 : 0)

  // FGTS ACUMULADO durante todo o período (8% sobre salário base × meses trabalhados)
  const fgtsAcumulado = salarioBase * 0.08 * totalMeses
  fgts.push({
    descricao: `FGTS Acumulado (${totalMeses} meses × 8%)`,
    valor: fgtsAcumulado,
    base_legal: 'Lei 8.036/90 Art. 15'
  })

  // FGTS sobre aviso prévio indenizado
  if (tipoAviso === 'indenizado') {
    const fgtsAviso = salarioBase * 0.08
    fgts.push({
      descricao: 'FGTS sobre Aviso Prévio Indenizado (8%)',
      valor: fgtsAviso,
      base_legal: 'Lei 8.036/90 Art. 15'
    })
  }

  // Multa FGTS (calculada sobre o FGTS acumulado real)
  const multaFGTS = calcularMultaFGTS(fgtsAcumulado, tipoRescisao, tipoAviso)
  if (multaFGTS.valor > 0) {
    fgts.push(multaFGTS)
  }

  return fgts
}

function calcularMultaFGTS(
  fgtsAcumulado: number,
  tipoRescisao: string,
  tipoAviso: string
): ItemCalculo {
  switch (tipoRescisao) {
    case 'dispensa_sem_justa_causa':
    case 'rescisao_indireta':
      return {
        descricao: 'Multa FGTS (40%)',
        valor: fgtsAcumulado * 0.40,
        base_legal: 'Lei 8.036/90 Art. 18 §1º'
      }
    
    case 'acordo_mutuo':
      return {
        descricao: 'Multa FGTS (20%) - Acordo',
        valor: fgtsAcumulado * 0.20,
        base_legal: 'CLT Art. 484-A'
      }
    
    default:
      return {
        descricao: '',
        valor: 0
      }
  }
}

function gerarObservacoes(tipoRescisao: string, tempoServico: any): string[] {
  const obs: string[] = []

  // Observações gerais
  obs.push('⚠️ Esta é uma SIMULAÇÃO. Os valores não impactam a folha de pagamento.')
  obs.push('📅 Prazo para pagamento: até 10 dias após o desligamento (CLT Art. 477).')
  
  // Observações sobre tributação
  obs.push('💰 TRIBUTAÇÃO: Saldo de salário, 13º e aviso prévio sofrem incidência de INSS e IRRF.')
  obs.push('🆓 ISENTOS: Férias + 1/3, aviso prévio indenizado e multa FGTS são isentos de INSS/IRRF.')

  // Observações específicas por tipo
  switch (tipoRescisao) {
    case 'dispensa_sem_justa_causa':
      obs.push('✅ Direito a seguro-desemprego (se cumpridos os requisitos legais).')
      obs.push('💵 Saque integral do FGTS + multa de 40%.')
      obs.push('📋 Necessário homologação no sindicato (se tempo > 1 ano).')
      break
    
    case 'acordo_mutuo':
      obs.push('🤝 Acordo previsto no Art. 484-A da CLT (Reforma Trabalhista 2017).')
      obs.push('💵 Saque de 80% do FGTS + multa de 20%.')
      obs.push('❌ NÃO tem direito a seguro-desemprego.')
      obs.push('📝 Aviso prévio indenizado reduzido pela metade.')
      break
    
    case 'pedido_demissao':
      obs.push('❌ Não tem direito a seguro-desemprego.')
      obs.push('❌ Não tem direito a saque do FGTS nem multa.')
      obs.push('⚠️ Deve cumprir aviso prévio ou pagar indenização ao empregador.')
      break
    
    case 'dispensa_com_justa_causa':
      obs.push('❌ Perde direito a aviso prévio, 13º proporcional e férias proporcionais.')
      obs.push('❌ Não tem direito a seguro-desemprego nem saque do FGTS.')
      obs.push('⚖️ Apenas recebe saldo de salário e férias vencidas (se houver).')
      break
    
    case 'rescisao_indireta':
      obs.push('⚖️ Rescisão por falta grave do empregador (CLT Art. 483).')
      obs.push('✅ Mesmos direitos da dispensa sem justa causa.')
      obs.push('💵 Saque integral do FGTS + multa de 40%.')
      obs.push('📋 Requer comprovação judicial ou administrativa.')
      break
    
    case 'termino_experiencia':
      obs.push('📅 Término natural do contrato de experiência.')
      obs.push('💵 Saque do FGTS sem multa.')
      obs.push('❌ Não tem direito a aviso prévio.')
      break
    
    case 'termino_determinado':
      obs.push('📅 Término natural do contrato por prazo determinado.')
      obs.push('💵 Saque do FGTS sem multa.')
      obs.push('❌ Não tem direito a aviso prévio.')
      break
    
    case 'morte':
      obs.push('🕊️ Falecimento do empregado.')
      obs.push('👨‍👩‍👧‍👦 Valores devem ser pagos aos dependentes/herdeiros.')
      obs.push('💵 Saque do FGTS pelos dependentes.')
      break
    
    case 'aposentadoria':
      obs.push('🎉 Aposentadoria do colaborador.')
      obs.push('💵 Saque do FGTS permitido.')
      obs.push('📋 Apresentar comprovante de aposentadoria.')
      break
  }

  // Observações sobre tempo de serviço
  if (tempoServico.anos < 1) {
    obs.push('⏱️ Colaborador com menos de 1 ano de empresa.')
    obs.push('📋 Dispensa de homologação sindical.')
  } else {
    obs.push('📋 Homologação obrigatória no sindicato ou Ministério do Trabalho.')
  }

  // Observações finais importantes
  obs.push('⚠️ IMPORTANTE: Consulte sempre um contador ou advogado trabalhista.')
  obs.push('📊 Valores são estimativas baseadas nas informações fornecidas.')

  return obs
}
