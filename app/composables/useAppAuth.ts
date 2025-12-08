/**
 * Composable de Autenticação - Sistema RH Qualitec
 * 
 * Gerencia autenticação de usuários com Supabase
 * Controla acesso Admin/Funcionário
 * Integra com tabela app_users
 */

interface AppUser {
  id: string
  auth_uid: string | null
  email: string
  nome: string
  role: 'admin' | 'funcionario'
  avatar_url?: string
  colaborador_id?: string
  ativo: boolean
  ultimo_acesso?: string
  created_at: string
  updated_at: string
}

interface LoginCredentials {
  email: string
  password: string
}

interface AuthState {
  user: AppUser | null
  loading: boolean
  error: string | null
}

export const useAppAuth = () => {
  const supabase = useSupabaseClient()
  const supabaseUser = useSupabaseUser()
  const router = useRouter()

  // Estado reativo
  const authState = useState<AuthState>('auth-state', () => ({
    user: null,
    loading: false,
    error: null
  }))

  /**
   * Busca dados do usuário na tabela app_users
   */
  const fetchAppUser = async (authUid: string): Promise<AppUser | null> => {
    try {
      // Validar authUid antes de fazer a query
      if (!authUid || authUid === 'undefined' || authUid === 'null') {
        console.error('❌ [AUTH] authUid inválido:', authUid)
        return null
      }

      const { data, error } = await supabase
        .from('app_users')
        .select('*')
        .eq('auth_uid', authUid)
        .eq('ativo', true)
        .single()

      if (error) {
        console.error('❌ [AUTH] Erro ao buscar app_user:', error)
        return null
      }

      return data as AppUser
    } catch (err) {
      console.error('❌ [AUTH] Erro ao buscar app_user:', err)
      return null
    }
  }

  /**
   * Atualiza último acesso do usuário
   */
  const updateLastAccess = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('app_users')
        .update({ ultimo_acesso: new Date().toISOString() } as any)
        .eq('id', userId)
      
      if (error) {
        console.error('Erro ao atualizar último acesso:', error)
      }
    } catch (err) {
      console.error('Erro ao atualizar último acesso:', err)
    }
  }

  /**
   * Login com email e senha
   */
  const login = async (credentials: LoginCredentials) => {
    authState.value.loading = true
    authState.value.error = null

    try {
      // 1. Autenticar no Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password
      })

      if (authError) {
        throw new Error(authError.message)
      }

      if (!authData.user) {
        throw new Error('Usuário não encontrado')
      }

      // 2. Buscar dados do usuário em app_users
      const appUser = await fetchAppUser(authData.user.id)

      if (!appUser) {
        // Usuário existe no Auth mas não em app_users
        await supabase.auth.signOut()
        throw new Error('Usuário não cadastrado no sistema. Entre em contato com o administrador.')
      }

      if (!appUser.ativo) {
        await supabase.auth.signOut()
        throw new Error('Usuário inativo. Entre em contato com o administrador.')
      }

      // 3. Atualizar estado
      authState.value.user = appUser

      // 4. Atualizar último acesso
      await updateLastAccess(appUser.id)

      // 5. Redirecionar baseado no role
      if (appUser.role === 'admin') {
        await router.push('/admin')
      } else {
        await router.push('/employee')
      }

      return { success: true, user: appUser }
    } catch (err: any) {
      authState.value.error = err.message
      return { success: false, error: err.message }
    } finally {
      authState.value.loading = false
    }
  }

  /**
   * Logout
   */
  const logout = async () => {
    authState.value.loading = true

    try {
      await supabase.auth.signOut()
      authState.value.user = null
      await router.push('/login')
    } catch (err: any) {
      console.error('Erro ao fazer logout:', err)
      authState.value.error = err.message
    } finally {
      authState.value.loading = false
    }
  }

  /**
   * Inicializa autenticação (verifica sessão existente)
   */
  const initAuth = async () => {
    authState.value.loading = true

    try {
      // Verificar se há usuário autenticado no Supabase
      if (supabaseUser.value) {
        const appUser = await fetchAppUser(supabaseUser.value.id)
        
        if (appUser && appUser.ativo) {
          authState.value.user = appUser
          await updateLastAccess(appUser.id)
        } else {
          // Usuário não encontrado ou inativo, fazer logout
          await supabase.auth.signOut()
          authState.value.user = null
        }
      }
    } catch (err) {
      console.error('Erro ao inicializar autenticação:', err)
      authState.value.user = null
    } finally {
      authState.value.loading = false
    }
  }

  /**
   * Verifica se usuário está autenticado
   */
  const isAuthenticated = computed(() => {
    return !!authState.value.user && !!supabaseUser.value
  })

  /**
   * Verifica se usuário é admin
   */
  const isAdmin = computed(() => {
    return authState.value.user?.role === 'admin'
  })

  /**
   * Verifica se usuário é funcionário
   */
  const isEmployee = computed(() => {
    return authState.value.user?.role === 'funcionario'
  })

  /**
   * Retorna o usuário atual
   */
  const currentUser = computed(() => {
    return authState.value.user
  })

  /**
   * Verifica se está carregando
   */
  const isLoading = computed(() => {
    return authState.value.loading
  })

  /**
   * Retorna erro atual
   */
  const error = computed(() => {
    return authState.value.error
  })

  /**
   * Limpa erro
   */
  const clearError = () => {
    authState.value.error = null
  }

  return {
    // Estado
    currentUser,
    isAuthenticated,
    isAdmin,
    isEmployee,
    isLoading,
    error,

    // Métodos
    login,
    logout,
    initAuth,
    clearError,
    fetchAppUser,
  }
}
