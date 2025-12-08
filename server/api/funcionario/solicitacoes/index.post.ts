import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const client = await serverSupabaseClient(event)
  const user = await serverSupabaseUser(event)
  const body = await readBody(event)

  if (!user) {
    throw createError({ statusCode: 401, message: 'Não autenticado' })
  }

  try {
    // Buscar colaborador_id e empresa_id do usuário
    const { data: appUserData } = await client
      .from('app_users')
      .select('colaborador_id')
      .eq('auth_uid', user.id)
      .single()

    const appUser = appUserData as any
    if (!appUser?.colaborador_id) {
      throw createError({ statusCode: 400, message: 'Usuário não vinculado a um colaborador' })
    }

    // Buscar empresa_id do colaborador
    const { data: colaboradorData } = await client
      .from('colaboradores')
      .select('empresa_id')
      .eq('id', appUser.colaborador_id)
      .single()

    const colaborador = colaboradorData as any
    if (!colaborador?.empresa_id) {
      throw createError({ statusCode: 400, message: 'Colaborador não vinculado a uma empresa' })
    }

    const { data, error } = await client
      .from('solicitacoes_funcionario')
      .insert({
        empresa_id: colaborador.empresa_id,
        colaborador_id: appUser.colaborador_id,
        tipo: body.tipo,
        titulo: body.titulo,
        descricao: body.descricao,
        prioridade: body.prioridade || 'Normal',
        anexos: body.anexos || [],
        metadata: body.metadata || {}
      } as any)
      .select()
      .single()

    if (error) {
      throw createError({ statusCode: 500, message: error.message })
    }

    return data
  } catch (e: any) {
    console.error('Erro ao criar solicitação:', e)
    throw createError({ statusCode: 500, message: e.message || 'Erro ao criar solicitação' })
  }
})
