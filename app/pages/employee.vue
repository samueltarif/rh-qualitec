<template>
  <div class="min-h-screen bg-slate-50">
    <!-- Header -->
    <EmployeeHeader empresa="Qualitec Instrumentos de Medição" />

    <!-- Content -->
    <div class="max-w-7xl mx-auto p-6">
      <!-- Saudação -->
      <EmployeeSaudacao
        :nome="perfil?.colaborador?.nome || currentUser?.nome"
        :cargo="perfil?.colaborador?.cargo?.nome"
        :departamento="perfil?.colaborador?.departamento?.nome"
      />

      <!-- Stats Cards -->
      <EmployeeStatsGrid :stats="stats" class="mb-8" />

      <!-- Contador de Horas Trabalhadas Hoje -->
      <EmployeeHorasTrabalhadasCard
        :registro-hoje="registroHoje"
        :horas-formatadas="horasTrabalhadasHoje"
        :em-andamento="registroEmAndamento"
        class="mb-6"
      />

      <!-- Registro de Ponto Rápido com GPS -->
      <EmployeeRegistroPontoCard
        :data-hora-atual="dataHoraAtual"
        :ultimo-registro="ultimoRegistro"
        @sucesso="handlePontoSucesso"
        class="mb-8"
      />

      <!-- Tabs de Navegação -->
      <EmployeeTabsContainer
        :tabs="tabs"
        v-model="activeTab"
        @change="activeTab = $event"
      >
        <!-- Tab: Meu Ponto -->
        <div v-if="activeTab === 'ponto'">
          <EmployeePontoTab 
            :registros="registrosPonto" 
            :loading="loading"
            @refresh="(mes, ano) => fetchPonto(mes, ano)"
          />
        </div>

        <!-- Tab: Holerites -->
        <div v-else-if="activeTab === 'holerites'">
          <EmployeeHoleritesTab />
        </div>



        <!-- Tab: Minhas Solicitações -->
        <div v-else-if="activeTab === 'solicitacoes'">
          <EmployeeSolicitacoesTab
            :solicitacoes="solicitacoes"
            :loading="loading"
            @nova="showModalSolicitacao = true"
            @refresh="fetchSolicitacoes"
          />
        </div>

        <!-- Tab: Meus Documentos -->
        <div v-else-if="activeTab === 'documentos'">
          <EmployeeDocumentosTab
            :documentos="documentos"
            :loading="loading"
            @refresh="fetchDocumentos"
          />
        </div>

        <!-- Tab: Comunicados -->
        <div v-else-if="activeTab === 'comunicados'">
          <EmployeeComunicadosTab
            :comunicados="comunicados"
            @ler="marcarComunicadoLido"
          />
        </div>

        <!-- Tab: Meu Perfil -->
        <div v-else-if="activeTab === 'perfil'">
          <EmployeePerfilTab :perfil="perfil" @refresh="fetchPerfil" />
        </div>
      </EmployeeTabsContainer>
    </div>

    <!-- Modal Nova Solicitação -->
    <EmployeeSolicitacaoModal
      v-model="showModalSolicitacao"
      @submit="handleNovaSolicitacao"
    />
  </div>
</template>

<script setup lang="ts">
import { calcularHorasTempoReal, registroEmAndamento as verificarEmAndamento } from '~/utils/pontoCalculos'

definePageMeta({
  middleware: ['employee'],
  layout: false,
})

const { currentUser } = useAppAuth()
const {
  perfil, solicitacoes, registrosPonto, documentos, comunicados, stats, loading,
  fetchPerfil, fetchStats, fetchSolicitacoes, fetchPonto, fetchDocumentos, 
  fetchComunicados, marcarComunicadoLido, criarSolicitacao, registrarPonto
} = useFuncionario()

const activeTab = ref('ponto')
const showModalSolicitacao = ref(false)
const registrandoPonto = ref(false)
const ultimoRegistro = ref('')
const horaAtualTimer = ref(new Date())

