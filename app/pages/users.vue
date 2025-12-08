<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <header class="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div class="max-w-7xl mx-auto px-8 py-4">
        <div class="flex items-center justify-between">
          <!-- Logo e Título -->
          <div class="flex items-center gap-4">
            <NuxtLink to="/admin" class="w-10 h-10 bg-red-700 rounded-lg flex items-center justify-center hover:bg-red-800 transition-colors">
              <Icon name="heroicons:arrow-left" class="text-white" size="20" />
            </NuxtLink>
            <div>
              <h1 class="text-xl font-bold text-gray-800">Gestão de Usuários</h1>
              <p class="text-sm text-gray-500">Gerenciar usuários do sistema</p>
            </div>
          </div>

          <!-- Profile Dropdown -->
          <UserProfileDropdown theme="admin" />
        </div>
      </div>
    </header>

    <!-- Content -->
    <div class="max-w-7xl mx-auto p-8">
      <!-- Colaboradores sem Acesso -->
      <ColaboradoresSemAcessoCard 
        v-if="colaboradoresSemAcesso.length > 0"
        :colaboradores-sem-acesso="colaboradoresSemAcesso"
        @criar-acesso="handleCriarAcessoColaborador"
        class="mb-8"
      />

      <!-- Estatísticas -->
      <div class="grid md:grid-cols-4 gap-6 mb-8">
        <div class="card bg-red-50 border-2 border-red-200">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 bg-red-700 rounded-lg flex items-center justify-center">
              <Icon name="heroicons:users" class="text-white" size="24" />
            </div>
            <div>
              <p class="text-sm text-gray-600">Total</p>
              <p class="text-2xl font-bold text-gray-800">{{ countByRole.total }}</p>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 bg-red-600 rounded-lg flex items-center justify-center">
              <Icon name="heroicons:shield-check" class="text-white" size="24" />
            </div>
            <div>
              <p class="text-sm text-gray-600">Admins</p>
              <p class="text-2xl font-bold text-gray-800">{{ countByRole.admin }}</p>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
              <Icon name="heroicons:user-group" class="text-white" size="24" />
            </div>
            <div>
              <p class="text-sm text-gray-600">Funcionários</p>
              <p class="text-2xl font-bold text-gray-800">{{ countByRole.funcionario }}</p>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center">
              <Icon name="heroicons:check-circle" class="text-white" size="24" />
            </div>
            <div>
              <p class="text-sm text-gray-600">Ativos</p>
              <p class="text-2xl font-bold text-gray-800">{{ countByStatus.ativo }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Filtros e Ações -->
      <div class="card mb-8">
        <div class="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <!-- Filtros -->
          <div class="flex flex-col md:flex-row gap-4 flex-1">
            <!-- Busca -->
            <div class="flex-1">
              <UIInput
                v-model="filters.search"
                type="text"
                placeholder="Buscar por nome ou email..."
                icon-left="heroicons:magnifying-glass"
              />
            </div>

            <!-- Filtro Role -->
            <UISelect
              v-model="filters.role"
              icon-left="heroicons:user-circle"
              class="w-full md:w-48"
            >
              <option value="all">Todos os roles</option>
              <option value="admin">Admin</option>
              <option value="funcionario">Funcionário</option>
            </UISelect>

            <!-- Filtro Status -->
            <UISelect
              v-model="filters.status"
              icon-left="heroicons:check-badge"
              class="w-full md:w-48"
            >
              <option value="all">Todos os status</option>
              <option value="ativo">Ativos</option>
              <option value="inativo">Inativos</option>
            </UISelect>
          </div>

          <!-- Botão Novo Usuário -->
          <NewUserButton @click="showCreateModal = true" />
        </div>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="card text-center py-12">
        <Icon name="heroicons:arrow-path" class="animate-spin text-gray-400 mx-auto mb-4" size="48" />
        <p class="text-gray-600">Carregando usuários...</p>
      </div>

      <!-- Lista de Usuários -->
      <div v-else-if="filteredUsers.length > 0" class="card overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gray-50 border-b border-gray-200">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Usuário</th>
                <th class="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Email</th>
                <th class="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Role</th>
                <th class="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                <th class="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Criado em</th>
                <th class="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Ações</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              <tr v-for="user in filteredUsers" :key="user.id" class="hover:bg-gray-50">
                <td class="px-6 py-4">
                  <div class="flex items-center gap-3">
                    <div 
                      class="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold"
                      :class="user.role === 'admin' ? 'bg-red-700' : 'bg-blue-900'"
                    >
                      {{ getInitials(user.nome) }}
                    </div>
                    <div class="flex items-center gap-2">
                      <p class="font-medium text-gray-800">{{ user.nome }}</p>
                      <span 
                        v-if="user.role === 'admin'" 
                        class="text-xl"
                        title="Administradora"
                      >
                        👑
                      </span>
                      <span 
                        v-else 
                        class="text-lg"
                        title="Funcionário"
                      >
                        👤
                      </span>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 text-sm text-gray-600">{{ user.email }}</td>
                <td class="px-6 py-4">
                  <span 
                    class="badge"
                    :class="user.role === 'admin' ? 'badge-error' : 'badge-info'"
                  >
                    {{ user.role }}
                  </span>
                </td>
                <td class="px-6 py-4">
                  <span 
                    class="badge"
                    :class="user.ativo ? 'badge-success' : 'badge-warning'"
                  >
                    {{ user.ativo ? 'Ativo' : 'Inativo' }}
                  </span>
                </td>
                <td class="px-6 py-4 text-sm text-gray-600">
                  {{ formatDate(user.created_at) }}
                </td>
                <td class="px-6 py-4">
                  <UserTableActions
                    :is-active="user.ativo"
                    @toggle-status="handleToggleStatus(user)"
                    @edit="handleEdit(user)"
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="card text-center py-12">
        <Icon name="heroicons:users" class="text-gray-300 mx-auto mb-4" size="64" />
        <h3 class="text-lg font-semibold text-gray-800 mb-2">Nenhum usuário encontrado</h3>
        <p class="text-gray-600 mb-6">Ajuste os filtros ou crie um novo usuário</p>
        <NewUserButton @click="showCreateModal = true" />
      </div>
    </div>

    <!-- Modal Criar Usuário -->
    <UserFormModal
      v-if="showCreateModal"
      :is-editing="false"
      :form="form"
      :saving="saving"
      :colaboradores="colaboradoresDisponiveis"
      @close="closeModal"
      @submit="handleSubmit"
      @update:form="form = $event"
    />

    <!-- Modal Editar Usuário -->
    <UserEditModal
      v-if="showEditModal && selectedUser"
      :user="selectedUser"
      :colaboradores="colaboradoresDisponiveis"
      @close="closeEditModal"
      @save="handleSaveEdit"
    />

    <!-- Modal Criar Acesso de Colaborador -->
    <UserCreateFromColaboradorModal
      v-if="showCreateFromColaboradorModal && selectedColaborador"
      :colaborador="selectedColaborador"
      @close="closeCreateFromColaboradorModal"
      @save="handleSaveCreateFromColaborador"
    />
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: ['admin'],
  layout: false,
})

