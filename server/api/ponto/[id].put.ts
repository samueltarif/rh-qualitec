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
      .select('id, role, colaborador_id')
      .eq('auth_uid', userId)
      .single()

    const appUser = appUserData as { id: string; role: string; colaborador_id: string | null } | null

    if (!appUser) {
      throw createError({ statusCode: 400, message: 'Usuário não encontrado' })
    }

    // Sistema single-tenant - não precisa validar empresa_id
    // Verificar se o registro existe
    const { data: registroData } = await client
      .from('registros_ponto')
      .select('id')
      .eq('id', id)
      .single()

    if (!registroData) {
      throw createError({ statusCode: 404, message: 'Registro não encontrado' })
    }

    // Preparar dados para atualização
    const updates: Record<string, any> = {
      updated_at: new Date().toISOString()
    }

    if (body.entrada_1 !== undefined) updates.entrada_1 = body.entrada_1 || null
    if (body.saida_1 !== undefined) updates.saida_1 = body.saida_1 || null
    if (body.entrada_2 !== undefined) updates.entrada_2 = body.entrada_2 || null
    if (body.saida_2 !== undefined) updates.saida_2 = body.saida_2 || null
    if (body.entrada_3 !== undefined) updates.entrada_3 = body.entrada_3 || null
    if (body.saida_3 !== undefined) updates.saida_3 = body.saida_3 || null
    if (body.status) updates.status = body.status
    if (body.observacoes !== undefined) updates.observacoes = body.observacoes
    if (body.justificativa !== undefined) updates.justificativa = body.justificativa

    // Marcar como ajustado
    updates.ajustado_por = appUser.id
    updates.ajustado_em = new Date().toISOString()

    const { data, error } = await (client
      .from('registros_ponto') as any)
      .update(updates)
      .eq('id', id)
      .select(`
        *,
        colaborador:colaboradores(
          id, nome, matricula,
          cargo:cargos(id, nome),
          departamento:departamentos!colaboradores_departamento_id_fkey(id, nome)
        )
      `)
      .single()

    if (error) {
      console.error('Erro ao atualizar registro:', error)
      throw createError({ statusCode: 500, message: error.message })
    }

    console.log('✅ Registro de ponto atualizado com sucesso:', id)
    return data
  } catch (e: any) {
    console.error('Erro ao atualizar registro de ponto:', e)
    throw createError({ statusCode: e.statusCode || 500, message: e.message || 'Erro ao atualizar registro' })
  }
})
