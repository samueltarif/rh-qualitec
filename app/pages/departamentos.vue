<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <header class="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div class="max-w-7xl mx-auto px-8 py-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-4">
            <NuxtLink to="/admin" class="w-10 h-10 bg-red-700 rounded-lg flex items-center justify-center hover:bg-red-800 transition-colors">
              <Icon name="heroicons:arrow-left" class="text-white" size="20" />
            </NuxtLink>
            <div>
              <h1 class="text-xl font-bold text-gray-800">Gestão de Departamentos</h1>
              <p class="text-sm text-gray-500">Organizar setores e áreas da empresa</p>
            </div>
          </div>
          <UserProfileDropdown theme="admin" />
        </div>
      </div>
    </header>

    <!-- Content -->
    <div class="max-w-7xl mx-auto p-8">
      <!-- Estatísticas -->
      <div class="grid md:grid-cols-3 gap-6 mb-8">
        <div class="card bg-red-50 border-2 border-red-200">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 bg-red-700 rounded-lg flex items-center justify-center">
              <Icon name="heroicons:building-office" class="text-white" size="24" />
            </div>
            <div>
              <p class="text-sm text-gray-600">Total</p>
              <p class="text-2xl font-bold text-gray-800">{{ countByStatus.total }}</p>
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

        <div class="card">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 bg-gray-600 rounded-lg flex items-center justify-center">
              <Icon name="heroicons:x-circle" class="text-white" size="24" />
            </div>
            <div>
              <p class="text-sm text-gray-600">Inativos</p>
              <p class="text-2xl font-bold text-gray-800">{{ countByStatus.inativo }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Filtros e Ações -->
      <div class="card mb-8">
        <div class="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <div class="flex flex-col md:flex-row gap-4 flex-1">
            <div class="flex-1">
              <UIInput
                v-model="filters.search"
                type="text"
                placeholder="Buscar por nome, descrição..."
                icon-left="heroicons:magnifying-glass"
              />
            </div>
            <UISelect v-model="filters.status" class="w-full md:w-40">
              <option value="all">Todos Status</option>
              <option value="ativo">Ativos</option>
              <option value="inativo">Inativos</option>
            </UISelect>
          </div>
          <UIButton theme="admin" variant="primary" icon-left="heroicons:plus" @click="openCreateModal">
            Novo Departamento
          </UIButton>
        </div>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="card text-center py-12">
        <Icon name="heroicons:arrow-path" class="animate-spin text-gray-400 mx-auto mb-4" size="48" />
        <p class="text-gray-600">Carregando departamentos...</p>
      </div>

      <!-- Lista -->
      <div v-else-if="filteredDepartamentos.length > 0" class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div v-for="dep in filteredDepartamentos" :key="dep.id" class="card hover:shadow-lg transition-shadow">
          <div class="flex items-start justify-between mb-4">
            <div class="flex items-center gap-3">
              <div class="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                <Icon name="heroicons:building-office" class="text-white" size="24" />
              </div>
              <div>
                <h3 class="font-bold text-gray-800">{{ dep.nome }}</h3>
                <p v-if="dep.centro_custo" class="text-xs text-gray-500">CC: {{ dep.centro_custo }}</p>
              </div>
            </div>
            <span class="badge" :class="dep.ativo ? 'badge-success' : 'badge-warning'">
              {{ dep.ativo ? 'Ativo' : 'Inativo' }}
            </span>
          </div>

          <p v-if="dep.descricao" class="text-sm text-gray-600 mb-4 line-clamp-2">
            {{ dep.descricao }}
          </p>
          <p v-else class="text-sm text-gray-400 italic mb-4">Sem descrição</p>

          <div class="flex items-center justify-between pt-4 border-t border-gray-200">
            <div class="flex gap-2">
              <button
                class="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                title="Editar"
                @click="openEditModal(dep)"
              >
                <Icon name="heroicons:pencil" size="18" />
              </button>
              <button
                class="p-2 rounded-lg transition-colors"
                :class="dep.ativo ? 'text-gray-500 hover:text-orange-600 hover:bg-orange-50' : 'text-gray-500 hover:text-green-600 hover:bg-green-50'"
                :title="dep.ativo ? 'Desativar' : 'Ativar'"
                @click="handleToggleStatus(dep)"
              >
                <Icon :name="dep.ativo ? 'heroicons:pause' : 'heroicons:play'" size="18" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="card text-center py-12">
        <Icon name="heroicons:building-office" class="text-gray-300 mx-auto mb-4" size="64" />
        <h3 class="text-lg font-semibold text-gray-800 mb-2">Nenhum departamento encontrado</h3>
        <p class="text-gray-600 mb-6">Ajuste os filtros ou crie um novo departamento</p>
        <UIButton theme="admin" variant="primary" icon-left="heroicons:plus" @click="openCreateModal">
          Novo Departamento
        </UIButton>
      </div>
    </div>

    <!-- Modal Criar/Editar -->
    <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center">
      <div class="absolute inset-0 bg-black/50" @click="closeModal"></div>
      <div class="relative bg-white rounded-xl shadow-xl w-full max-w-md mx-4 p-6">
        <h3 class="text-xl font-bold text-gray-800 mb-6">
          {{ isEditing ? 'Editar Departamento' : 'Novo Departamento' }}
        </h3>

        <form @submit.prevent="handleSubmit">
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-2">Nome *</label>
            <UIInput v-model="form.nome" type="text" placeholder="Ex: Recursos Humanos" required />
          </div>

          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-2">Centro de Custo</label>
            <UIInput v-model="form.centro_custo" type="text" placeholder="Ex: CC-001" />
          </div>

          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-2">Gestor</label>
            <UISelect v-model="form.gestor_id">
              <option value="">Nenhum gestor</option>
              <option v-for="col in colaboradoresDisponiveis" :key="col.id" :value="col.id">
                {{ col.nome }}
              </option>
            </UISelect>
          </div>

          <div class="mb-6">
            <label class="block text-sm font-medium text-gray-700 mb-2">Descrição</label>
            <textarea
              v-model="form.descricao"
              rows="3"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              placeholder="Descrição do departamento..."
            ></textarea>
          </div>

          <div class="flex gap-3">
            <UIButton type="button" theme="admin" variant="secondary" full-width @click="closeModal">
              Cancelar
            </UIButton>
            <UIButton type="submit" theme="admin" variant="primary" full-width :disabled="saving">
              {{ saving ? 'Salvando...' : (isEditing ? 'Salvar' : 'Criar') }}
            </UIButton>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: ['admin'],
  layout: false,
})