const { 
  users, 
  loading, 
  countByRole, 
  countByStatus,
  fetchUsers,
  filterUsers,
  toggleUserStatus,
  createUser,
  updateUser,
} = useUsers()

// Filtros
const filters = ref({
  search: '',
  role: 'all' as 'all' | 'admin' | 'funcionario',
  status: 'all' as 'all' | 'ativo' | 'inativo',
})

// Modals
const showCreateModal = ref(false)
const showEditModal = ref(false)
const showCreateFromColaboradorModal = ref(false)
const selectedUser = ref<any>(null)
const selectedColaborador = ref<any>(null)
const saving = ref(false)

// Form
const defaultForm = {
  nome: '',
  email: '',
  password: '',
  role: 'funcionario' as 'admin' | 'funcionario',
  colaborador_id: '',
  ativo: true,
}
const form = ref({ ...defaultForm })

// Colaboradores disponíveis
const colaboradoresDisponiveis = ref<any[]>([])
const todosColaboradores = ref<any[]>([])

// Usuários filtrados
const filteredUsers = computed(() => {
  return filterUsers(filters.value)
})

// Colaboradores sem acesso ao sistema
const colaboradoresSemAcesso = computed(() => {
  const usuariosComColaborador = users.value
    .filter(u => u.colaborador_id)
    .map(u => u.colaborador_id)
  
  // Filtrar colaboradores ativos que não têm usuário
  // E excluir aqueles que têm email de admin (silvana@qualitec.ind.br)
  return todosColaboradores.value.filter(c => {
    const temUsuario = usuariosComColaborador.includes(c.id)
    const isEmailAdmin = c.email_corporativo?.toLowerCase() === 'silvana@qualitec.ind.br'
    
    return c.status === 'Ativo' && !temUsuario && !isEmailAdmin
  })
})

