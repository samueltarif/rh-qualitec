import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'

export default defineEventHandler(async (event) => {
  try {
    const user = await serverSupabaseUser(event)
    if (!user) {
      throw createError({ statusCode: 401, message: 'Não autenticado' })
    }

    const supabase = await serverSupabaseClient(event)

    const { data, error } = await supabase
      .from('templates_importacao')
      .select('*')
      .order('nome')

    if (error) throw error

    return {
      success: true,
      data: data || [],
    }
  } catch (error: any) {
    console.error('Erro ao buscar templates:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Erro ao buscar templates',
    })
  }
})
