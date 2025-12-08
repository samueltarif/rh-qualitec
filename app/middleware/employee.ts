/**
 * Middleware de Proteção Employee - Sistema RH Qualitec
 * 
 * Protege rotas da área do funcionário
 * Apenas usuários autenticados podem acessar
 * Verifica se usuário está ativo
 */

export default defineNuxtRouteMiddleware(async (to, from) => {
  const supabaseUser = useSupabaseUser()
  const { currentUser, initAuth, isAuthenticated } = useAppAuth()

  // Se não há usuário autenticado, redirecionar para login
  if (!supabaseUser.value) {
    return navigateTo('/login')
  }

  // Se não temos dados do app_user, buscar
  if (!currentUser.value) {
    await initAuth()
  }

  // Se ainda não tem app_user, redirecionar para login
  if (!currentUser.value) {
    return navigateTo('/login')
  }

  // Verificar se usuário está ativo
  if (!currentUser.value.ativo) {
    console.warn('Acesso negado: usuário inativo')
    
    // Fazer logout
    const supabase = useSupabaseClient()
    await supabase.auth.signOut()
    
    return navigateTo('/login')
  }

  // Verificar se está autenticado
  if (!isAuthenticated.value) {
    return navigateTo('/login')
  }

  // Usuário autenticado e ativo, permitir acesso
})
