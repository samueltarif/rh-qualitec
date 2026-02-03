// Composable de autenticação
export interface User {
  id: number
  nome: string
  email: string
  tipo: 'admin' | 'funcionario'
  cargo?: string
  departamento?: string
  foto?: string
  avatar?: string
}

export const useAuth = () => {
  const user = useState<User | null>('auth-user', () => {
    // Tentar recuperar do localStorage ao inicializar
    if (process.client) {
      try {
        const stored = localStorage.getItem('auth-user')
        const parsed = stored ? JSON.parse(stored) : null
        console.log('🔐 [AUTH] Usuário recuperado do localStorage:', parsed?.nome || 'NENHUM')
        return parsed
      } catch (error) {
        console.error('🔐 [AUTH] Erro ao recuperar usuário do localStorage:', error)
        return null
      }
    }
    return null
  })
  
  const isAuthenticated = computed(() => !!user.value)
  const isAdmin = computed(() => user.value?.tipo === 'admin')

  const login = async (email: string, senha: string): Promise<{ success: boolean; message: string }> => {
    try {
      console.log('🔐 [AUTH] Tentativa de login para:', email)
      
      const response = await $fetch('/api/auth/login', {
        method: 'POST',
        body: { email, senha },
        timeout: 30000 // 30 segundos para produção
      })

      console.log('🔐 [AUTH] Resposta do login:', response.success ? 'SUCESSO' : 'FALHA')

      if (response.success && response.user) {
        user.value = response.user
        console.log('🔐 [AUTH] Usuário logado:', response.user.nome, '- Tipo:', response.user.tipo)
        
        // Salvar no localStorage
        if (process.client) {
          try {
            localStorage.setItem('auth-user', JSON.stringify(response.user))
            console.log('🔐 [AUTH] Usuário salvo no localStorage')
          } catch (error) {
            console.error('🔐 [AUTH] Erro ao salvar no localStorage:', error)
          }
        }
        return { success: true, message: 'Login realizado com sucesso!' }
      }

      return { success: false, message: response.message || 'Email ou senha incorretos. Tente novamente.' }
    } catch (error: any) {
      console.error('🔐 [AUTH] Erro no login:', error)
      
      // Tratar diferentes tipos de erro
      if (error.statusCode === 401) {
        return { 
          success: false, 
          message: error.data?.statusMessage || 'Email ou senha incorretos. Verifique suas credenciais.' 
        }
      } else if (error.statusCode === 429) {
        return { 
          success: false, 
          message: 'Muitas tentativas de login. Aguarde alguns minutos antes de tentar novamente.' 
        }
      } else if (error.statusCode === 400) {
        return { 
          success: false, 
          message: 'Dados inválidos. Verifique se preencheu todos os campos corretamente.' 
        }
      } else if (error.statusCode >= 500) {
        return { 
          success: false, 
          message: 'Erro no servidor. Tente novamente em alguns instantes.' 
        }
      } else {
        return { 
          success: false, 
          message: error.data?.statusMessage || error.data?.message || 'Erro de conexão. Verifique sua internet e tente novamente.' 
        }
      }
    }
  }

  const logout = () => {
    console.log('🔐 [AUTH] Fazendo logout...')
    
    // Limpar estado do usuário
    user.value = null
    
    // Limpar localStorage
    if (process.client) {
      try {
        localStorage.removeItem('auth-user')
        console.log('🔐 [AUTH] localStorage limpo')
        
        // CORREÇÃO: Limpar TODOS os estados globais relacionados
        // Limpar notificações
        if (typeof useState === 'function') {
          const notificationsOpen = useState('notifications-open', () => false)
          notificationsOpen.value = false
        }
        
        // Forçar reload da página para limpar todos os estados
        window.location.href = '/login'
        return
      } catch (error) {
        console.error('🔐 [AUTH] Erro ao limpar localStorage:', error)
      }
    }
    
    navigateTo('/login')
  }

  const updateUser = (updatedData: Partial<User>) => {
    if (user.value) {
      user.value = { ...user.value, ...updatedData }
      // Atualizar no localStorage
      if (process.client) {
        localStorage.setItem('auth-user', JSON.stringify(user.value))
      }
    }
  }

  return {
    user,
    isAuthenticated,
    isAdmin,
    login,
    logout,
    updateUser
  }
}
