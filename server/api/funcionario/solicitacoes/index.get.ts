import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const client = await serverSupabaseClient(event)
  const user = await serverSupabaseUser(event)
  const query = getQuery(event)

  if (!user) {
    throw createError({ statusCode: 401, message: 'Não autenticado' })
  }

  try {
    // Buscar colaborador_id do usuário
    const { data: appUserData } = await client
      .from('app_users')
      .select('colaborador_id')
      .eq('auth_uid', user.id)
      .single()

    const appUser = appUserData as any
    if (!appUser?.colaborador_id) {
      return []
    }

    let queryBuilder = client
      .from('solicitacoes_funcionario')
      .select(`
        *,
        respondido:app_users!solicitacoes_funcionario_respondido_por_fkey(nome)
      `)
      .eq('colaborador_id', appUser.colaborador_id)
      .order('created_at', { ascending: false })

    if (query.status && query.status !== 'todos') {
      queryBuilder = queryBuilder.eq('status', query.status)
    }

    if (query.tipo) {
      queryBuilder = queryBuilder.eq('tipo', query.tipo)
    }

    const { data, error } = await queryBuilder

    if (error) {
      throw createError({ statusCode: 500, message: error.message })
    }

    return data || []
  } catch (e: any) {
    console.error('Erro ao buscar solicitações:', e)
    throw createError({ statusCode: 500, message: e.message || 'Erro ao buscar solicitações' })
  }
})
