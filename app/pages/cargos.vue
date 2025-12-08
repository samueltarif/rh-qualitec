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
              <h1 class="text-xl font-bold text-gray-800">Gestão de Cargos</h1>
              <p class="text-sm text-gray-500">Gerenciar cargos e níveis do sistema</p>
            </div>
          </div>
          <UserProfileDropdown theme="admin" />
        </div>
      </div>
    </header>

    <!-- Content -->
    <div class="max-w-7xl mx-auto p-8">
      <!-- Estatísticas -->
      <div class="grid md:grid-cols-4 gap-6 mb-8">
        <div class="card bg-red-50 border-2 border-red-200">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 bg-red-700 rounded-lg flex items-center justify-center">
              <Icon name="heroicons:briefcase" class="text-white" size="24" />
            </div>
            <div>
              <p class="text-sm text-gray-600">Total</p>
              <p class="text-2xl font-bold text-gray-800">{{ countByNivel.total }}</p>
            </div>
          </div>
        </div>
        <div class="card">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
              <Icon name="heroicons:wrench-screwdriver" class="text-white" size="24" />
            </div>
            <div>
              <p class="text-sm text-gray-600">Operacional</p>
              <p class="text-2xl font-bold text-gray-800">{{ countByNivel.operacional }}</p>
            </div>
          </div>
        </div>
        <div class="card">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center">
              <Icon name="heroicons:shield-check" class="text-white" size="24" />
            </div>
            <div>
              <p class="text-sm text-gray-600">Gestão</p>
              <p class="text-2xl font-bold text-gray-800">{{ countByNivel.gestao }}</p>
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
          <div class="flex flex-col md:flex-row gap-4 flex-1">
            <div class="flex-1">
              <UIInput v-model="filters.search" type="text" placeholder="Buscar por nome..." icon-left="heroicons:magnifying-glass" />
            </div>
            <UISelect v-model="filters.nivel" class="w-full md:w-48">
              <option value="all">Todos os níveis</option>
              <option value="operacional">Operacional</option>
              <option value="gestao">Gestão</option>
            </UISelect>
            <UISelect v-model="filters.status" class="w-full md:w-48">
              <option value="all">Todos os status</option>
              <option value="ativo">Ativos</option>
              <option value="inativo">Inativos</option>
            </UISelect>
          </div>
          <UIButton theme="admin" variant="primary" icon-left="heroicons:plus" @click="openCreateModal">Novo Cargo</UIButton>
        </div>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="card text-center py-12">
        <Icon name="heroicons:arrow-path" class="animate-spin text-gray-400 mx-auto mb-4" size="48" />
        <p class="text-gray-600">Carregando cargos...</p>
      </div>

      <!-- Lista de Cargos -->
      <div v-else-if="filteredCargos.length > 0" class="card overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gray-50 border-b border-gray-200">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Cargo</th>
                <th class="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Nível</th>
                <th class="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Descrição</th>
                <th class="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                <th class="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Ações</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              <tr v-for="cargo in filteredCargos" :key="cargo.id" class="hover:bg-gray-50">
                <td class="px-6 py-4">
                  <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-full flex items-center justify-center text-white" :class="cargo.nivel === 'gestao' ? 'bg-purple-600' : 'bg-blue-600'">
                      <Icon :name="cargo.nivel === 'gestao' ? 'heroicons:shield-check' : 'heroicons:wrench-screwdriver'" size="20" />
                    </div>
                    <div class="flex items-center gap-2">
                      <p class="font-medium text-gray-800">{{ cargo.nome }}</p>
                      <span 
                        v-if="cargo.nivel === 'gestao'" 
                        class="text-xl"
                        title="Cargo de Gestão"
                      >
                        👑
                      </span>
                      <span 
                        v-else 
                        class="text-lg"
                        title="Cargo Operacional"
                      >
                        👷
                      </span>
                      <p v-if="cargo.nivel === 'gestao' && cargo.gestores?.length" class="text-xs text-gray-500 ml-2">{{ cargo.gestores.length }} gestor(es)</p>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4">
                  <span class="badge" :class="cargo.nivel === 'gestao' ? 'badge-error' : 'badge-info'">{{ cargo.nivel === 'gestao' ? 'Gestão' : 'Operacional' }}</span>
                </td>
                <td class="px-6 py-4 text-sm text-gray-600">{{ cargo.descricao || '-' }}</td>
                <td class="px-6 py-4">
                  <span class="badge" :class="cargo.ativo ? 'badge-success' : 'badge-warning'">{{ cargo.ativo ? 'Ativo' : 'Inativo' }}</span>
                </td>
                <td class="px-6 py-4">
                  <div class="flex items-center justify-end gap-2">
                    <button v-if="cargo.nivel === 'gestao'" class="p-2 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded-lg" title="Gestores" @click="openGestoresModal(cargo)">
                      <Icon name="heroicons:user-group" size="18" />
                    </button>
                    <button class="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg" title="Editar" @click="openEditModal(cargo)">
                      <Icon name="heroicons:pencil" size="18" />
                    </button>
                    <button class="p-2 rounded-lg" :class="cargo.ativo ? 'text-gray-500 hover:text-orange-600 hover:bg-orange-50' : 'text-gray-500 hover:text-green-600 hover:bg-green-50'" :title="cargo.ativo ? 'Desativar' : 'Ativar'" @click="handleToggleStatus(cargo)">
                      <Icon :name="cargo.ativo ? 'heroicons:pause' : 'heroicons:play'" size="18" />
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="card text-center py-12">
        <Icon name="heroicons:briefcase" class="text-gray-300 mx-auto mb-4" size="64" />
        <h3 class="text-lg font-semibold text-gray-800 mb-2">Nenhum cargo encontrado</h3>
        <p class="text-gray-600 mb-6">Ajuste os filtros ou crie um novo cargo</p>
        <UIButton theme="admin" variant="primary" icon-left="heroicons:plus" @click="openCreateModal">Novo Cargo</UIButton>
      </div>

      <!-- Info sobre níveis -->
      <div class="card mt-8 bg-blue-50 border-2 border-blue-200">
        <h3 class="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Icon name="heroicons:information-circle" class="text-blue-600" size="24" />
          Sobre os Níveis de Cargo
        </h3>
        <div class="grid md:grid-cols-2 gap-6">
          <div>
            <h4 class="font-semibold text-blue-800 mb-2">Nível Operacional</h4>
            <p class="text-sm text-gray-600">Cargos operacionais têm acesso básico ao sistema.</p>
          </div>
          <div>
            <h4 class="font-semibold text-purple-800 mb-2">Nível Gestão</h4>
            <p class="text-sm text-gray-600">Cargos de gestão têm poderes administrativos, exceto editar/excluir funcionários.</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Modais -->
    <CargoFormModal v-if="showModal" :is-editing="isEditing" :form="form" :saving="saving" :departamentos="departamentosDisponiveis" @close="closeModal" @submit="handleSubmit" @update:form="form = $event" />
    <CargoGestoresModal v-if="showGestoresModal" :cargo="selectedCargo" :colaboradores="colaboradoresDisponiveis" :loading-colaboradores="loadingColaboradores" :saving="savingGestor" @close="closeGestoresModal" @add="handleAddGestor" @remove="handleRemoveGestor" />
  </div>
