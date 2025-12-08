/**
 * Utilitário centralizado para cálculos de ponto
 * Garante consistência entre painel do funcionário e painel admin
 */

export interface RegistroPonto {
  entrada_1?: string | null
  saida_1?: string | null
  entrada_2?: string | null
  saida_2?: string | null
  entrada_3?: string | null
  saida_3?: string | null
}

export interface ResultadoCalculo {
  totalMinutos: number
  horasFormatadas: string
  intervaloMinutos: number
  intervaloFormatado: string
  avisos: string[]
  detalhes: string
}

/**
 * Converte string de hora (HH:MM ou HH:MM:SS) para minutos
 */
function horaParaMinutos(hora: string | null | undefined): number {
  if (!hora) return 0
  const partes = hora.split(':').map(Number)
  return (partes[0] || 0) * 60 + (partes[1] || 0)
}

/**
 * Formata minutos para HhMM
 */
function formatarMinutos(minutos: number): string {
  if (minutos === 0) return '0h00'
  const horas = Math.floor(minutos / 60)
  const mins = minutos % 60
  return `${horas}h${mins.toString().padStart(2, '0')}`
}

/**
 * Verifica se um intervalo está completo (ambos os horários preenchidos)
 */
function intervaloCompleto(saida: string | null | undefined, retorno: string | null | undefined): boolean {
  return !!(saida && retorno)
}

/**
 * Verifica se um intervalo está parcialmente preenchido (apenas um horário)
 */
function intervaloParcial(saida: string | null | undefined, retorno: string | null | undefined): boolean {
  return !!(saida && !retorno) || !!(!saida && retorno)
}

/**
 * Verifica se um registro está em andamento (sem saída final)
 */
export function registroEmAndamento(registro: RegistroPonto): boolean {
  // Tem entrada mas não tem saída final
  return !!(registro.entrada_1 && !registro.saida_2)
}

/**
 * Calcula horas trabalhadas em tempo real para registro em andamento
 * Considera o horário atual como ponto de referência
 */
export function calcularHorasTempoReal(registro: RegistroPonto, horaAtual?: Date): ResultadoCalculo {
  const agora = horaAtual || new Date()
  const horaAtualStr = `${agora.getHours().toString().padStart(2, '0')}:${agora.getMinutes().toString().padStart(2, '0')}`
  
  // Criar um registro temporário com a hora atual como saída
  const registroTemp: RegistroPonto = {
    ...registro
  }
  
  // Se não tem saída_2, usar hora atual
  if (!registroTemp.saida_2) {
    registroTemp.saida_2 = horaAtualStr
  }
  
  const resultado = calcularHorasTrabalhadas(registroTemp)
  
  // Se está em andamento, adicionar aviso de tempo real
  if (!registro.saida_2) {
    resultado.avisos.unshift('⏱️ Contagem em tempo real')
  }
  
  return resultado
}

/**
 * Calcula horas trabalhadas seguindo as regras:
 * 1. Se houver intervalo completo: desconta o intervalo
 * 2. Se houver intervalo parcial: avisa e não desconta
 * 3. Se não houver intervalo: calcula entrada até saída final
 */
