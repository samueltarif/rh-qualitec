import { serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const client = await serverSupabaseClient(event)
  const query = getQuery(event)

  let queryBuilder = client
    .from('alertas')
    .select(`
      *,
      tipo_alerta:tipo_alerta_id(id, codigo, nome, icone, cor, categoria),
      colaborador:colaborador_id(id, nome, matricula, foto_url)
    `)
    .order('created_at', { ascending: false })

  // Filtros
  if (query.status && query.status !== 'todos') {
    queryBuilder = queryBuilder.eq('status', query.status)
  }

  if (query.prioridade && query.prioridade !== 'todas') {
    queryBuilder = queryBuilder.eq('prioridade', query.prioridade)
  }

  if (query.categoria) {
    queryBuilder = queryBuilder.eq('tipo_alerta.categoria', query.categoria)
  }

  if (query.colaborador_id) {
    queryBuilder = queryBuilder.eq('colaborador_id', query.colaborador_id)
  }

  // Limite
  if (query.limit) {
    queryBuilder = queryBuilder.limit(Number(query.limit))
  } else {
    queryBuilder = queryBuilder.limit(100)
  }

  const { data, error } = await queryBuilder

  if (error) {
    throw createError({ statusCode: 500, message: error.message })
  }

  return data || []
})