</template>


<script setup lang="ts">
definePageMeta({ middleware: ['admin'], layout: false })

const { cargos, loading, countByNivel, countByStatus, fetchCargos, filterCargos, createCargo, updateCargo, toggleCargoStatus, addGestor, removeGestor, fetchColaboradoresDisponiveis, fetchDepartamentos } = useCargos()

const filters = ref({ search: '', nivel: 'all' as 'all' | 'operacional' | 'gestao', status: 'all' as 'all' | 'ativo' | 'inativo' })
const showModal = ref(false)
const isEditing = ref(false)
const editingId = ref<string | null>(null)
const saving = ref(false)
const form = ref({ nome: '', nivel: '' as '' | 'operacional' | 'gestao', descricao: '', departamento_id: '' })
const departamentosDisponiveis = ref<any[]>([])

const showGestoresModal = ref(false)
const selectedCargo = ref<any>(null)
const colaboradoresDisponiveis = ref<any[]>([])
const loadingColaboradores = ref(false)
const savingGestor = ref(false)

const filteredCargos = computed(() => filterCargos(filters.value))

onMounted(async () => {
  await fetchCargos()
  const result = await fetchDepartamentos()
  if (result.success) departamentosDisponiveis.value = result.data || []
})

const openCreateModal = () => {
  isEditing.value = false
  editingId.value = null
  form.value = { nome: '', nivel: '', descricao: '', departamento_id: '' }
  showModal.value = true
}

