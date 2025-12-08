<template>
  <div>
    <!-- Header -->
    <div class="flex flex-wrap items-center justify-between gap-4 mb-6">
      <div class="flex items-center gap-4">
        <select v-model="filtroStatus" class="px-3 py-2 border border-slate-300 rounded-lg text-sm">
          <option value="todos">Todos os status</option>
          <option value="Pendente">Pendentes</option>
          <option value="Em_Analise">Em Análise</option>
          <option value="Aprovada">Aprovadas</option>
          <option value="Rejeitada">Rejeitadas</option>
          <option value="Concluida">Concluídas</option>
        </select>
      </div>
      <button @click="$emit('nova')" class="px-4 py-2 bg-amber-500 text-slate-900 font-medium rounded-lg hover:bg-amber-400 transition-colors">
        <Icon name="heroicons:plus" size="18" class="mr-1" />
        Nova Solicitação
      </button>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="text-center py-12">
      <Icon name="heroicons:arrow-path" class="animate-spin text-slate-400" size="40" />
      <p class="text-slate-500 mt-2">Carregando solicitações...</p>
    </div>

    <!-- Lista de Solicitações -->
    <div v-else-if="solicitacoesFiltradas.length > 0" class="space-y-4">
      <div
        v-for="sol in solicitacoesFiltradas"
        :key="sol.id"
        class="bg-white border border-slate-200 rounded-xl p-4 hover:shadow-md transition-shadow"
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
            <h4 class="font-semibold text-slate-800">{{ sol.titulo }}</h4>
            <p v-if="sol.descricao" class="text-sm text-slate-600 mt-1 line-clamp-2">{{ sol.descricao }}</p>
            <p class="text-xs text-slate-400 mt-2">
              Solicitado em {{ formatDate(sol.data_solicitacao) }}
            </p>
          </div>
          <button @click="verDetalhes(sol)" class="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg">
            <Icon name="heroicons:chevron-right" size="20" />
          </button>
        </div>

        <!-- Resposta (se houver) -->
        <div v-if="sol.resposta || sol.motivo_rejeicao" class="mt-4 pt-4 border-t border-slate-100">
          <p class="text-xs text-slate-500 mb-1">
            Resposta de {{ sol.respondido?.nome || 'RH' }} em {{ formatDate(sol.data_resposta) }}:
          </p>
          <p class="text-sm text-slate-700">{{ sol.resposta || sol.motivo_rejeicao }}</p>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="text-center py-12">
      <Icon name="heroicons:document-text" class="text-slate-300 mx-auto" size="48" />
      <p class="text-slate-500 mt-2">Nenhuma solicitação encontrada</p>
      <button @click="$emit('nova')" class="mt-4 px-4 py-2 bg-amber-500 text-slate-900 font-medium rounded-lg hover:bg-amber-400">
        Criar Primeira Solicitação
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  solicitacoes: any[]
  loading: boolean
}>()

const emit = defineEmits<{
  nova: []
  refresh: []
}>()

const filtroStatus = ref('todos')

const solicitacoesFiltradas = computed(() => {
  if (filtroStatus.value === 'todos') return props.solicitacoes
  return props.solicitacoes.filter(s => s.status === filtroStatus.value)
})

const getTipoLabel = (tipo: string) => {
  const tipos: Record<string, string> = {
    'ferias': 'Férias',
    'abono': 'Abono',
    'atestado': 'Atestado',
    'declaracao': 'Declaração',
    'alteracao_dados': 'Alteração de Dados',
    'holerite': 'Holerite',
    'informe_rendimentos': 'Informe de Rendimentos',
    'carta_referencia': 'Carta de Referência',
    'outros': 'Outros'
  }
  return tipos[tipo] || tipo
}

const getTipoClass = (tipo: string) => {
  const classes: Record<string, string> = {
    'ferias': 'bg-amber-100 text-amber-700',
    'abono': 'bg-blue-100 text-blue-700',
    'atestado': 'bg-purple-100 text-purple-700',
    'declaracao': 'bg-green-100 text-green-700',
    'holerite': 'bg-slate-100 text-slate-700',
    'informe_rendimentos': 'bg-indigo-100 text-indigo-700',
  }
  return classes[tipo] || 'bg-slate-100 text-slate-700'
}

const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    'Pendente': 'Pendente',
    'Em_Analise': 'Em Análise',
    'Aprovada': 'Aprovada',
    'Rejeitada': 'Rejeitada',
    'Cancelada': 'Cancelada',
    'Concluida': 'Concluída'
  }
  return labels[status] || status
}

const getStatusClass = (status: string) => {
  const classes: Record<string, string> = {
    'Pendente': 'bg-yellow-100 text-yellow-700',
    'Em_Analise': 'bg-blue-100 text-blue-700',
    'Aprovada': 'bg-green-100 text-green-700',
    'Rejeitada': 'bg-red-100 text-red-700',
    'Cancelada': 'bg-slate-100 text-slate-700',
    'Concluida': 'bg-green-100 text-green-700'
  }
  return classes[status] || 'bg-slate-100 text-slate-700'
}

const formatDate = (date: string) => {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('pt-BR')
}

const verDetalhes = (sol: any) => {
  // TODO: Abrir modal de detalhes
  console.log('Ver detalhes:', sol)
}
</script>
