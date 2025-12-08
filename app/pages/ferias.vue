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
              <h1 class="text-xl font-bold text-gray-800">Gestão de Férias</h1>
              <p class="text-sm text-gray-500">Controle de férias e períodos aquisitivos</p>
            </div>
          </div>
          <div class="flex items-center gap-3">
            <UIButton theme="admin" variant="primary" @click="abrirModalSolicitacao">
              <Icon name="heroicons:plus" size="20" class="mr-1" />
              Nova Solicitação
            </UIButton>
            <UserProfileDropdown theme="admin" />
          </div>
        </div>
      </div>
    </header>

    <!-- Content -->
    <div class="max-w-7xl mx-auto p-8">
      <!-- Stats Cards -->
      <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-8">
        <UIStatsCard label="Pendentes" :value="stats.pendentes" icon="heroicons:clock" color="amber" />
        <UIStatsCard label="Aprovadas" :value="stats.aprovadas" icon="heroicons:check-circle" color="green" />
        <UIStatsCard label="Em Gozo" :value="stats.em_gozo" icon="heroicons:sun" color="blue" />
        <UIStatsCard label="Concluídas" :value="stats.concluidas" icon="heroicons:check-badge" color="gray" />
        <UIStatsCard label="Rejeitadas" :value="stats.rejeitadas" icon="heroicons:x-circle" color="red" />
        <UIStatsCard label="Vencendo" :value="stats.vencendo" icon="heroicons:exclamation-triangle" color="amber" />
        <UIStatsCard label="Dias no Ano" :value="stats.total_dias_ano" icon="heroicons:calendar-days" color="purple" />
      </div>

      <!-- Tabs -->
      <UITabs v-model="activeTab" :tabs="tabs" class="mb-6">
        <!-- Tab Solicitações -->
        <template #solicitacoes>
          <!-- Filtros -->
          <div class="flex flex-wrap gap-4 mb-6">
            <UISearchInput v-model="busca" placeholder="Buscar colaborador..." class="w-64" />
            <UISelect v-model="filtroStatus" class="w-48">
              <option value="todos">Todos os status</option>
              <option value="Pendente">Pendentes</option>
              <option value="Aprovada">Aprovadas</option>
              <option value="Em_Andamento">Em Gozo</option>
              <option value="Concluida">Concluídas</option>
              <option value="Rejeitada">Rejeitadas</option>
              <option value="Cancelada">Canceladas</option>
            </UISelect>
            <UISelect v-model="filtroAno" class="w-32">
              <option v-for="ano in anos" :key="ano" :value="ano">{{ ano }}</option>
            </UISelect>
          </div>

          <!-- Lista de Solicitações -->
          <div v-if="loading" class="text-center py-12">
            <Icon name="heroicons:arrow-path" class="animate-spin text-gray-400" size="40" />
            <p class="text-gray-500 mt-2">Carregando...</p>
          </div>

          <div v-else-if="feriasFiltradas.length === 0">
            <UIEmptyState
              icon="heroicons:sun"
              title="Nenhuma solicitação encontrada"
              description="Não há solicitações de férias com os filtros selecionados."
              color="amber"
            >
              <template #action>
                <UIButton theme="admin" variant="primary" @click="abrirModalSolicitacao">
                  Nova Solicitação
                </UIButton>
              </template>
            </UIEmptyState>
          </div>

          <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <FeriasSolicitacaoCard
              v-for="f in feriasFiltradas"
              :key="f.id"
              :solicitacao="f"
              :show-approval-actions="f.status === 'Pendente'"
              :show-cancel-action="f.status === 'Pendente'"
              @aprovar="abrirModalAprovacao"
              @rejeitar="abrirModalAprovacao"
              @detalhes="verDetalhes"
              @cancelar="confirmarCancelamento"
            />
          </div>
        </template>

        <!-- Tab Calendário -->
        <template #calendario>
          <FeriasCalendario :ferias="feriasCalendario" />
        </template>

        <!-- Tab Configurações -->
        <template #configuracoes>
          <UICard title="Configurações de Férias" icon="heroicons:cog-6-tooth" icon-color="gray">
            <form @submit.prevent="salvarConfiguracoes" class="space-y-6">
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <UIInput
                  v-model.number="configForm.dias_minimos_fracionamento"
                  type="number"
                  label="Dias mínimos por fração"
                  :min="5"
                  :max="30"
                />
                <UIInput
                  v-model.number="configForm.dias_maximos_venda"
                  type="number"
                  label="Máximo de dias para venda"
                  :min="0"
                  :max="10"
                />
                <UIInput
                  v-model.number="configForm.antecedencia_minima_dias"
                  type="number"
                  label="Antecedência mínima (dias)"
                  :min="1"
                />
                <UIInput
                  v-model.number="configForm.max_fracoes"
                  type="number"
                  label="Máximo de frações"
                  :min="1"
                  :max="3"
                />
                <UIInput
                  v-model.number="configForm.notificar_vencimento_dias"
                  type="number"
                  label="Notificar vencimento (dias antes)"
                  :min="1"
                />
              </div>

              <div class="space-y-3">
                <UICheckbox
                  v-model="configForm.permite_fracionamento"
                  label="Permitir fracionamento de férias"
                  description="Colaboradores podem dividir as férias em até 3 períodos"
                />
                <UICheckbox
                  v-model="configForm.permite_abono_pecuniario"
                  label="Permitir abono pecuniário"
                  description="Colaboradores podem vender até 10 dias de férias"
                />
                <UICheckbox
                  v-model="configForm.notificar_aprovador"
                  label="Notificar aprovador"
                  description="Enviar e-mail ao gestor quando houver nova solicitação"
                />
                <UICheckbox
                  v-model="configForm.notificar_rh"
                  label="Notificar RH"
                  description="Enviar cópia das notificações para o RH"
                />
                <UICheckbox
                  v-model="configForm.bloquear_ferias_coletivas"
                  label="Bloquear férias coletivas"
                  description="Impedir solicitações durante períodos de férias coletivas"
                />
              </div>

              <div class="flex justify-end pt-4 border-t border-gray-200">
                <UIButton type="submit" theme="admin" variant="primary" :loading="salvandoConfig">
                  Salvar Configurações
                </UIButton>
              </div>
            </form>
          </UICard>
        </template>
      </UITabs>
    </div>

    <!-- Modal Nova Solicitação -->
    <FeriasSolicitacaoModal
      v-model="showModalSolicitacao"
      :colaboradores="colaboradores"
      :periodos="[]"
      @submit="criarNovaSolicitacao"
    />

    <!-- Modal Aprovação -->
    <FeriasAprovacaoModal
      v-model="showModalAprovacao"
      :solicitacao="solicitacaoSelecionada"
      @aprovar="handleAprovar"
      @rejeitar="handleRejeitar"
    />
  </div>
