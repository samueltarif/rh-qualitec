/**
 * Middleware Global de Redirecionamento - Sistema RH Qualitec
 * 
 * Executa em todas as rotas
 * Redireciona usuários autenticados para área correta
 * Redireciona usuários não autenticados para login
 */

export default defineNuxtRouteMiddleware(async (to, from) => {
  const supabaseUser = useSupabaseUser()
  const { currentUser, initAuth } = useAppAuth()

  // Páginas públicas que não precisam de autenticação
  const publicPages = ['/', '/login']
  const isPublicPage = publicPages.includes(to.path)

  // Se não há usuário do Supabase, não há sessão
  if (!supabaseUser.value) {
    // Se tentar acessar página protegida, redirecionar para login
    if (!isPublicPage) {
      return navigateTo('/login')
    }
    return
  }

  // Se há usuário do Supabase mas não temos dados do app_user, buscar
  if (supabaseUser.value && !currentUser.value) {
    await initAuth()
  }

  // Se não conseguiu carregar app_user, redirecionar para login
  if (!currentUser.value) {
    if (!isPublicPage) {
      return navigateTo('/login')
    }
    return
  }

  // Usuário autenticado tentando acessar página de login
  if (to.path === '/login' && currentUser.value) {
    // Redirecionar para área correta baseado no role
    if (currentUser.value.role === 'admin') {
      return navigateTo('/admin')
    } else {
      return navigateTo('/employee')
    }
  }

  // Usuário autenticado acessando raiz (/)
  if (to.path === '/' && currentUser.value) {
    // Redirecionar para área correta baseado no role
    if (currentUser.value.role === 'admin') {
      return navigateTo('/admin')
    } else {
      return navigateTo('/employee')
    }
  }
})
