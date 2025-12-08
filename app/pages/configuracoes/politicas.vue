<template>
  <div class="container mx-auto px-4 py-8">
    <!-- Botão Voltar -->
    <div class="mb-6">
      <button 
        @click="navigateTo('/configuracoes')" 
        class="flex items-center gap-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
      >
        <Icon name="mdi:arrow-left" size="20" />
        Voltar para Configurações
      </button>
    </div>

    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-800 mb-2">Políticas e Compliance</h1>
      <p class="text-gray-600">LGPD, termos de uso, políticas internas e gestão de compliance</p>
    </div>

    <!-- Estatísticas -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <div class="card">
        <div class="text-sm text-gray-600 mb-1">Total de Políticas</div>
        <div class="text-2xl font-bold text-gray-800">{{ stats.totalPoliticas }}</div>
        <div class="text-xs text-gray-500 mt-1">{{ stats.politicasPublicadas }} publicadas</div>
      </div>
      <div class="card">
        <div class="text-sm text-gray-600 mb-1">Taxa de Aceite</div>
        <div class="text-2xl font-bold text-green-600">{{ stats.taxaAceite }}%</div>
        <div class="text-xs text-gray-500 mt-1">{{ stats.aceitesCompletos }}/{{ stats.totalAceites }}</div>
      </div>
      <div class="card">
        <div class="text-sm text-gray-600 mb-1">Aceites Pendentes</div>
        <div class="text-2xl font-bold text-amber-600">{{ stats.aceitesPendentes }}</div>
        <div class="text-xs text-red-500 mt-1">{{ stats.aceitesAtrasados }} atrasados</div>
      </div>
      <div class="card">
        <div class="text-sm text-gray-600 mb-1">Incidentes</div>
        <div class="text-2xl font-bold text-red-600">{{ stats.totalIncidentes }}</div>
        <div class="text-xs text-gray-500 mt-1">{{ stats.incidentesAbertos }} abertos</div>
      </div>
    </div>

    <!-- Tabs -->
    <div class="mb-6">
      <div class="border-b border-gray-200">
        <nav class="-mb-px flex space-x-8">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            @click="activeTab = tab.id"
            :class="[
              'py-4 px-1 border-b-2 font-medium text-sm transition-colors',
              activeTab === tab.id
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            ]"
          >
            <Icon :name="tab.icon" class="inline mr-2" />
            {{ tab.label }}
          </button>
        </nav>
      </div>
    </div>

    <!-- Conteúdo das Tabs -->
    <div v-if="activeTab === 'politicas'" class="space-y-6">
      <div class="flex justify-between items-center mb-4">
        <div>
          <h2 class="text-xl font-semibold">Políticas e Documentos</h2>
          <p class="text-sm text-gray-600">Gerencie políticas internas e documentos de compliance</p>
        </div>
        <button @click="abrirModalPolitica()" class="btn-primary">
          <Icon name="mdi:plus" class="mr-2" />
          Nova Política
        </button>
      </div>

      <!-- Filtros -->
      <div class="flex gap-3 mb-4">
        <select v-model="filtroTipo" class="input w-48">
          <option value="">Todos os tipos</option>
          <option value="lgpd">LGPD</option>
          <option value="termo_uso">Termo de Uso</option>
          <option value="politica_interna">Política Interna</option>
          <option value="codigo_conduta">Código de Conduta</option>
          <option value="regulamento">Regulamento</option>
        </select>
        <select v-model="filtroStatus" class="input w-48">
          <option value="">Todos os status</option>
          <option value="rascunho">Rascunho</option>
          <option value="em_revisao">Em Revisão</option>
          <option value="aprovado">Aprovado</option>
          <option value="publicado">Publicado</option>
          <option value="arquivado">Arquivado</option>
        </select>
      </div>

      <!-- Lista de Políticas -->
      <div class="grid grid-cols-1 gap-4">
        <div
          v-for="politica in politicasFiltradas"
          :key="politica.id"
          class="card hover:shadow-lg transition-shadow"
        >
          <div class="flex justify-between items-start">
            <div class="flex-1">
              <div class="flex items-center gap-2 mb-2">
                <h3 class="text-lg font-semibold">{{ politica.titulo }}</h3>
                <span
                  :class="[
                    'px-2 py-1 text-xs rounded',
                    politica.publicado ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                  ]"
                >
                  {{ politica.publicado ? 'Publicado' : politica.status }}
                </span>
                <span
                  v-if="politica.obrigatorio_aceite"
                  class="px-2 py-1 text-xs bg-red-100 text-red-700 rounded"
                >
                  Obrigatório
                </span>
              </div>
              <p class="text-sm text-gray-600 mb-2">{{ politica.descricao }}</p>
              <div class="flex items-center gap-4 text-xs text-gray-500">
                <span>
                  <Icon name="mdi:tag" class="inline" />
                  {{ formatarTipo(politica.tipo) }}
                </span>
                <span v-if="politica.categoria">
                  <Icon name="mdi:folder" class="inline" />
                  {{ politica.categoria }}
                </span>
                <span>
                  <Icon name="mdi:calendar" class="inline" />
                  Vigência: {{ formatarData(politica.data_vigencia) }}
                </span>
                <span>
                  <Icon name="mdi:file-document" class="inline" />
                  v{{ politica.versao }}
                </span>
              </div>
            </div>
            <div class="flex gap-2">
              <button
                @click="abrirModalPolitica(politica)"
                class="btn-icon"
                title="Editar"
              >
                <Icon name="mdi:pencil" />
              </button>
              <button
                @click="excluirPolitica(politica.id)"
                class="btn-icon text-red-600 hover:bg-red-50"
                title="Excluir"
              >
                <Icon name="mdi:delete" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Política -->
    <ModalPolitica
      v-if="modalPolitica"
      :politica="politicaSelecionada"
      @close="modalPolitica = false"
      @saved="carregarPoliticas"
    />
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: 'admin',
  layout: 'default'
})

