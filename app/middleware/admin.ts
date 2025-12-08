/**
 * Middleware de Proteção Admin - Sistema RH Qualitec
 * 
 * Protege rotas da área administrativa
 * Apenas usuários com role 'admin' podem acessar
 * Redireciona funcionários para área do employee
 */

export default defineNuxtRouteMiddleware(async (to, from) => {
  const supabaseUser = useSupabaseUser()
  const { currentUser, initAuth, isAdmin } = useAppAuth()

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

  // Verificar se é admin
  if (!isAdmin.value) {
    // Não é admin, redirecionar para área do funcionário
    console.warn('Acesso negado: usuário não é admin')
    return navigateTo('/employee')
  }

  // Verificar se é o admin específico (silvana@qualitec.ind.br)
  if (currentUser.value.email !== 'silvana@qualitec.ind.br') {
    console.warn('Acesso negado: apenas silvana@qualitec.ind.br pode acessar área admin')
    return navigateTo('/employee')
  }

  // Admin autenticado, permitir acesso
})