// Timer para atualizar hora a cada minuto
let intervalId: NodeJS.Timeout | null = null

onMounted(() => {
  // Atualizar imediatamente
  horaAtualTimer.value = new Date()
  
  // Depois atualizar a cada minuto
  intervalId = setInterval(() => {
    horaAtualTimer.value = new Date()
  }, 60000) // Atualiza a cada minuto
})

onUnmounted(() => {
  if (intervalId) {
    clearInterval(intervalId)
  }
})

// Buscar registro de hoje
const registroHoje = computed(() => {
  if (!registrosPonto.value || registrosPonto.value.length === 0) return null
  
  const hoje = new Date()
  const hojeStr = hoje.toISOString().split('T')[0]
  
  // Buscar registro de hoje
  const registro = registrosPonto.value.find((r: any) => {
    if (!r.data) return false
    // Comparar apenas a data (YYYY-MM-DD)
    const dataRegistro = r.data.split('T')[0]
    return dataRegistro === hojeStr
  })
  
  return registro || null
})

// Verificar se está em andamento
const registroEmAndamento = computed(() => {
  if (!registroHoje.value) return false
  return verificarEmAndamento(registroHoje.value)
})

// Calcular horas trabalhadas hoje em tempo real
const horasTrabalhadasHoje = computed(() => {
  if (!registroHoje.value) return '0h00'
  
  try {
    const resultado = calcularHorasTempoReal(registroHoje.value, horaAtualTimer.value)
    return resultado.horasFormatadas
  } catch (e) {
    console.error('Erro ao calcular horas:', e)
    return '0h00'
  }
})

const tabs = computed(() => [
  { id: 'ponto', label: 'Meu Ponto', icon: 'heroicons:clock' },
  { id: 'holerites', label: 'Holerites', icon: 'heroicons:banknotes' },
  { id: 'solicitacoes', label: 'Solicitações', icon: 'heroicons:document-text', count: stats.value?.solicitacoes_pendentes || undefined },
  { id: 'documentos', label: 'Documentos', icon: 'heroicons:folder-open', count: stats.value?.documentos_novos || undefined },
  { id: 'comunicados', label: 'Comunicados', icon: 'heroicons:bell', count: stats.value?.comunicados_nao_lidos || undefined },
  { id: 'perfil', label: 'Meu Perfil', icon: 'heroicons:user-circle' },
])

const dataHoraAtual = computed(() => {
  const agora = new Date()
  return agora.toLocaleDateString('pt-BR', { 
    weekday: 'long', 
    day: '2-digit', 
    month: 'long', 
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
})

const handlePontoSucesso = async (data: any) => {
  ultimoRegistro.value = data.message || 'Ponto registrado com sucesso!'
  
  // Recarregar registros de ponto para atualizar o contador
  await fetchPonto()
}

const handleNovaSolicitacao = async (dados: any) => {
  try {
    await criarSolicitacao(dados)
    showModalSolicitacao.value = false
    alert('Solicitação enviada com sucesso!')
  } catch (e: any) {
    alert(e.message || 'Erro ao criar solicitação')
  }
}

// Watch para debug
watch(registrosPonto, (novos) => {
  console.log('📊 Registros de ponto atualizados:', novos?.length || 0)
  if (novos && novos.length > 0) {
    console.log('📅 Primeiro registro:', novos[0])
  }
}, { immediate: true })

watch(registroHoje, (registro) => {
  console.log('📍 Registro de hoje:', registro)
}, { immediate: true })

onMounted(async () => {
  await Promise.all([
    fetchPerfil(),
    fetchStats(),
    fetchPonto(),
    fetchSolicitacoes(),
    fetchDocumentos(),
    fetchComunicados()
  ])
  
  // Forçar atualização após carregar
  horaAtualTimer.value = new Date()
})
</script>