const tabs = [
  { id: 'politicas', label: 'Políticas', icon: 'mdi:file-document-multiple' },
  { id: 'aceites', label: 'Aceites', icon: 'mdi:check-circle' },
  { id: 'incidentes', label: 'Incidentes', icon: 'mdi:alert' },
  { id: 'auditorias', label: 'Auditorias', icon: 'mdi:clipboard-check' }
]

const activeTab = ref('politicas')
const modalPolitica = ref(false)
const politicaSelecionada = ref(null)
const filtroTipo = ref('')
const filtroStatus = ref('')

const stats = ref({
  totalPoliticas: 0,
  politicasPublicadas: 0,
  politicasRascunho: 0,
  politicasObrigatorias: 0,
  totalAceites: 0,
  aceitesCompletos: 0,
  aceitesPendentes: 0,
  aceitesAtrasados: 0,
  taxaAceite: '0.0',
  totalIncidentes: 0,
  incidentesAbertos: 0,
  incidentesCriticos: 0,
  totalTreinamentos: 0,
  treinamentosAtivos: 0
})

const politicas = ref([])

const politicasFiltradas = computed(() => {
  let resultado = politicas.value

  if (filtroTipo.value) {
    resultado = resultado.filter(p => p.tipo === filtroTipo.value)
  }

  if (filtroStatus.value) {
    resultado = resultado.filter(p => p.status === filtroStatus.value)
  }

  return resultado
})

onMounted(async () => {
  await Promise.all([
    carregarStats(),
    carregarPoliticas()
  ])
})

watch([filtroTipo, filtroStatus], () => {
  // Filtros são reativos via computed
})

async function carregarStats() {
  try {
    const data = await $fetch('/api/politicas/stats')
    stats.value = data
  } catch (error) {
    console.error('Erro ao carregar estatísticas:', error)
  }
}

async function carregarPoliticas() {
  try {
    politicas.value = await $fetch('/api/politicas')
  } catch (error) {
    console.error('Erro ao carregar políticas:', error)
  }
}

function abrirModalPolitica(politica = null) {
  politicaSelecionada.value = politica
  modalPolitica.value = true
}

async function excluirPolitica(id: string) {
  if (!confirm('Deseja realmente excluir esta política?')) return

  try {
    await $fetch(`/api/politicas/${id}`, { method: 'DELETE' })
    await carregarPoliticas()
    await carregarStats()
    alert('Política excluída com sucesso!')
  } catch (error) {
    console.error('Erro ao excluir política:', error)
    alert('Erro ao excluir política')
  }
}

function formatarTipo(tipo: string) {
  const tipos = {
    lgpd: 'LGPD',
    termo_uso: 'Termo de Uso',
    politica_interna: 'Política Interna',
    codigo_conduta: 'Código de Conduta',
    regulamento: 'Regulamento',
    outro: 'Outro'
  }
  return tipos[tipo] || tipo
}

function formatarData(data: string) {
  return new Date(data).toLocaleDateString('pt-BR')
}
</script>