// Carregar usuários e colaboradores ao montar
onMounted(async () => {
  await Promise.all([fetchUsers(), fetchColaboradores()])
})

const fetchColaboradores = async () => {
  const supabase = useSupabaseClient()
  
  // Buscar colaboradores disponíveis (sem usuário)
  const { data: disponiveis } = await (supabase as any)
    .from('colaboradores')
    .select('id, nome, email_corporativo')
    .eq('status', 'Ativo')
    .order('nome')
  colaboradoresDisponiveis.value = disponiveis || []
  
  // Buscar todos colaboradores ativos (para verificar quem não tem acesso)
  const { data: todos } = await (supabase as any)
    .from('colaboradores')
    .select('id, nome, cpf, email_corporativo, status, cargo:cargo_id(id, nome)')
    .eq('status', 'Ativo')
    .order('nome')
  todosColaboradores.value = todos || []
}

// Funções auxiliares
const getInitials = (nome: string) => {
  const names = nome.split(' ')
  if (names.length === 1) {
    return names[0].substring(0, 2).toUpperCase()
  }
  return (names[0][0] + names[names.length - 1][0]).toUpperCase()
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

// Handlers
const closeModal = () => {
  showCreateModal.value = false
  showEditModal.value = false
  form.value = { ...defaultForm }
}

const handleSubmit = async () => {
  // Validações
  if (!form.value.nome || !form.value.email) {
    alert('❌ Nome e email são obrigatórios!')
    return
  }

  if (!form.value.password || form.value.password.length < 6) {
    alert('❌ Senha deve ter no mínimo 6 caracteres!')
    return
  }

  // Validar formato de email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(form.value.email)) {
    alert('❌ Email inválido! Use um formato válido como: usuario@empresa.com')
    return
  }

  saving.value = true
  try {
    const result = await createUser({
      nome: form.value.nome,
      email: form.value.email.toLowerCase().trim(), // Normalizar email
      password: form.value.password,
      role: form.value.role,
      colaborador_id: form.value.colaborador_id || undefined,
    })

    if (result.success) {
      alert('✅ Usuário criado com sucesso!\n\nO usuário já pode fazer login no sistema.')
      closeModal()
    } else {
      alert(`❌ Erro ao criar usuário:\n\n${result.error}`)
    }
  } catch (error: any) {
    alert(`❌ Erro ao criar usuário:\n\n${error.message || 'Erro desconhecido'}`)
  } finally {
    saving.value = false
  }
}

const handleToggleStatus = async (user: any) => {
  const action = user.ativo ? 'desativar' : 'ativar'
  if (confirm(`Deseja ${action} o usuário ${user.nome}?`)) {
    const result = await toggleUserStatus(user.id, !user.ativo)
    if (result.success) {
      alert(`Usuário ${action}do com sucesso!`)
    } else {
      alert(`Erro ao ${action} usuário: ${result.error}`)
    }
  }
}

const handleEdit = (user: any) => {
  selectedUser.value = user
  showEditModal.value = true
}

const closeEditModal = () => {
  showEditModal.value = false
  selectedUser.value = null
}

const handleSaveEdit = async (updateData: any) => {
  if (!selectedUser.value) return
  
  saving.value = true
  try {
    const result = await updateUser(selectedUser.value.id, updateData)
    
    if (result.success) {
      alert('✅ Usuário atualizado com sucesso!')
      closeEditModal()
    } else {
      alert(`❌ Erro ao atualizar usuário:\n\n${result.error}`)
    }
  } catch (error: any) {
    alert(`❌ Erro ao atualizar usuário:\n\n${error.message || 'Erro desconhecido'}`)
  } finally {
    saving.value = false
  }
}

const handleCriarAcessoColaborador = (colaborador: any) => {
  selectedColaborador.value = colaborador
  showCreateFromColaboradorModal.value = true
}

const closeCreateFromColaboradorModal = () => {
  showCreateFromColaboradorModal.value = false
  selectedColaborador.value = null
}

const handleSaveCreateFromColaborador = async (userData: any) => {
  saving.value = true
  try {
    const result = await createUser(userData)
    
    if (result.success) {
      alert('✅ Acesso criado com sucesso!\n\nO colaborador já pode fazer login no sistema.')
      closeCreateFromColaboradorModal()
      await fetchColaboradores() // Atualizar lista
    } else {
      alert(`❌ Erro ao criar acesso:\n\n${result.error}`)
    }
  } catch (error: any) {
    alert(`❌ Erro ao criar acesso:\n\n${error.message || 'Erro desconhecido'}`)
  } finally {
    saving.value = false
  }
}
</script>
