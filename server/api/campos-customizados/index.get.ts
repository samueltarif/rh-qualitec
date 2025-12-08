import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const supabase = await serverSupabaseClient(event)
  const user = await serverSupabaseUser(event)

  if (!user) {
    throw createError({ statusCode: 401, message: 'Não autenticado' })
  }

  try {
    const { data: campos, error } = await supabase
      .from('campos_customizados')
      .select('*')
      .order('entidade')
      .order('ordem')
      .order('label')

    if (error) throw error

    return {
      success: true,
      data: campos || []
    }
  } catch (error: any) {
    console.error('Erro ao buscar campos customizados:', error)
    throw createError({
      statusCode: 500,
      message: error.message || 'Erro ao buscar campos customizados'
    })
  }
})
