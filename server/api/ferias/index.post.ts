import { serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const client = await serverSupabaseClient(event)
  const body = await readBody(event)

  const {
    colaborador_id,
    periodo_aquisitivo_inicio,
    periodo_aquisitivo_fim,
    data_inicio,
    data_fim,
    dias_gozo,
    dias_abono = 0,
    tipo = 'normal',
    vender_dias = false,
    adiantamento_13 = false,
    observacoes,
  } = body

  if (!colaborador_id || !data_inicio || !data_fim || !dias_gozo) {
    throw createError({ 
      statusCode: 400, 
      message: 'Campos obrigatórios: colaborador_id, data_inicio, data_fim, dias_gozo' 
    })
  }

  // Buscar período aquisitivo do colaborador se não informado
  let periodoInicio = periodo_aquisitivo_inicio
  let periodoFim = periodo_aquisitivo_fim

  if (!periodoInicio || !periodoFim) {
    const { data: colaborador } = await client
      .from('colaboradores')
      .select('data_admissao')
      .eq('id', colaborador_id)
      .single()

    if (colaborador) {
      const admissao = new Date((colaborador as any).data_admissao)
      const hoje = new Date()
      const anosEmpresa = Math.floor((hoje.getTime() - admissao.getTime()) / (365.25 * 24 * 60 * 60 * 1000))
      
      periodoInicio = new Date(admissao)
      periodoInicio.setFullYear(admissao.getFullYear() + anosEmpresa)
      
      periodoFim = new Date(periodoInicio)
      periodoFim.setFullYear(periodoFim.getFullYear() + 1)
      periodoFim.setDate(periodoFim.getDate() - 1)
      
      periodoInicio = periodoInicio.toISOString().split('T')[0]
      periodoFim = periodoFim.toISOString().split('T')[0]
    }
  }

  const { data, error } = await client
    .from('ferias')
    .insert({
      colaborador_id,
      periodo_aquisitivo_inicio: periodoInicio,
      periodo_aquisitivo_fim: periodoFim,
      data_inicio,
      data_fim,
      dias_gozo,
      dias_abono: vender_dias ? dias_abono : 0,
      tipo,
      vender_dias,
      adiantamento_13,
      observacoes,
      status: 'Pendente',
      solicitado_em: new Date().toISOString(),
    } as any)
    .select()
    .single()

  if (error) {
    console.error('Erro ao criar solicitação de férias:', error)
    throw createError({ statusCode: 500, message: error.message })
  }

  return data
})
