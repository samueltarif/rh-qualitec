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
              <h1 class="text-xl font-bold text-gray-800">Solicitações de Funcionários</h1>
              <p class="text-sm text-gray-500">Gerencie as solicitações dos colaboradores</p>
            </div>
          </div>
          <UserProfileDropdown theme="admin" />
        </div>
      </div>
    </header>

    <!-- Content -->
    <div class="max-w-7xl mx-auto p-8">
      <!-- Stats -->
      <div class="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        <UIStatsCard label="Pendentes" :value="stats.pendentes" icon="heroicons:clock" color="amber" />
        <UIStatsCard label="Em Análise" :value="stats.em_analise" icon="heroicons:magnifying-glass" color="blue" />
        <UIStatsCard label="Aprovadas" :value="stats.aprovadas" icon="heroicons:check-circle" color="green" />
        <UIStatsCard label="Rejeitadas" :value="stats.rejeitadas" icon="heroicons:x-circle" color="red" />
        <UIStatsCard label="Concluídas" :value="stats.concluidas" icon="heroicons:check-badge" color="gray" />
      </div>

      <!-- Filtros -->
      <div class="bg-white rounded-xl border border-gray-200 p-4 mb-6">
        <div class="flex flex-wrap items-center gap-4">
          <UISearchInput v-model="busca" placeholder="Buscar por colaborador..." class="w-64" />
          <UISelect v-model="filtroStatus" class="w-48">
            <option value="todos">Todos os status</option>
            <option value="Pendente">Pendentes</option>
            <option value="Em_Analise">Em Análise</option>
            <option value="Aprovada">Aprovadas</option>
            <option value="Rejeitada">Rejeitadas</option>
            <option value="Concluida">Concluídas</option>
          </UISelect>
          <UISelect v-model="filtroTipo" class="w-48">
            <option value="">Todos os tipos</option>
            <option value="ferias">Férias</option>
            <option value="abono">Abono</option>
            <option value="atestado">Atestado</option>
            <option value="declaracao">Declaração</option>
            <option value="holerite">Holerite</option>
            <option value="outros">Outros</option>
          </UISelect>
        </div>
      </div>

      <!-- Lista -->
      <div v-if="loading" class="text-center py-12">
        <Icon name="heroicons:arrow-path" class="animate-spin text-gray-400" size="40" />
        <p class="text-gray-500 mt-2">Carregando...</p>
      </div>

      <div v-else-if="solicitacoesFiltradas.length === 0">
        <UIEmptyState
          icon="heroicons:document-text"
          title="Nenhuma solicitação encontrada"
          description="Não há solicitações com os filtros selecionados."
          color="gray"
        />
      </div>

      <div v-else class="space-y-4">
        <div
          v-for="sol in solicitacoesFiltradas"
          :key="sol.id"
          class="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow"
        >
          <div class="flex items-start justify-between gap-4">
            <div class="flex-1">
              <div class="flex items-center gap-2 mb-2">
                <span :class="getTipoClass(sol.tipo)" class="px-2 py-1 text-xs font-medium rounded-full">
                  {{ getTipoLabel(sol.tipo) }}
                </span>
                <span :class="getStatusClass(sol.status)" class="px-2 py-1 text-xs font-medium rounded-full">
                  {{ getStatusLabel(sol.status) }}
                </span>
                <span v-if="sol.prioridade === 'Urgente'" class="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-700">
                  Urgente
                </span>
              </div>
              <h4 class="font-semibold text-gray-800">{{ sol.titulo }}</h4>
              <p class="text-sm text-gray-600 mt-1">
                <span class="font-medium">{{ sol.colaborador_nome }}</span>
                <span v-if="sol.cargo" class="text-gray-400"> • {{ sol.cargo }}</span>
                <span v-if="sol.departamento" class="text-gray-400"> • {{ sol.departamento }}</span>
              </p>
              <p v-if="sol.descricao" class="text-sm text-gray-500 mt-2">{{ sol.descricao }}</p>
              <p class="text-xs text-gray-400 mt-2">
                Solicitado em {{ formatDate(sol.data_solicitacao) }}
              </p>
            </div>
            <div v-if="sol.status === 'Pendente' || sol.status === 'Em_Analise'" class="flex gap-2">
              <button
                @click="abrirModalResposta(sol, 'aprovar')"
                class="px-3 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700"
              >
                <Icon name="heroicons:check" size="16" class="mr-1" />
                Aprovar
              </button>
              <button
                @click="abrirModalResposta(sol, 'rejeitar')"
                class="px-3 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700"
              >
                <Icon name="heroicons:x-mark" size="16" class="mr-1" />
                Rejeitar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Resposta -->
    <UIModal v-model="showModalResposta" :title="modalTitulo" size="md">
      <div class="space-y-4">
        <div v-if="solicitacaoSelecionada">
          <p class="text-sm text-gray-600 mb-4">
            Solicitação de <strong>{{ solicitacaoSelecionada.colaborador_nome }}</strong>:
            <br />{{ solicitacaoSelecionada.titulo }}
          </p>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            {{ acaoModal === 'aprovar' ? 'Observações (opcional)' : 'Motivo da Rejeição *' }}
          </label>
          <textarea
            v-model="respostaForm.texto"
            rows="4"
            :required="acaoModal === 'rejeitar'"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
            :placeholder="acaoModal === 'aprovar' ? 'Adicione observações se necessário...' : 'Informe o motivo da rejeição...'"
          ></textarea>
        </div>
      </div>
      <template #footer>
        <div class="flex gap-3">
          <button @click="showModalResposta = false" class="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300">
            Cancelar
          </button>
          <button
            @click="confirmarResposta"
            :disabled="acaoModal === 'rejeitar' && !respostaForm.texto"
            :class="acaoModal === 'aprovar' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'"
            class="px-4 py-2 text-white font-medium rounded-lg disabled:opacity-50"
          >
            {{ acaoModal === 'aprovar' ? 'Confirmar Aprovação' : 'Confirmar Rejeição' }}
          </button>
        </div>
      </template>
    </UIModal>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: ['admin'],
  layout: false,
})

