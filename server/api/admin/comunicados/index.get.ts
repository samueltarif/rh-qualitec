import { serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const client = await serverSupabaseClient(event)

  try {
    const { data, error } = await client
      .from('comunicados')
      .select(`
        *,
        publicado:app_users!comunicados_publicado_por_fkey(nome)
      `)
      .order('created_at', { ascending: false })

    if (error) {
      throw createError({ statusCode: 500, message: error.message })
    }

    return data || []
  } catch (e: any) {
    console.error('Erro ao buscar comunicados:', e)
    throw createError({ statusCode: 500, message: e.message || 'Erro ao buscar comunicados' })
  }
})
