import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'

export default defineEventHandler(async (event) => {
  try {
    const user = await serverSupabaseUser(event)
    if (!user) {
      throw createError({ statusCode: 401, message: 'Não autenticado' })
    }

    const id = getRouterParam(event, 'id')
    const supabase = await serverSupabaseClient(event)

    const { error } = await supabase
      .from('templates_importacao')
      .delete()
      .eq('id', id)

    if (error) throw error

    return {
      success: true,
      message: 'Template excluído com sucesso',
    }
  } catch (error: any) {
    console.error('Erro ao excluir template:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Erro ao excluir template',
    })
  }
})
