import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const supabase = await serverSupabaseClient(event)
  const user = await serverSupabaseUser(event)

  // O Supabase retorna o ID no campo 'sub', não 'id'
  const userId = user?.sub || user?.id

  if (!user || !userId) {
    throw createError({
      statusCode: 401,
      message: 'Não autenticado',
    })
  }

  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({
      statusCode: 400,
      message: 'ID do holerite é obrigatório',
    })
  }

  try {
    const { data, error } = await supabase
      .from('holerites')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error

    if (!data) {
      throw createError({
        statusCode: 404,
        message: 'Holerite não encontrado',
      })
    }

    // Marcar como visualizado se for funcionário
    const { data: userData } = await supabase
      .from('app_users')
      .select('role')
      .eq('auth_uid', userId)
      .single()

    if (userData?.role === 'funcionario' && !data.visualizado_em) {
      await supabase
        .from('holerites')
        .update({
          visualizado_em: new Date().toISOString(),
          status: 'visualizado',
        })
        .eq('id', id)

      data.visualizado_em = new Date().toISOString()
      data.status = 'visualizado'
    }

    return {
      success: true,
      data,
    }
  } catch (error: any) {
    console.error('Erro ao buscar holerite:', error)
    throw createError({
      statusCode: 500,
      message: error.message || 'Erro ao buscar holerite',
    })
  }
})
