<template>
  <UIModal v-model="isOpen" title="Solicitações de Alteração de Dados" size="xl">
    <div class="space-y-4">
      <!-- Stats -->
      <div class="grid grid-cols-3 gap-3">
        <div class="bg-amber-50 border border-amber-200 rounded-lg p-3 text-center">
          <p class="text-xl font-bold text-amber-700">{{ stats.pendentes }}</p>
          <p class="text-xs text-amber-600">Pendentes</p>
        </div>
        <div class="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
          <p class="text-xl font-bold text-green-700">{{ stats.aprovadas }}</p>
          <p class="text-xs text-green-600">Aprovadas</p>
        </div>
        <div class="bg-red-50 border border-red-200 rounded-lg p-3 text-center">
          <p class="text-xl font-bold text-red-700">{{ stats.rejeitadas }}</p>
          <p class="text-xs text-red-600">Rejeitadas</p>
        </div>
      </div>

      <!-- Filtros -->
      <div class="flex gap-3">
        <select v-model="filtroStatus" class="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm">
          <option value="">Todos os status</option>
          <option value="pendente">Pendentes</option>
          <option value="aprovada">Aprovadas</option>
          <option value="rejeitada">Rejeitadas</option>
        </select>
        <button @click="carregarDados" class="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 text-sm">
          <Icon name="heroicons:arrow-path" :class="{ 'animate-spin': loading }" size="16" />
        </button>
      </div>

      <!-- Lista -->
      <div v-if="loading" class="text-center py-8">
        <Icon name="heroicons:arrow-path" class="animate-spin text-gray-400 mx-auto" size="32" />
      </div>

      <div v-else-if="solicitacoes.length === 0" class="text-center py-8 bg-gray-50 rounded-lg">
        <Icon name="heroicons:check-circle" class="text-green-400 mx-auto mb-2" size="40" />
        <p class="text-gray-600 text-sm">Nenhuma solicitação encontrada</p>
      </div>

      <div v-else class="space-y-3 max-h-96 overflow-y-auto">
        <div v-for="s in solicitacoes" :key="s.id" class="bg-white border border-gray-200 rounded-lg p-4">
          <div class="flex items-start justify-between mb-3">
            <div>
              <div class="flex items-center gap-2 mb-1">
                <span class="font-semibold text-gray-800 text-sm">{{ s.colaborador?.nome }}</span>
                <span :class="statusClass(s.status)" class="px-2 py-0.5 text-xs font-medium rounded-full">
                  {{ statusLabel(s.status) }}
                </span>
              </div>
              <p class="text-xs text-gray-500">
                <Icon name="heroicons:banknotes" class="inline mr-1" size="14" />
                {{ tipoLabel(s.tipo) }} • {{ formatDate(s.created_at) }}
              </p>
            </div>
            <div v-if="s.status === 'pendente'" class="flex gap-2">
              <button @click="aprovar(s)" class="px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700">
                <Icon name="heroicons:check" size="14" />
              </button>
              <button @click="abrirRejeicao(s)" class="px-2 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700">
                <Icon name="heroicons:x-mark" size="14" />
              </button>
            </div>
          </div>

          <!-- Comparação de dados -->
          <div class="grid grid-cols-2 gap-2 text-xs">
            <div class="p-2 bg-red-50 rounded">
              <p class="font-medium text-red-700 mb-1">Dados Atuais</p>
              <div v-for="(val, key) in s.dados_anteriores" :key="key" class="text-gray-600 truncate">
                <span class="font-medium">{{ formatKey(key) }}:</span> {{ val || '-' }}
              </div>
            </div>
            <div class="p-2 bg-green-50 rounded">
              <p class="font-medium text-green-700 mb-1">Novos Dados</p>
              <div v-for="(val, key) in s.dados_novos" :key="key" class="text-gray-600 truncate">
                <span class="font-medium">{{ formatKey(key) }}:</span> {{ val || '-' }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Ações -->
      <div class="flex justify-between items-center pt-4 border-t">
        <NuxtLink to="/admin/alteracoes-dados" class="text-sm text-blue-600 hover:text-blue-700">
          Ver página completa →
        </NuxtLink>
        <button @click="isOpen = false" class="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm">
          Fechar
        </button>
      </div>
    </div>

    <!-- Modal Rejeição -->
    <UIModal v-model="showRejeicao" title="Rejeitar Solicitação">
      <div class="space-y-4">
        <UITextarea v-model="motivoRejeicao" label="Motivo da Rejeição" placeholder="Informe o motivo..." rows="3" />
        <div class="flex justify-end gap-3">
          <button @click="showRejeicao = false" class="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-sm">
            Cancelar
          </button>
          <button @click="rejeitar" class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm">
            Confirmar Rejeição
          </button>
        </div>
      </div>
    </UIModal>
  </UIModal>
</template>

<script setup lang="ts">
const isOpen = defineModel<boolean>({ default: false })

const loading = ref(false)
const solicitacoes = ref<any[]>([])
const stats = ref({ pendentes: 0, aprovadas: 0, rejeitadas: 0 })
const filtroStatus = ref('pendente')
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
    solicitacoes.value = await $fetch(`/api/admin/alteracoes-dados?${params}`)
    await carregarStats()
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

watch(filtroStatus, carregarDados)
watch(isOpen, (val) => {
  if (val) {
    carregarDados()
  }
})

// Emitir evento quando fechar para atualizar o badge
watch(isOpen, (val) => {
  if (!val) {
    emit('close')
  }
})

const emit = defineEmits<{
  'close': []
}>()

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

const formatDate = (date: string) => new Date(date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })

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
