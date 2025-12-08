/**
 * Composable de Gestão de Usuários - Sistema RH Qualitec
 * 
 * Gerencia CRUD de usuários (app_users)
 * Apenas admin pode usar
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

interface CreateUserData {
  email: string
  password: string
  nome: string
  role?: 'admin' | 'funcionario'
  colaborador_id?: string
}

interface UpdateUserData {
  nome?: string
  role?: 'admin' | 'funcionario'
  colaborador_id?: string
  ativo?: boolean
}

export const useUsers = () => {
  const supabase = useSupabaseClient()
  const config = useRuntimeConfig()

  const users = ref<AppUser[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  /**
   * Listar todos os usuários
   * Usa API do servidor para bypassar RLS
   */
  const fetchUsers = async () => {
    loading.value = true
    error.value = null

    try {
      // Usar API do servidor que bypassa RLS
      const response = await $fetch<{ success: boolean; data: AppUser[] }>('/api/users/list')
      
      if (response.success) {
        users.value = response.data
        return { success: true, data: response.data }
      } else {
        throw new Error('Falha ao carregar usuários')
      }
    } catch (err: any) {
      console.error('Erro ao listar usuários:', err)
      error.value = err.data?.message || err.message || 'Erro ao carregar usuários'
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  /**
   * Buscar usuário por ID
   */
  const fetchUserById = async (id: string) => {
    loading.value = true
    error.value = null

    try {
      const { data, error: fetchError } = await supabase
        .from('app_users')
        .select('*')
        .eq('id', id)
        .single()

      if (fetchError) throw fetchError

      return { success: true, data: data as AppUser }
    } catch (err: any) {
      error.value = err.message
      return { success: false, error: err.message }
    } finally {
      loading.value = false
    }
  }

  /**
   * Criar novo usuário
   * Usa endpoint de API no servidor para segurança
   */
  const createUser = async (userData: CreateUserData) => {
    loading.value = true
    error.value = null

    try {
      // Chamar endpoint de API no servidor
      const response = await $fetch('/api/users/create', {
        method: 'POST',
        body: {
          email: userData.email,
          password: userData.password,
          nome: userData.nome,
          role: userData.role || 'funcionario',
          colaborador_id: userData.colaborador_id,
        },
      })

      // Atualizar lista local
      await fetchUsers()

      return { success: true, data: response.data }
    } catch (err: any) {
      // Extrair mensagem de erro de várias fontes possíveis
      console.error('Erro ao criar usuário:', err)
      
      let errorMessage = 'Erro ao criar usuário'
      
      // Tentar extrair a mensagem de erro do servidor (ordem de prioridade)
      if (err.data?.message) {
        errorMessage = err.data.message
      } else if (err.data?.statusMessage) {
        errorMessage = err.data.statusMessage
      } else if (err.message && !err.message.includes('[POST]')) {
        // Evitar mensagens técnicas como "[POST] /api/users/create: 400"
        errorMessage = err.message
      } else if (err.statusMessage) {
        errorMessage = err.statusMessage
      }
      
      // Limpar mensagens técnicas
      if (errorMessage.includes('[POST]') || errorMessage.includes('[GET]')) {
        // Extrair apenas a parte útil da mensagem
        const match = errorMessage.match(/\d{3}\s+(.+)$/)
        if (match) {
          errorMessage = match[1]
        }
      }
      
      error.value = errorMessage
      return { success: false, error: errorMessage }
    } finally {
      loading.value = false
    }
  }

  /**
   * Atualizar usuário
   * Usa API do servidor para bypassar RLS e atualizar Auth
   */
  const updateUser = async (id: string, userData: UpdateUserData & { email?: string; password?: string }) => {
    loading.value = true
    error.value = null

    try {
      const response = await $fetch<{ success: boolean; data: any }>('/api/users/update', {
        method: 'PUT',
        body: { id, ...userData },
      })

      if (response.success) {
        // Atualizar lista local
        await fetchUsers()
        return { success: true, data: response.data }
      } else {
        throw new Error('Falha ao atualizar usuário')
      }
    } catch (err: any) {
      console.error('Erro ao atualizar usuário:', err)
      const errorMessage = err.data?.message || err.message || 'Erro ao atualizar usuário'
      error.value = errorMessage
      return { success: false, error: errorMessage }
    } finally {
      loading.value = false
    }
  }

  /**
   * Ativar/Desativar usuário
   */
  const toggleUserStatus = async (id: string, ativo: boolean) => {
    return await updateUser(id, { ativo })
  }

  /**
   * Deletar usuário (soft delete - apenas desativa)
   */
  const deleteUser = async (id: string) => {
    return await toggleUserStatus(id, false)
  }

  /**
   * Filtrar usuários
   */
  const filterUsers = (filters: {
    search?: string
    role?: 'admin' | 'funcionario' | 'all'
    status?: 'ativo' | 'inativo' | 'all'
  }) => {
    let filtered = [...users.value]

    // Filtro de busca
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      filtered = filtered.filter(
        (user) =>
          user.nome.toLowerCase().includes(searchLower) ||
          user.email.toLowerCase().includes(searchLower)
      )
    }

    // Filtro de role
    if (filters.role && filters.role !== 'all') {
      filtered = filtered.filter((user) => user.role === filters.role)
    }

    // Filtro de status
    if (filters.status && filters.status !== 'all') {
      const isAtivo = filters.status === 'ativo'
      filtered = filtered.filter((user) => user.ativo === isAtivo)
    }

    return filtered
  }

  /**
   * Contar usuários por role
   */
  const countByRole = computed(() => {
    return {
      admin: users.value.filter((u) => u.role === 'admin').length,
      funcionario: users.value.filter((u) => u.role === 'funcionario').length,
      total: users.value.length,
    }
  })

  /**
   * Contar usuários por status
   */
  const countByStatus = computed(() => {
    return {
      ativo: users.value.filter((u) => u.ativo).length,
      inativo: users.value.filter((u) => !u.ativo).length,
    }
  })

  return {
    // Estado
    users,
    loading,
    error,
    countByRole,
    countByStatus,

    // Métodos
    fetchUsers,
    fetchUserById,
    createUser,
    updateUser,
    toggleUserStatus,
    deleteUser,
    filterUsers,
  }
}
