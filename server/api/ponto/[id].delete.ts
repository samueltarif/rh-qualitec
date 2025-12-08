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
    // Buscar empresa do usuário
    const { data: appUserData } = await client
      .from('app_users')
      .select('empresa_id')
      .eq('auth_uid', user.id)
      .single()

    const appUser = appUserData as { empresa_id: string } | null

    if (!appUser?.empresa_id) {
      throw createError({ statusCode: 400, message: 'Usuário não vinculado a uma empresa' })
    }

    // Verificar se o registro pertence à empresa
    const { data: registroData } = await client
      .from('registros_ponto')
      .select('id, empresa_id')
      .eq('id', id)
      .single()

    const registro = registroData as { id: string; empresa_id: string } | null

    if (!registro || registro.empresa_id !== appUser.empresa_id) {
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

    return { success: true, message: 'Registro excluído com sucesso' }
  } catch (e: any) {
    console.error('Erro ao excluir registro de ponto:', e)
    throw createError({ statusCode: e.statusCode || 500, message: e.message || 'Erro ao excluir registro' })
  }
})
