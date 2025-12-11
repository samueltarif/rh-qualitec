import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const supabase = await serverSupabaseClient(event)
  const user = await serverSupabaseUser(event)

  if (!user) {
    throw createError({
      statusCode: 401,
      message: 'Não autenticado'
    })
  }

  // Verificar se é admin
  const { data: usuario } = await supabase
    .from('app_users')
    .select('role')
    .eq('auth_uid', user.id)
    .single()

  if (!usuario || !['admin', 'super_admin'].includes(usuario.role)) {
    throw createError({
      statusCode: 403,
      message: 'Acesso negado'
    })
  }

  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({
      statusCode: 400,
      message: 'ID da assinatura é obrigatório'
    })
  }

  const { data: assinatura, error } = await supabase
    .from('assinaturas_ponto')
    .select(`
      *,
      colaborador:colaboradores(
        id,
        nome,
        email,
        cargo,
        departamento
      )
    `)
    .eq('id', id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      throw createError({
        statusCode: 404,
        message: 'Assinatura não encontrada'
      })
    }
    throw createError({
      statusCode: 500,
      message: 'Erro ao buscar assinatura'
    })
  }

  return assinatura
})