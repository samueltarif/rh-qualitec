import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const client = await serverSupabaseClient(event)
  const user = await serverSupabaseUser(event)
  const comunicadoId = getRouterParam(event, 'id')

  if (!user) {
    throw createError({ statusCode: 401, message: 'Não autenticado' })
  }

  if (!comunicadoId) {
    throw createError({ statusCode: 400, message: 'ID do comunicado é obrigatório' })
  }

  try {
    // Buscar colaborador_id do usuário
    const { data: appUser } = await client
      .from('app_users')
      .select('colaborador_id')
      .eq('auth_uid', user.id)
      .single()

    if (!appUser?.colaborador_id) {
      throw createError({ statusCode: 400, message: 'Usuário não vinculado a um colaborador' })
    }

    // Inserir ou ignorar se já existe
    const { error } = await client
      .from('comunicados_lidos')
      .upsert({
        comunicado_id: comunicadoId,
        colaborador_id: appUser.colaborador_id
      }, {
        onConflict: 'comunicado_id,colaborador_id'
      })

    if (error) {
      throw createError({ statusCode: 500, message: error.message })
    }

    return { success: true }
  } catch (e: any) {
    console.error('Erro ao marcar comunicado como lido:', e)
    throw createError({ statusCode: 500, message: e.message || 'Erro ao marcar como lido' })
  }
})
