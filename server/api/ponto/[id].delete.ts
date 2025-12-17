import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const client = await serverSupabaseClient(event)
  const user = await serverSupabaseUser(event)
  const id = getRouterParam(event, 'id')

  if (!user) {
    throw createError({ statusCode: 401, message: 'Não autenticado' })
  }

  if (!id) {
    throw createError({ statusCode: 400, message: 'ID do registro não informado' })
  }

  try {
    // O Supabase retorna o ID no campo 'sub', não 'id'
    const userId = user?.id || user?.sub

    if (!userId) {
      throw createError({ statusCode: 401, message: 'ID de usuário inválido' })
    }

    // Buscar app_user
    const { data: appUserData } = await client
      .from('app_users')
      .select('id, role')
      .eq('auth_uid', userId)
      .single()

    const appUser = appUserData as { id: string; role: string } | null

    if (!appUser) {
      throw createError({ statusCode: 400, message: 'Usuário não encontrado' })
    }

    // Sistema single-tenant - verificar se o registro existe
    const { data: registroData } = await client
      .from('registros_ponto')
      .select('id')
      .eq('id', id)
      .single()

    if (!registroData) {
      throw createError({ statusCode: 404, message: 'Registro não encontrado' })
    }

    // Excluir registro
    const { error } = await client
      .from('registros_ponto')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Erro ao excluir registro:', error)
      throw createError({ statusCode: 500, message: error.message })
    }

    console.log('✅ Registro de ponto excluído com sucesso:', id)
    return { success: true, message: 'Registro excluído com sucesso' }
  } catch (e: any) {
    console.error('Erro ao excluir registro de ponto:', e)
    throw createError({ statusCode: e.statusCode || 500, message: e.message || 'Erro ao excluir registro' })
  }
})
