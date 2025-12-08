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
              <h1 class="text-xl font-bold text-gray-800">Alterações de Dados</h1>
              <p class="text-sm text-gray-500">Aprovar ou rejeitar solicitações de alteração de dados bancários</p>
            </div>
          </div>
          <UserProfileDropdown theme="admin" />
        </div>
      </div>
    </header>

    <div class="max-w-7xl mx-auto p-8">

    <!-- Stats -->
    <div class="grid grid-cols-3 gap-4 mb-6">
      <div class="bg-amber-50 border border-amber-200 rounded-xl p-4 text-center">
        <p class="text-2xl font-bold text-amber-700">{{ stats.pendentes }}</p>
        <p class="text-sm text-amber-600">Pendentes</p>
      </div>
      <div class="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
        <p class="text-2xl font-bold text-green-700">{{ stats.aprovadas }}</p>
        <p class="text-sm text-green-600">Aprovadas</p>
      </div>
      <div class="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
        <p class="text-2xl font-bold text-red-700">{{ stats.rejeitadas }}</p>
        <p class="text-sm text-red-600">Rejeitadas</p>
      </div>
    </div>

    <!-- Filtros -->
    <div class="flex gap-4 mb-6">
      <select v-model="filtroStatus" class="px-3 py-2 border border-slate-300 rounded-lg">
        <option value="">Todos os status</option>
        <option value="pendente">Pendentes</option>
        <option value="aprovada">Aprovadas</option>
        <option value="rejeitada">Rejeitadas</option>
      </select>
      <select v-model="filtroTipo" class="px-3 py-2 border border-slate-300 rounded-lg">
        <option value="">Todos os tipos</option>
        <option value="dados_bancarios">Dados Bancários</option>
      </select>
      <button @click="carregarDados" class="px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 flex items-center gap-2">
        <Icon name="heroicons:arrow-path" :class="{ 'animate-spin': loading }" size="18" />
        Atualizar
      </button>
    </div>

    <!-- Lista -->
    <div v-if="loading" class="text-center py-12">
      <Icon name="heroicons:arrow-path" class="animate-spin text-slate-400" size="32" />
    </div>

    <div v-else-if="solicitacoes.length === 0" class="text-center py-12 bg-slate-50 rounded-xl">
      <Icon name="heroicons:check-circle" class="text-green-400 mx-auto" size="48" />
      <p class="text-slate-600 mt-2">Nenhuma solicitação encontrada</p>
    </div>

    <div v-else class="space-y-4">
      <div v-for="s in solicitacoes" :key="s.id" class="bg-white border border-slate-200 rounded-xl p-5">
        <div class="flex items-start justify-between">
          <div>
            <div class="flex items-center gap-3 mb-2">
              <span class="font-semibold text-slate-800">{{ s.colaborador?.nome }}</span>
              <span class="text-sm text-slate-500">{{ s.colaborador?.matricula }}</span>
              <span :class="statusClass(s.status)" class="px-2 py-0.5 text-xs font-medium rounded-full">
                {{ statusLabel(s.status) }}
              </span>
            </div>
            <p class="text-sm text-slate-600 mb-3">
              <Icon name="heroicons:banknotes" class="inline mr-1" />
              Alteração de {{ tipoLabel(s.tipo) }}
            </p>
            
            <!-- Comparação de dados -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div class="p-3 bg-red-50 rounded-lg">
                <p class="font-medium text-red-700 mb-2">Dados Atuais</p>
                <div v-for="(val, key) in s.dados_anteriores" :key="key" class="text-slate-600">
                  <span class="font-medium">{{ formatKey(key) }}:</span> {{ val || '-' }}
                </div>
              </div>
              <div class="p-3 bg-green-50 rounded-lg">
                <p class="font-medium text-green-700 mb-2">Novos Dados</p>
                <div v-for="(val, key) in s.dados_novos" :key="key" class="text-slate-600">
                  <span class="font-medium">{{ formatKey(key) }}:</span> {{ val || '-' }}
                </div>
              </div>
            </div>

            <p class="text-xs text-slate-400 mt-3">
              Solicitado em {{ formatDate(s.created_at) }}
              <span v-if="s.aprovado_em"> • {{ s.status === 'aprovada' ? 'Aprovado' : 'Rejeitado' }} em {{ formatDate(s.aprovado_em) }} por {{ s.aprovador?.nome }}</span>
            </p>
          </div>

          <div v-if="s.status === 'pendente'" class="flex gap-2">
            <button @click="aprovar(s)" class="px-3 py-1.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700">
              <Icon name="heroicons:check" size="16" class="mr-1" />Aprovar
            </button>
            <button @click="abrirRejeicao(s)" class="px-3 py-1.5 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700">
              <Icon name="heroicons:x-mark" size="16" class="mr-1" />Rejeitar
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Rejeição -->
    <UIModal v-model="showRejeicao" title="Rejeitar Solicitação">
      <div class="space-y-4">
        <UITextarea v-model="motivoRejeicao" label="Motivo da Rejeição" placeholder="Informe o motivo..." rows="3" />
        <div class="flex justify-end gap-3">
          <button @click="showRejeicao = false" class="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg">Cancelar</button>
          <button @click="rejeitar" class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">Confirmar Rejeição</button>
        </div>
      </div>
    </UIModal>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: ['admin'],
  layout: false,
})

