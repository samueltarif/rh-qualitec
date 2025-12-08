import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const client = await serverSupabaseClient(event)
  const user = await serverSupabaseUser(event)
  const id = getRouterParam(event, 'id')
  const body = await readBody(event)

  if (!user) {
    throw createError({ statusCode: 401, message: 'Não autenticado' })
  }

  if (!id) {
    throw createError({ statusCode: 400, message: 'ID é obrigatório' })
  }

  try {
    // Buscar app_user para obter o ID
    const { data: appUser } = await client
      .from('app_users')
      .select('id')
      .eq('auth_uid', user.id)
      .single()

    const updates: any = {
      status: body.status,
      updated_at: new Date().toISOString()
    }

    if (body.resposta) {
      updates.resposta = body.resposta
    }

    if (body.motivo_rejeicao) {
      updates.motivo_rejeicao = body.motivo_rejeicao
    }

    if (['Aprovada', 'Rejeitada', 'Concluida'].includes(body.status)) {
      updates.data_resposta = new Date().toISOString()
      updates.respondido_por = appUser?.id
    }

    const { data, error } = await client
      .from('solicitacoes_funcionario')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      throw createError({ statusCode: 500, message: error.message })
    }

    return data
  } catch (e: any) {
    console.error('Erro ao atualizar solicitação:', e)
    throw createError({ statusCode: 500, message: e.message || 'Erro ao atualizar solicitação' })
  }
})