export function calcularHorasTrabalhadas(registro: RegistroPonto): ResultadoCalculo {
  const avisos: string[] = []
  let totalMinutos = 0
  let intervaloMinutos = 0
  const detalhesCalculo: string[] = []

  // Validação básica
  if (!registro.entrada_1) {
    return {
      totalMinutos: 0,
      horasFormatadas: '--:--',
      intervaloMinutos: 0,
      intervaloFormatado: 'não registrado',
      avisos: ['Entrada não registrada'],
      detalhes: 'Sem entrada registrada'
    }
  }

  const entrada1Min = horaParaMinutos(registro.entrada_1)
  const saida1Min = horaParaMinutos(registro.saida_1)
  const entrada2Min = horaParaMinutos(registro.entrada_2)
  const saida2Min = horaParaMinutos(registro.saida_2)
  const entrada3Min = horaParaMinutos(registro.entrada_3)
  const saida3Min = horaParaMinutos(registro.saida_3)

  // Verificar intervalos
  const intervalo1Completo = intervaloCompleto(registro.saida_1, registro.entrada_2)
  const intervalo1Parcial = intervaloParcial(registro.saida_1, registro.entrada_2)
  
  // Apenas verificar entrada_3/saida_3 se já tiver saida_2 (jornada completa + horas extras)
  const temJornadaCompleta = !!(registro.entrada_1 && registro.saida_1 && registro.entrada_2 && registro.saida_2)
  const intervalo2Completo = temJornadaCompleta && intervaloCompleto(registro.saida_2, registro.entrada_3)
  const intervalo2Parcial = temJornadaCompleta && intervaloParcial(registro.saida_2, registro.entrada_3)

  // CASO 1: Intervalo 1 parcial (falta saída ou retorno)
  if (intervalo1Parcial) {
    if (registro.saida_1 && !registro.entrada_2) {
      avisos.push('⚠️ Intervalo incompleto — falta horário de retorno')
    } else if (!registro.saida_1 && registro.entrada_2) {
      avisos.push('⚠️ Intervalo incompleto — falta horário de início do intervalo')
    }
  }

  // CASO 2: Intervalo 2 parcial (apenas se já tiver jornada completa)
  if (intervalo2Parcial) {
    if (registro.saida_2 && !registro.entrada_3) {
      avisos.push('⚠️ Hora extra iniciada — falta horário de saída')
    } else if (!registro.saida_2 && registro.entrada_3) {
      avisos.push('⚠️ Registro inconsistente — entrada extra sem saída da jornada')
    }
  }

  // CÁLCULO PRINCIPAL
  
  // Cenário A: Sem nenhum intervalo registrado (entrada_1 e saida_2, sem saida_1 e entrada_2)
  if (registro.entrada_1 && registro.saida_2 && !registro.saida_1 && !registro.entrada_2) {
    totalMinutos = saida2Min - entrada1Min
    detalhesCalculo.push(`Entrada (${registro.entrada_1}) → Saída (${registro.saida_2})`)
    detalhesCalculo.push(`Cálculo: ${registro.saida_2} - ${registro.entrada_1} = ${formatarMinutos(totalMinutos)}`)
    avisos.push('ℹ️ Nenhum intervalo registrado')
  }
  // Cenário B: Intervalo 1 completo
  else if (intervalo1Completo) {
    // Período 1: entrada_1 até saida_1
    const periodo1 = saida1Min - entrada1Min
    totalMinutos += periodo1
    detalhesCalculo.push(`Período 1: ${registro.entrada_1} → ${registro.saida_1} = ${formatarMinutos(periodo1)}`)

    // Intervalo 1
    intervaloMinutos = entrada2Min - saida1Min
    detalhesCalculo.push(`Intervalo: ${registro.saida_1} → ${registro.entrada_2} = ${formatarMinutos(intervaloMinutos)}`)

    // Período 2: entrada_2 até saida_2 (se existir)
    if (registro.saida_2) {
      const periodo2 = saida2Min - entrada2Min
      totalMinutos += periodo2
      detalhesCalculo.push(`Período 2: ${registro.entrada_2} → ${registro.saida_2} = ${formatarMinutos(periodo2)}`)
    }

    // Período 3: entrada_3 até saida_3 (se existir e intervalo 2 completo)
    if (intervalo2Completo && registro.saida_3) {
      const periodo3 = saida3Min - entrada3Min
      totalMinutos += periodo3
      const intervalo2 = entrada3Min - saida2Min
      intervaloMinutos += intervalo2
      detalhesCalculo.push(`Intervalo 2: ${registro.saida_2} → ${registro.entrada_3} = ${formatarMinutos(intervalo2)}`)
      detalhesCalculo.push(`Período 3: ${registro.entrada_3} → ${registro.saida_3} = ${formatarMinutos(periodo3)}`)
    }

    detalhesCalculo.push(`Total: ${formatarMinutos(totalMinutos)} (descontado ${formatarMinutos(intervaloMinutos)} de intervalo)`)
  }
  // Cenário C: Intervalo 1 parcial - calcular sem descontar intervalo
  else if (intervalo1Parcial) {
    // Calcular do início até o último horário disponível
    let ultimoHorario = entrada1Min
    
    if (registro.saida_2) {
      ultimoHorario = saida2Min
    } else if (registro.entrada_2) {
      ultimoHorario = entrada2Min
    } else if (registro.saida_1) {
      ultimoHorario = saida1Min
    }

    totalMinutos = ultimoHorario - entrada1Min
    detalhesCalculo.push(`Entrada (${registro.entrada_1}) → Último registro`)
    detalhesCalculo.push(`Cálculo sem desconto de intervalo: ${formatarMinutos(totalMinutos)}`)
    detalhesCalculo.push('⚠️ Intervalo não descontado (incompleto)')
  }
  // Cenário D: Apenas entrada_1 e saida_1 (sem período da tarde)
  else if (registro.entrada_1 && registro.saida_1 && !registro.entrada_2 && !registro.saida_2) {
    totalMinutos = saida1Min - entrada1Min
    detalhesCalculo.push(`Entrada (${registro.entrada_1}) → Saída (${registro.saida_1})`)
    detalhesCalculo.push(`Cálculo: ${formatarMinutos(totalMinutos)}`)
  }
  // Cenário E: Apenas entrada_1 (ainda trabalhando ou registro incompleto)
  else if (registro.entrada_1 && !registro.saida_1 && !registro.entrada_2 && !registro.saida_2) {
    // Não calcular aqui - será tratado pelo tempo real
    avisos.push('⏱️ Registro em andamento ou incompleto')
    detalhesCalculo.push('Apenas entrada registrada')
    totalMinutos = 0 // Será calculado pelo tempo real
  }

  // Validações adicionais
  if (totalMinutos < 0) {
    avisos.push('❌ ERRO: Horários inválidos (duração negativa)')
    totalMinutos = 0
  }

  if (intervaloMinutos < 0) {
    avisos.push('❌ ERRO: Intervalo com duração negativa')
    intervaloMinutos = 0
  }

  // Validar se intervalo é muito longo (mais de 3 horas)
  if (intervaloMinutos > 180) {
    avisos.push('⚠️ Intervalo muito longo (mais de 3 horas)')
  }

  // Validar jornada muito longa (mais de 12 horas)
  if (totalMinutos > 720) {
    avisos.push('⚠️ Jornada muito longa (mais de 12 horas)')
  }

  return {
    totalMinutos,
    horasFormatadas: totalMinutos > 0 ? formatarMinutos(totalMinutos) : '--:--',
    intervaloMinutos,
    intervaloFormatado: intervaloMinutos > 0 ? formatarMinutos(intervaloMinutos) : 'não registrado',
    avisos,
    detalhes: detalhesCalculo.join('\n')
  }
}

