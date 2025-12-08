import { serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const client = (await serverSupabaseClient(event)) as any
  const query = getQuery(event)

  let queryBuilder = client
    .from('auditoria')
    .select('*')
    .order('created_at', { ascending: false })

  // Filtros
  if (query.usuario_id) {
    queryBuilder = queryBuilder.eq('usuario_id', query.usuario_id)
  }

  if (query.tabela) {
    queryBuilder = queryBuilder.eq('tabela', query.tabela)
  }

  if (query.acao) {
    queryBuilder = queryBuilder.eq('acao', query.acao)
  }

  if (query.registro_id) {
    queryBuilder = queryBuilder.eq('registro_id', query.registro_id)
  }

  if (query.data_inicio) {
    queryBuilder = queryBuilder.gte('created_at', query.data_inicio)
  }

  if (query.data_fim) {
    queryBuilder = queryBuilder.lte('created_at', query.data_fim)
  }

  // Limite
  const limit = query.limit ? Number(query.limit) : 100
  queryBuilder = queryBuilder.limit(limit)

  const { data, error } = await queryBuilder

  if (error) {
    throw createError({ statusCode: 500, message: error.message })
  }

  return data || []
})