const openEditModal = (cargo: any) => {
  isEditing.value = true
  editingId.value = cargo.id
  form.value = { nome: cargo.nome, nivel: cargo.nivel, descricao: cargo.descricao || '', departamento_id: cargo.departamento_id || '' }
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  form.value = { nome: '', nivel: '', descricao: '', departamento_id: '' }
}

const handleSubmit = async () => {
  if (!form.value.nome || !form.value.nivel) { alert('Preencha todos os campos obrigatórios'); return }
  saving.value = true
  try {
    const data = { nome: form.value.nome, nivel: form.value.nivel as 'operacional' | 'gestao', descricao: form.value.descricao || undefined, departamento_id: form.value.departamento_id || undefined }
    const result = isEditing.value && editingId.value ? await updateCargo(editingId.value, data) : await createCargo(data)
    if (result.success) { alert(isEditing.value ? 'Cargo atualizado!' : 'Cargo criado!'); closeModal() }
    else alert(`Erro: ${result.error}`)
  } finally { saving.value = false }
}

const handleToggleStatus = async (cargo: any) => {
  const action = cargo.ativo ? 'desativar' : 'ativar'
  if (confirm(`Deseja ${action} o cargo "${cargo.nome}"?`)) {
    const result = await toggleCargoStatus(cargo.id, !cargo.ativo)
    if (result.success) alert(`Cargo ${action}do!`)
    else alert(`Erro: ${result.error}`)
  }
}

const openGestoresModal = async (cargo: any) => {
  selectedCargo.value = cargo
  showGestoresModal.value = true
  loadingColaboradores.value = true
  const result = await fetchColaboradoresDisponiveis(cargo.id)
  if (result.success) colaboradoresDisponiveis.value = result.data || []
  loadingColaboradores.value = false
}

const closeGestoresModal = () => {
  showGestoresModal.value = false
  selectedCargo.value = null
  colaboradoresDisponiveis.value = []
}

const handleAddGestor = async (colaboradorId: string) => {
  if (!selectedCargo.value) return
  savingGestor.value = true
  const result = await addGestor(selectedCargo.value.id, colaboradorId)
  if (result.success) {
    alert('Gestor adicionado!')
    const reloadResult = await fetchColaboradoresDisponiveis(selectedCargo.value.id)
    if (reloadResult.success) colaboradoresDisponiveis.value = reloadResult.data || []
    selectedCargo.value = cargos.value.find(c => c.id === selectedCargo.value.id)
  } else alert(`Erro: ${result.error}`)
  savingGestor.value = false
}

const handleRemoveGestor = async (gestorId: string) => {
  if (!confirm('Deseja remover este gestor?')) return
  const result = await removeGestor(gestorId)
  if (result.success) {
    alert('Gestor removido!')
    if (selectedCargo.value) {
      const reloadResult = await fetchColaboradoresDisponiveis(selectedCargo.value.id)
      if (reloadResult.success) colaboradoresDisponiveis.value = reloadResult.data || []
      selectedCargo.value = cargos.value.find(c => c.id === selectedCargo.value.id)
    }
  } else alert(`Erro: ${result.error}`)
}
</script>