/**
 * Calcula total de horas de múltiplos registros
 */
export function calcularTotalRegistros(registros: RegistroPonto[]): {
  totalMinutos: number
  totalFormatado: string
  diasTrabalhados: number
  mediaHorasDia: string
} {
  let totalMinutos = 0
  let diasComRegistro = 0

  registros.forEach(registro => {
    const resultado = calcularHorasTrabalhadas(registro)
    if (resultado.totalMinutos > 0) {
      totalMinutos += resultado.totalMinutos
      diasComRegistro++
    }
  })

  const mediaMinutos = diasComRegistro > 0 ? totalMinutos / diasComRegistro : 0

  return {
    totalMinutos,
    totalFormatado: formatarMinutos(totalMinutos),
    diasTrabalhados: diasComRegistro,
    mediaHorasDia: formatarMinutos(Math.round(mediaMinutos))
  }
}

/**
 * Formata hora para exibição (HH:MM)
 */
export function formatarHora(hora: string | null | undefined): string {
  if (!hora) return '--:--'
  return hora.substring(0, 5)
}

/**
 * Valida se os horários estão em ordem cronológica
 */
export function validarOrdemHorarios(registro: RegistroPonto): { valido: boolean; erros: string[] } {
  const erros: string[] = []

  const entrada1 = horaParaMinutos(registro.entrada_1)
  const saida1 = horaParaMinutos(registro.saida_1)
  const entrada2 = horaParaMinutos(registro.entrada_2)
  const saida2 = horaParaMinutos(registro.saida_2)
  const entrada3 = horaParaMinutos(registro.entrada_3)
  const saida3 = horaParaMinutos(registro.saida_3)

  if (registro.entrada_1 && registro.saida_1 && saida1 <= entrada1) {
    erros.push('Saída do intervalo deve ser após a entrada')
  }

  if (registro.saida_1 && registro.entrada_2 && entrada2 <= saida1) {
    erros.push('Retorno do intervalo deve ser após a saída para intervalo')
  }

  if (registro.entrada_2 && registro.saida_2 && saida2 <= entrada2) {
    erros.push('Saída final deve ser após o retorno do intervalo')
  }

  if (registro.entrada_1 && registro.saida_2 && !registro.saida_1 && !registro.entrada_2 && saida2 <= entrada1) {
    erros.push('Saída deve ser após a entrada')
  }

  if (registro.saida_2 && registro.entrada_3 && entrada3 <= saida2) {
    erros.push('Retorno do segundo intervalo deve ser após a saída')
  }

  if (registro.entrada_3 && registro.saida_3 && saida3 <= entrada3) {
    erros.push('Saída final deve ser após o retorno do segundo intervalo')
  }

  return {
    valido: erros.length === 0,
    erros
  }
}
