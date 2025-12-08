import { serverSupabaseUser, serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event)
  const client = await serverSupabaseClient(event)
  
  // O Supabase retorna o ID no campo 'sub', não 'id'
  const userId = user?.id || user?.sub
  
  console.log('🔍 [TEST AUTH] User object:', user)
  console.log('🔍 [TEST AUTH] User ID (id):', user?.id)
  console.log('🔍 [TEST AUTH] User ID (sub):', user?.sub)
  console.log('🔍 [TEST AUTH] User ID final:', userId)
  
  if (!user || !userId) {
    return {
      authenticated: false,
      error: 'Usuário não autenticado ou sessão inválida',
      user: null,
      app_user: null
    }
  }

  // Tentar buscar app_user
  let appUser = null
  try {
    const { data, error } = await client
      .from('app_users')
      .select('id, role, colaborador_id')
      .eq('auth_uid', userId)
      .single()
    
    if (error) {
      console.error('❌ [TEST AUTH] Erro ao buscar app_user:', error)
    } else {
      appUser = data
    }
  } catch (e) {
    console.error('❌ [TEST AUTH] Exception:', e)
  }
  
  return {
    authenticated: true,
    user: {
      id: userId,
      email: user.email,
      id_type: typeof userId,
      id_length: userId?.length,
      is_valid_uuid: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId),
      has_id_field: !!user.id,
      has_sub_field: !!user.sub
    },
    app_user: appUser,
    timestamp: new Date().toISOString()
  }
})