</template>

<script setup lang="ts">
import type { Ferias } from '~/composables/useFerias'

definePageMeta({
  middleware: ['admin'],
  layout: false,
})

const { 
  ferias, stats, config, loading, 
  fetchFerias, fetchStats, fetchConfig,
  criarSolicitacao, aprovarFerias, rejeitarFerias, cancelarFerias, salvarConfig,
  getStatusLabel, formatDate
} = useFerias()

// State
const activeTab = ref('solicitacoes')
const busca = ref('')
const filtroStatus = ref('todos')
const filtroAno = ref(new Date().getFullYear())
const showModalSolicitacao = ref(false)
const showModalAprovacao = ref(false)
const solicitacaoSelecionada = ref<Ferias | null>(null)
const salvandoConfig = ref(false)
const colaboradores = ref<Array<{ id: string; nome: string }>>([])

const configForm = ref({
  dias_minimos_fracionamento: 5,
  dias_maximos_venda: 10,
  antecedencia_minima_dias: 30,
  permite_fracionamento: true,
  max_fracoes: 3,
  permite_abono_pecuniario: true,
  notificar_vencimento_dias: 60,
  notificar_aprovador: true,
  notificar_rh: true,
  bloquear_ferias_coletivas: false,
  periodos_bloqueados: [] as string[],
})

