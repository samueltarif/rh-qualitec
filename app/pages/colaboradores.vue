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
              <h1 class="text-xl font-bold text-gray-800">Gestão de Colaboradores</h1>
              <p class="text-sm text-gray-500">Cadastro completo de funcionários</p>
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
              <Icon name="heroicons:users" class="text-white" size="24" />
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
            <div class="w-12 h-12 bg-yellow-600 rounded-lg flex items-center justify-center">
              <Icon name="heroicons:pause-circle" class="text-white" size="24" />
            </div>
            <div>
              <p class="text-sm text-gray-600">Afastados</p>
              <p class="text-2xl font-bold text-gray-800">{{ countByStatus.afastado }}</p>
            </div>
          </div>
        </div>
        <div class="card">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 bg-gray-600 rounded-lg flex items-center justify-center">
              <Icon name="heroicons:x-circle" class="text-white" size="24" />
            </div>
            <div>
              <p class="text-sm text-gray-600">Desligados</p>
              <p class="text-2xl font-bold text-gray-800">{{ countByStatus.desligado }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Filtros e Ações -->
      <div class="card mb-8">
        <div class="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <div class="flex flex-col md:flex-row gap-4 flex-1">
            <div class="flex-1">
              <UIInput v-model="filters.search" type="text" placeholder="Buscar por nome, CPF, matrícula..." icon-left="heroicons:magnifying-glass" />
            </div>
            <UISelect v-model="filters.status" class="w-full md:w-40">
              <option value="all">Todos Status</option>
              <option value="Ativo">Ativos</option>
              <option value="Afastado">Afastados</option>
              <option value="Desligado">Desligados</option>
            </UISelect>
          </div>
          <UIButton theme="admin" variant="primary" icon-left="heroicons:plus" @click="openCreateModal">
            Novo Colaborador
          </UIButton>
        </div>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="card text-center py-12">
        <Icon name="heroicons:arrow-path" class="animate-spin text-gray-400 mx-auto mb-4" size="48" />
        <p class="text-gray-600">Carregando colaboradores...</p>
      </div>

      <!-- Lista -->
      <div v-else-if="filteredColaboradores.length > 0" class="card overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gray-50 border-b border-gray-200">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Colaborador</th>
                <th class="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Cargo</th>
                <th class="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Contrato</th>
                <th class="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Admissão</th>
                <th class="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                <th class="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Ações</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              <tr v-for="col in filteredColaboradores" :key="col.id" class="hover:bg-gray-50">
                <td class="px-6 py-4">
                  <div class="flex items-center gap-3">
                    <div class="w-10 h-10 bg-blue-900 rounded-full flex items-center justify-center text-white font-semibold">
                      {{ getInitials(col.nome) }}
                    </div>
                    <div>
                      <p class="font-medium text-gray-800">{{ col.nome }}</p>
                      <p class="text-xs text-gray-500">{{ col.matricula || col.cpf }}</p>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 text-sm text-gray-600">{{ col.cargo?.nome || '-' }}</td>
                <td class="px-6 py-4 text-sm text-gray-600">{{ col.tipo_contrato }}</td>
                <td class="px-6 py-4 text-sm text-gray-600">{{ formatDate(col.data_admissao) }}</td>
                <td class="px-6 py-4">
                  <span class="badge" :class="getStatusClass(col.status)">{{ col.status }}</span>
                </td>
                <td class="px-6 py-4">
                  <div class="flex items-center justify-end gap-2">
                    <button class="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg" title="Editar" @click="openEditModal(col)">
                      <Icon name="heroicons:pencil" size="18" />
                    </button>
                    <button class="p-2 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded-lg" title="Documentos" @click="openDocumentosModal(col)">
                      <Icon name="heroicons:document-text" size="18" />
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
        <Icon name="heroicons:users" class="text-gray-300 mx-auto mb-4" size="64" />
        <h3 class="text-lg font-semibold text-gray-800 mb-2">Nenhum colaborador encontrado</h3>
        <p class="text-gray-600 mb-6">Ajuste os filtros ou cadastre um novo colaborador</p>
        <UIButton theme="admin" variant="primary" icon-left="heroicons:plus" @click="openCreateModal">
          Novo Colaborador
        </UIButton>
      </div>
    </div>

    <!-- Modal Criar/Editar -->
    <ColaboradorFormModal
      v-if="showModal"
      :is-editing="isEditing"
      :form="form"
      :saving="saving"
      :active-tab="activeTab"
      :cargos="cargosDisponiveis"
      :departamentos="departamentosDisponiveis"
      :gestores="gestoresDisponiveis"
      :jornadas="jornadasDisponiveis"
      :buscando-cep="buscandoCep"
      @close="closeModal"
      @submit="handleSubmit"
      @update:form="form = $event"
      @update:active-tab="activeTab = $event"
      @buscar-cep="handleBuscarCep"
    />

    <!-- Modal Documentos -->
    <ColaboradorDocumentosModal
      v-if="showDocumentosModal"
      :colaborador="selectedColaborador"
      :documentos="documentos"
      :uploading="uploading"
      @close="closeDocumentosModal"
      @upload="handleUpload"
      @remove="handleRemoveDocumento"
    />
  </div>
</template>


<script setup lang="ts">
definePageMeta({ middleware: ['admin'], layout: false })

const { colaboradores, loading, countByStatus, fetchColaboradores, filterColaboradores, createColaborador, updateColaborador, buscarCep, fetchDocumentos, uploadDocumento, removeDocumento } = useColaboradores()
const { cargos, fetchCargos } = useCargos()

const filters = ref({ search: '', status: 'all' })
const showModal = ref(false)
const isEditing = ref(false)
const editingId = ref<string | null>(null)
const saving = ref(false)
const activeTab = ref('pessoais')
const buscandoCep = ref(false)

const defaultForm = {
  nome: '', cpf: '', matricula: '', data_nascimento: '', estado_civil: '', escolaridade: '',
  email_corporativo: '', celular: '', sexo: '', nacionalidade: '', naturalidade: '', nome_mae: '', nome_pai: '',
  rg: '', orgao_emissor: '', data_emissao_rg: '', pis: '', pis_pasep: '',
  titulo_eleitor: '', zona_eleitoral: '', secao_eleitoral: '', certificado_militar: '',
  ctps: '', ctps_serie: '', ctps_uf: '', cnh: '', cnh_categoria: '', cnh_validade: '',
  cargo_id: '', departamento_id: '', gestor_id: '', unidade: '', setor: '',
  tipo_contrato: '', jornada_trabalho: '', carga_horaria: '', salario: null, salario_base: null,
  data_admissao: '', data_desligamento: '', motivo_desligamento: '',
  regime_pagamento: '', status: 'Ativo', local_trabalho: '', qtd_dependentes: 0,
  cep: '', logradouro: '', numero: '', complemento: '', bairro: '', cidade: '', estado: '',
  banco_nome: '', banco_codigo: '', agencia: '', conta: '', tipo_conta: '', pix: '', pix_chave: '',
  recebe_vt: false, valor_vt: 0, recebe_va: false, valor_va: 0, recebe_vr: false, valor_vr: 0,
  recebe_va_vr: false, valor_va_vr: 0, desconto_inss_padrao: true, plano_saude: false, plano_odonto: false,
  contato_emergencia_nome: '', contato_emergencia_parentesco: '', contato_emergencia_telefone: '',
  contato_emergencia_2_nome: '', contato_emergencia_2_parentesco: '', contato_emergencia_2_telefone: '',
  contato_emergencia_3_nome: '', contato_emergencia_3_parentesco: '', contato_emergencia_3_telefone: '',
  email_alternativo: '', emergencia_nome: '', emergencia_telefone: '', emergencia_parentesco: '', observacoes_rh: '',
}
const form = ref({ ...defaultForm })

const showDocumentosModal = ref(false)
const selectedColaborador = ref<any>(null)
const documentos = ref<any[]>([])
const uploading = ref(false)

const cargosDisponiveis = computed(() => cargos.value.filter(c => c.ativo))
const departamentosDisponiveis = ref<any[]>([])
const gestoresDisponiveis = ref<any[]>([])
const jornadasDisponiveis = ref<any[]>([])
const filteredColaboradores = computed(() => filterColaboradores(filters.value))

onMounted(async () => {
  await Promise.all([fetchColaboradores(), fetchCargos(), fetchDepartamentos(), fetchGestores(), fetchJornadas()])
})

const fetchDepartamentos = async () => {
  const supabase = useSupabaseClient()
  const { data } = await (supabase as any).from('departamentos').select('id, nome').eq('ativo', true).order('nome')
  departamentosDisponiveis.value = data || []
}

const fetchGestores = async () => {
  const supabase = useSupabaseClient()
  const { data } = await (supabase as any).from('colaboradores').select('id, nome, cargo:cargos(nivel)').eq('status', 'Ativo').order('nome')
  gestoresDisponiveis.value = (data || []).filter((c: any) => c.cargo?.nivel === 'gestao' || c.nome.toLowerCase().includes('silvana'))
}

const fetchJornadas = async () => {
  try {
    const response = await $fetch<{ success: boolean; data: any[] }>('/api/jornadas')
    if (response.success) {
      jornadasDisponiveis.value = response.data.filter((j: any) => j.ativo !== false)
    }
  } catch (error) {
    console.error('Erro ao carregar jornadas:', error)
    jornadasDisponiveis.value = []
  }
}

const getInitials = (nome: string) => {
  const names = nome.split(' ')
  return names.length === 1 ? names[0].substring(0, 2).toUpperCase() : (names[0][0] + names[names.length - 1][0]).toUpperCase()
}

const formatDate = (dateString: string) => {
  if (!dateString) return '-'
  // Adiciona o timezone para evitar problemas de conversão
  const date = new Date(dateString + 'T00:00:00')
  return date.toLocaleDateString('pt-BR')
}

const getStatusClass = (status: string) => {
  const classes: Record<string, string> = { Ativo: 'badge-success', Afastado: 'badge-warning', Desligado: 'badge-error' }
  return classes[status] || 'badge-info'
}

const openCreateModal = () => {
  isEditing.value = false
  editingId.value = null
  form.value = { ...defaultForm }
  activeTab.value = 'pessoais'
  showModal.value = true
}

const openEditModal = (col: any) => {
  isEditing.value = true
  editingId.value = col.id
  form.value = { ...defaultForm, ...col }
  activeTab.value = 'pessoais'
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  form.value = { ...defaultForm }
}

const handleSubmit = async () => {
  if (!form.value.nome || !form.value.cpf) { alert('Nome e CPF são obrigatórios!'); return }
  saving.value = true
  try {
    const result = isEditing.value && editingId.value
      ? await updateColaborador(editingId.value, form.value)
      : await createColaborador(form.value)
    if (result.success) { alert(isEditing.value ? 'Colaborador atualizado!' : 'Colaborador cadastrado!'); closeModal() }
    else alert(`Erro: ${result.error}`)
  } finally { saving.value = false }
}

const handleBuscarCep = async () => {
  if (!form.value.cep) return
  buscandoCep.value = true
  const result = await buscarCep(form.value.cep)
  if (result.success && result.data) {
    form.value.logradouro = result.data.logradouro
    form.value.bairro = result.data.bairro
    form.value.cidade = result.data.cidade
    form.value.estado = result.data.estado
  } else alert(result.error || 'CEP não encontrado')
  buscandoCep.value = false
}

const openDocumentosModal = async (col: any) => {
  selectedColaborador.value = col
  showDocumentosModal.value = true
  const result = await fetchDocumentos(col.id)
  documentos.value = result.success ? result.data || [] : []
}

const closeDocumentosModal = () => {
  showDocumentosModal.value = false
  selectedColaborador.value = null
  documentos.value = []
}

const handleUpload = async (file: File, tipo: string) => {
  if (!selectedColaborador.value) return
  uploading.value = true
  const result = await uploadDocumento(selectedColaborador.value.id, file, tipo)
  if (result.success) {
    const docsResult = await fetchDocumentos(selectedColaborador.value.id)
    documentos.value = docsResult.success ? docsResult.data || [] : []
  } else alert(`Erro: ${result.error}`)
  uploading.value = false
}

const handleRemoveDocumento = async (id: string) => {
  if (!confirm('Deseja remover este documento?')) return
  const result = await removeDocumento(id)
  if (result.success) documentos.value = documentos.value.filter(d => d.id !== id)
  else alert(`Erro: ${result.error}`)
}
</script>
