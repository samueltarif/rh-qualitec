import { serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const client = (await serverSupabaseClient(event)) as any

  const { data, error } = await client
    .from('historico_backups')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) {
    throw createError({ statusCode: 500, message: error.message })
  }

  return data || []
})