// Computed
const tabs = computed(() => [
  { id: 'solicitacoes', label: 'Solicitações', icon: 'heroicons:document-text', count: stats.value.pendentes },
  { id: 'calendario', label: 'Calendário', icon: 'heroicons:calendar' },
  { id: 'configuracoes', label: 'Configurações', icon: 'heroicons:cog-6-tooth' },
])

const anos = computed(() => {
  const anoAtual = new Date().getFullYear()
  return [anoAtual - 1, anoAtual, anoAtual + 1]
})

const feriasFiltradas = computed(() => {
  let resultado = ferias.value

  if (busca.value) {
    const termo = busca.value.toLowerCase()
    resultado = resultado.filter(f => 
      f.colaborador_nome?.toLowerCase().includes(termo) ||
      f.departamento?.toLowerCase().includes(termo)
    )
  }

  return resultado
})

const feriasCalendario = computed(() => {
  return ferias.value
    .filter(f => ['Aprovada', 'Em_Andamento'].includes(f.status))
    .map(f => ({
      id: f.id,
      colaborador: f.colaborador_nome,
      data_inicio: f.data_inicio,
      data_fim: f.data_fim,
      status: f.status === 'Em_Andamento' ? 'em_gozo' : 'aprovada',
    }))
})

// Methods
const carregarDados = async () => {
  try {
    await Promise.all([
      fetchFerias({ 
        status: filtroStatus.value === 'todos' ? undefined : filtroStatus.value, 
        ano: filtroAno.value 
      }),
      fetchStats(),
      fetchConfig(),
      carregarColaboradores(),
    ])
    
    // Sincronizar config form
    configForm.value = { ...config.value }
  } catch (e) {
    console.error('Erro ao carregar dados:', e)
  }
}

const carregarColaboradores = async () => {
  try {
    const data = await $fetch<any[]>('/api/colaboradores')
    colaboradores.value = data.map(c => ({ id: c.id, nome: c.nome }))
  } catch (e) {
    console.error('Erro ao carregar colaboradores:', e)
  }
}

const abrirModalSolicitacao = () => {
  showModalSolicitacao.value = true
}

const abrirModalAprovacao = (solicitacao: Ferias) => {
  solicitacaoSelecionada.value = solicitacao
  showModalAprovacao.value = true
}

const verDetalhes = (solicitacao: Ferias) => {
  // TODO: Implementar modal de detalhes
  console.log('Ver detalhes:', solicitacao)
}

const confirmarCancelamento = async (solicitacao: Ferias) => {
  if (confirm(`Deseja cancelar a solicitação de férias de ${solicitacao.colaborador_nome}?`)) {
    try {
      await cancelarFerias(solicitacao.id)
    } catch (e) {
      alert('Erro ao cancelar solicitação')
    }
  }
}

const criarNovaSolicitacao = async (dados: any) => {
  try {
    await criarSolicitacao(dados)
    showModalSolicitacao.value = false
  } catch (e) {
    alert('Erro ao criar solicitação')
  }
}

const handleAprovar = async (id: string) => {
  try {
    await aprovarFerias(id)
    showModalAprovacao.value = false
  } catch (e) {
    alert('Erro ao aprovar férias')
  }
}

const handleRejeitar = async (id: string, motivo: string) => {
  try {
    await rejeitarFerias(id, motivo)
    showModalAprovacao.value = false
  } catch (e) {
    alert('Erro ao rejeitar férias')
  }
}

const salvarConfiguracoes = async () => {
  salvandoConfig.value = true
  try {
    await salvarConfig(configForm.value)
    alert('Configurações salvas com sucesso!')
  } catch (e) {
    alert('Erro ao salvar configurações')
  } finally {
    salvandoConfig.value = false
  }
}

// Watchers
watch([filtroStatus, filtroAno], () => {
  fetchFerias({ 
    status: filtroStatus.value === 'todos' ? undefined : filtroStatus.value, 
    ano: filtroAno.value 
  })
})

// Lifecycle
onMounted(() => {
  carregarDados()
})
</script>