const loading = ref(true)
const solicitacoes = ref<any[]>([])
const stats = ref({ pendentes: 0, aprovadas: 0, rejeitadas: 0 })
const filtroStatus = ref('')
const filtroTipo = ref('')
const showRejeicao = ref(false)
const motivoRejeicao = ref('')
const solicitacaoSelecionada = ref<any>(null)

const carregarStats = async () => {
  try {
    const data = await $fetch('/api/admin/alteracoes-dados/stats')
    stats.value = data as any
  } catch (e) {
    console.error('Erro ao carregar stats:', e)
  }
}

const carregarDados = async () => {
  loading.value = true
  try {
    const params = new URLSearchParams()
    if (filtroStatus.value) params.append('status', filtroStatus.value)
    if (filtroTipo.value) params.append('tipo', filtroTipo.value)
    solicitacoes.value = await $fetch(`/api/admin/alteracoes-dados?${params}`)
    await carregarStats()
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

watch([filtroStatus, filtroTipo], carregarDados)
onMounted(carregarDados)

const statusClass = (status: string) => ({
  'bg-amber-100 text-amber-700': status === 'pendente',
  'bg-green-100 text-green-700': status === 'aprovada',
  'bg-red-100 text-red-700': status === 'rejeitada'
})

const statusLabel = (status: string) => ({
  pendente: 'Pendente',
  aprovada: 'Aprovada',
  rejeitada: 'Rejeitada'
}[status] || status)

const tipoLabel = (tipo: string) => ({
  dados_bancarios: 'Dados Bancários',
  endereco: 'Endereço',
  contato_emergencia: 'Contato de Emergência',
  dados_pessoais: 'Dados Pessoais',
  documentos: 'Documentos'
}[tipo] || tipo)

const formatKey = (key: string) => key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())

const formatDate = (date: string) => new Date(date).toLocaleString('pt-BR')

const aprovar = async (s: any) => {
  if (!confirm('Confirma a aprovação desta alteração?')) return
  try {
    await $fetch(`/api/admin/alteracoes-dados/${s.id}`, { method: 'PUT', body: { acao: 'aprovar' } })
    carregarDados()
  } catch (e: any) {
    alert(e.data?.message || 'Erro ao aprovar')
  }
}

const abrirRejeicao = (s: any) => {
  solicitacaoSelecionada.value = s
  motivoRejeicao.value = ''
  showRejeicao.value = true
}

const rejeitar = async () => {
  if (!motivoRejeicao.value.trim()) {
    alert('Informe o motivo da rejeição')
    return
  }
  try {
    await $fetch(`/api/admin/alteracoes-dados/${solicitacaoSelecionada.value.id}`, {
      method: 'PUT',
      body: { acao: 'rejeitar', motivo: motivoRejeicao.value }
    })
    showRejeicao.value = false
    carregarDados()
  } catch (e: any) {
    alert(e.data?.message || 'Erro ao rejeitar')
  }
}
</script>

