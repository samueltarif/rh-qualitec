import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const supabase = await serverSupabaseClient(event)
  const user = await serverSupabaseUser(event)

  if (!user) {
    throw createError({
      statusCode: 401,
      message: 'Não autenticado'
    })
  }

  const body = await readBody(event)
  const { mes, ano, registros, resumo } = body

  if (!mes || !ano || !registros || !resumo) {
    throw createError({
      statusCode: 400,
      message: 'Dados incompletos'
    })
  }

  // Buscar colaborador
  const { data: colaborador } = await supabase
    .from('colaboradores')
    .select('id, nome')
    .eq('auth_uid', user.id)
    .single() as any

  if (!colaborador) {
    throw createError({
      statusCode: 404,
      message: 'Colaborador não encontrado'
    })
  }

  // Verificar se já existe assinatura
  const { data: assinaturaExistente } = await supabase
    .from('assinaturas_ponto')
    .select('id')
    .eq('colaborador_id', colaborador.id)
    .eq('mes', mes)
    .eq('ano', ano)
    .single() as any

  if (assinaturaExistente) {
    throw createError({
      statusCode: 400,
      message: 'Ponto já foi assinado para este período'
    })
  }

  // Gerar CSV
  const csv = gerarCSV(registros, colaborador.nome, mes, ano, resumo)
  
  // Obter IP do cliente
  const ip = getRequestIP(event, { xForwardedFor: true })

  // Criar assinatura
  const { data: assinatura, error } = await supabase
    .from('assinaturas_ponto')
    .insert({
      colaborador_id: colaborador.id,
      mes,
      ano,
      ip_assinatura: ip,
      arquivo_csv: Buffer.from(csv).toString('base64'),
      total_dias: resumo.diasTrabalhados,
      total_horas: resumo.horasTrabalhadas,
      observacoes: `Assinado em ${new Date().toLocaleString('pt-BR')}`
    } as any)
    .select()
    .single() as any

  if (error) {
    console.error('Erro ao criar assinatura:', error)
    throw createError({
      statusCode: 500,
      message: 'Erro ao assinar ponto'
    })
  }

  return assinatura
})

function gerarCSV(registros: any[], nomeColaborador: string, mes: number, ano: number, resumo: any): string {
  const linhas: string[] = []
  
  // Cabeçalho
  linhas.push('REGISTRO DE PONTO ELETRÔNICO')
  linhas.push(`Colaborador: ${nomeColaborador}`)
  linhas.push(`Período: ${mes.toString().padStart(2, '0')}/${ano}`)
  linhas.push(`Data de Assinatura: ${new Date().toLocaleString('pt-BR')}`)
  linhas.push('')
  
  // Resumo
  linhas.push('RESUMO DO PERÍODO')
  linhas.push(`Dias Trabalhados: ${resumo.diasTrabalhados}`)
  linhas.push(`Horas Trabalhadas: ${resumo.horasTrabalhadas}`)
  linhas.push(`Horas de Intervalo: ${resumo.horasIntervalo}`)
  linhas.push(`Horas Extras: ${resumo.horasExtras}`)
  linhas.push(`Faltas: ${resumo.faltas}`)
  linhas.push('')
  
  // Cabeçalho da tabela
  linhas.push('Data;Dia da Semana;Entrada;Saída Intervalo;Entrada Intervalo;Saída;Total Horas;Status')
  
  // Registros
  registros.forEach(reg => {
    const data = new Date(reg.data + 'T00:00:00')
    const diaSemana = data.toLocaleDateString('pt-BR', { weekday: 'long' })
    const dataFormatada = data.toLocaleDateString('pt-BR')
    
    linhas.push([
      dataFormatada,
      diaSemana,
      reg.entrada_1 || '-',
      reg.saida_1 || '-',
      reg.entrada_2 || '-',
      reg.saida_2 || '-',
      calcularTotalHoras(reg),
      reg.status || 'Normal'
    ].join(';'))
  })
  
  linhas.push('')
  linhas.push('DECLARAÇÃO')
  linhas.push('Declaro que os registros acima estão corretos e conferidos.')
  linhas.push(`Assinado digitalmente em ${new Date().toLocaleString('pt-BR')}`)
  
  return linhas.join('\n')
}

function calcularTotalHoras(reg: any): string {
  if (!reg.entrada_1) return '0h00'
  
  let totalMinutos = 0
  
  // Período manhã
  if (reg.entrada_1 && reg.saida_1) {
    const entrada = parseHora(reg.entrada_1)
    const saida = parseHora(reg.saida_1)
    totalMinutos += saida - entrada
  }
  
  // Período tarde
  if (reg.entrada_2 && reg.saida_2) {
    const entrada = parseHora(reg.entrada_2)
    const saida = parseHora(reg.saida_2)
    totalMinutos += saida - entrada
  }
  
  const horas = Math.floor(totalMinutos / 60)
  const minutos = totalMinutos % 60
  
  return `${horas}h${minutos.toString().padStart(2, '0')}`
}

function parseHora(hora: string): number {
  const [h, m] = hora.split(':').map(Number)
  return h * 60 + m
}