const {
  departamentos,
  loading,
  countByStatus,
  fetchDepartamentos,
  filterDepartamentos,
  createDepartamento,
  updateDepartamento,
  toggleDepartamentoStatus,
  fetchColaboradoresParaGestor,
} = useDepartamentos()

// Filtros
const filters = ref({ search: '', status: 'all' as 'all' | 'ativo' | 'inativo' })

// Modal
const showModal = ref(false)
const isEditing = ref(false)
const editingId = ref<string | null>(null)
const saving = ref(false)

// Form
const form = ref({
  nome: '',
  descricao: '',
  centro_custo: '',
  gestor_id: '',
})

// Colaboradores
const colaboradoresDisponiveis = ref<any[]>([])

// Departamentos filtrados
const filteredDepartamentos = computed(() => filterDepartamentos(filters.value))

// Carregar dados
onMounted(async () => {
  await fetchDepartamentos()
  const result = await fetchColaboradoresParaGestor()
  if (result.success) {
    colaboradoresDisponiveis.value = result.data || []
  }
})

// Modal handlers
const openCreateModal = () => {
  isEditing.value = false
  editingId.value = null
  form.value = { nome: '', descricao: '', centro_custo: '', gestor_id: '' }
  showModal.value = true
}

const openEditModal = (dep: any) => {
  isEditing.value = true
  editingId.value = dep.id
  form.value = {
    nome: dep.nome,
    descricao: dep.descricao || '',
    centro_custo: dep.centro_custo || '',
    gestor_id: dep.gestor_id || '',
  }
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  form.value = { nome: '', descricao: '', centro_custo: '', gestor_id: '' }
}

const handleSubmit = async () => {
  if (!form.value.nome) {
    alert('Nome é obrigatório!')
    return
  }

  saving.value = true
  try {
    const data = {
      nome: form.value.nome,
      descricao: form.value.descricao || undefined,
      centro_custo: form.value.centro_custo || undefined,
      gestor_id: form.value.gestor_id || undefined,
    }

    if (isEditing.value && editingId.value) {
      const result = await updateDepartamento(editingId.value, data)
      if (result.success) {
        alert('Departamento atualizado com sucesso!')
        closeModal()
      } else {
        alert(`Erro: ${result.error}`)
      }
    } else {
      const result = await createDepartamento(data)
      if (result.success) {
        alert('Departamento criado com sucesso!')
        closeModal()
      } else {
        alert(`Erro: ${result.error}`)
      }
    }
  } finally {
    saving.value = false
  }
}

const handleToggleStatus = async (dep: any) => {
  const action = dep.ativo ? 'desativar' : 'ativar'
  if (confirm(`Deseja ${action} o departamento "${dep.nome}"?`)) {
    const result = await toggleDepartamentoStatus(dep.id, !dep.ativo)
    if (result.success) {
      alert(`Departamento ${action}do com sucesso!`)
    } else {
      alert(`Erro: ${result.error}`)
    }
  }
}
</script>
