import { serverSupabaseServiceRole, serverSupabaseUser } from '#supabase/server'

export default defineEventHandler(async (event) => {
  try {
    const supabase = await serverSupabaseServiceRole(event)
    const user = await serverSupabaseUser(event)

    console.log('=== DEBUG AUTH ASSINATURAS ===')
    console.log('User from serverSupabaseUser:', user)

    if (!user) {
      return {
        error: 'Usuário não autenticado',
        user: null,
        appUser: null,
        canAccess: false
      }
    }

    // Verificar usuário na tabela app_users
    const { data: appUser, error: appUserError } = await supabase
      .from('app_users')
      .select('*')
      .eq('auth_uid', user.id)
      .single()

    console.log('App user:', appUser)
    console.log('App user error:', appUserError)

    // Verificar todos os usuários admin
    const { data: allAdmins } = await supabase
      .from('app_users')
      .select('email, role')
      .in('role', ['admin', 'super_admin'])

    console.log('All admins:', allAdmins)

    const canAccess = appUser && ['admin', 'super_admin'].includes(appUser.role)

    return {
      user: {
        id: user.id,
        email: user.email
      },
      appUser,
      allAdmins,
      canAccess,
      error: appUserError?.message || null
    }

  } catch (error: any) {
    console.error('Erro no teste de auth:', error)
    return {
      error: error.message,
      user: null,
      appUser: null,
      canAccess: false
    }
  }
})