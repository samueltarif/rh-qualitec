import { serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const client = await serverSupabaseClient(event)

  const { data, error } = await client
    .from('tipos_alertas')
    .select('*')
    .eq('ativo', true)
    .order('categoria')
    .order('nome')

  if (error) {
    throw createError({ statusCode: 500, message: error.message })
  }

  return data || []
})
