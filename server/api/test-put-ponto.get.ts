import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const client = await serverSupabaseClient(event)
  const user = await serverSupabaseUser(event)

  if (!user) {
    return { error: 'Não autenticado' }
  }

  try {
    // Buscar um registro de ponto para teste
    const { data: registros, error: registrosError } = await client
      .from('registros_ponto')
      .select('id, data, colaborador_id, entrada_1, saida_1')
      .limit(1)

    if (registrosError) {
      return { error: 'Erro ao buscar registros', details: registrosError }
    }

    // Buscar app_user
    const userId = user?.id || user?.sub
    const { data: appUserData, error: userError } = await client
      .from('app_users')
      .select('id, role, colaborador_id')
      .eq('auth_uid', userId)
      .single()

    if (userError) {
      return { error: 'Erro ao buscar usuário', details: userError }
    }

    return {
      success: true,
      user: {
        id: userId,
        appUser: appUserData
      },
      registros: registros || [],
      message: 'Teste de conectividade OK'
    }
  } catch (e: any) {
    return {
      error: 'Erro no teste',
      details: e.message
    }
  }
})