import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const supabase = await serverSupabaseClient(event)
  const user = await serverSupabaseUser(event)

  if (!user) {
    throw createError({ statusCode: 401, message: 'Não autenticado' })
  }

  try {
    const id = getRouterParam(event, 'id')

    // Verificar permissão
    const { data: appUser } = await supabase
      .from('app_users')
      .select('role')
      .eq('auth_uid', user.id)
      .single()

    if (!appUser || appUser.role !== 'admin') {
      throw createError({ statusCode: 403, message: 'Apenas administradores podem excluir relatórios' })
    }

    // Excluir template
    const { error } = await supabase
      .from('relatorios_templates')
      .delete()
      .eq('id', id)

    if (error) throw error

    return {
      success: true,
      message: 'Template excluído com sucesso'
    }
  } catch (error: any) {
    console.error('Erro ao excluir template:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Erro ao excluir template'
    })
  }
})
