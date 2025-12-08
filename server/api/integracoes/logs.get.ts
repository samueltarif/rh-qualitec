import { serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const client = (await serverSupabaseClient(event)) as any
  const query = getQuery(event)

  let queryBuilder = client
    .from('logs_sincronizacao')
    .select('*')
    .order('created_at', { ascending: false })

  if (query.tipo) {
    queryBuilder = queryBuilder.eq('tipo_integracao', query.tipo)
  }

  if (query.status) {
    queryBuilder = queryBuilder.eq('status', query.status)
  }

  const limit = query.limit ? Number(query.limit) : 50
  queryBuilder = queryBuilder.limit(limit)

  const { data, error } = await queryBuilder

  if (error) {
    throw createError({ statusCode: 500, message: error.message })
  }

  return data || []
})