const solicitacoes = ref<any[]>([])
const stats = ref({ total: 0, pendentes: 0, em_analise: 0, aprovadas: 0, rejeitadas: 0, concluidas: 0 })
const loading = ref(false)
const busca = ref('')
const filtroStatus = ref('todos')
const filtroTipo = ref('')
const showModalResposta = ref(false)
const solicitacaoSelecionada = ref<any>(null)
const acaoModal = ref<'aprovar' | 'rejeitar'>('aprovar')
const respostaForm = ref({ texto: '' })

const modalTitulo = computed(() => acaoModal.value === 'aprovar' ? 'Aprovar Solicitação' : 'Rejeitar Solicitação')

const solicitacoesFiltradas = computed(() => {
  let result = solicitacoes.value
  if (busca.value) {
    const termo = busca.value.toLowerCase()
    result = result.filter(s => s.colaborador_nome?.toLowerCase().includes(termo) || s.titulo?.toLowerCase().includes(termo))
  }
  return result
})

const fetchSolicitacoes = async () => {
  loading.value = true
  try {
    const params = new URLSearchParams()
    if (filtroStatus.value !== 'todos') params.append('status', filtroStatus.value)
    if (filtroTipo.value) params.append('tipo', filtroTipo.value)
    
    const data = await $fetch<any[]>(`/api/admin/solicitacoes?${params}`)
    solicitacoes.value = data
  } catch (e) {
    console.error('Erro ao buscar solicitações:', e)
  } finally {
    loading.value = false
  }
}

const fetchStats = async () => {
  try {
    const data = await $fetch<any>('/api/admin/solicitacoes/stats')
    stats.value = data
  } catch (e) {
    console.error('Erro ao buscar stats:', e)
  }
}

const abrirModalResposta = (sol: any, acao: 'aprovar' | 'rejeitar') => {
  solicitacaoSelecionada.value = sol
  acaoModal.value = acao
  respostaForm.value.texto = ''
  showModalResposta.value = true
}

const confirmarResposta = async () => {
  if (!solicitacaoSelecionada.value) return
  
  try {
    await $fetch(`/api/admin/solicitacoes/${solicitacaoSelecionada.value.id}`, {
      method: 'PUT',
      body: {
        status: acaoModal.value === 'aprovar' ? 'Aprovada' : 'Rejeitada',
        resposta: acaoModal.value === 'aprovar' ? respostaForm.value.texto : null,
        motivo_rejeicao: acaoModal.value === 'rejeitar' ? respostaForm.value.texto : null
      }
    })
    showModalResposta.value = false
    await fetchSolicitacoes()
    await fetchStats()
    alert(`Solicitação ${acaoModal.value === 'aprovar' ? 'aprovada' : 'rejeitada'} com sucesso!`)
  } catch (e: any) {
    alert(e.message || 'Erro ao processar solicitação')
  }
}

const getTipoLabel = (tipo: string) => {
  const tipos: Record<string, string> = {
    'ferias': 'Férias', 'abono': 'Abono', 'atestado': 'Atestado', 'declaracao': 'Declaração',
    'alteracao_dados': 'Alteração de Dados', 'holerite': 'Holerite', 'informe_rendimentos': 'Informe de Rendimentos',
    'carta_referencia': 'Carta de Referência', 'outros': 'Outros'
  }
  return tipos[tipo] || tipo
}

const getTipoClass = (tipo: string) => {
  const classes: Record<string, string> = {
    'ferias': 'bg-amber-100 text-amber-700', 'abono': 'bg-blue-100 text-blue-700',
    'atestado': 'bg-purple-100 text-purple-700', 'declaracao': 'bg-green-100 text-green-700',
  }
  return classes[tipo] || 'bg-gray-100 text-gray-700'
}

const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    'Pendente': 'Pendente', 'Em_Analise': 'Em Análise', 'Aprovada': 'Aprovada',
    'Rejeitada': 'Rejeitada', 'Cancelada': 'Cancelada', 'Concluida': 'Concluída'
  }
  return labels[status] || status
}

const getStatusClass = (status: string) => {
  const classes: Record<string, string> = {
    'Pendente': 'bg-yellow-100 text-yellow-700', 'Em_Analise': 'bg-blue-100 text-blue-700',
    'Aprovada': 'bg-green-100 text-green-700', 'Rejeitada': 'bg-red-100 text-red-700',
    'Cancelada': 'bg-gray-100 text-gray-700', 'Concluida': 'bg-green-100 text-green-700'
  }
  return classes[status] || 'bg-gray-100 text-gray-700'
}

const formatDate = (date: string) => {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('pt-BR')
}

watch([filtroStatus, filtroTipo], () => fetchSolicitacoes())

onMounted(() => {
  fetchSolicitacoes()
  fetchStats()
})
</script>
