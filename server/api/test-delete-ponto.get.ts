import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const client = await serverSupabaseClient(event)
  const user = await serverSupabaseUser(event)

  if (!user) {
    return { error: 'Não autenticado' }
  }

  try {
    // Buscar registros de ponto para teste
    const { data: registros, error: registrosError } = await client
      .from('registros_ponto')
      .select('id, data, colaborador_id, entrada_1, saida_1, status')
      .order('data', { ascending: false })
      .limit(5)

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

    // Verificar políticas RLS
    const { data: policies, error: policiesError } = await client
      .rpc('get_table_policies', { table_name: 'registros_ponto' })
      .select()

    return {
      success: true,
      user: {
        id: userId,
        appUser: appUserData
      },
      registros: registros || [],
      totalRegistros: registros?.length || 0,
      policies: policies || [],
      message: 'Teste de DELETE API - Conectividade OK'
    }
  } catch (e: any) {
    return {
      error: 'Erro no teste',
      details: e.message
    }
  }
})