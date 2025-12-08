<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header - Componente Separado -->
    <FolhaPageHeader 
      @gerenciar-holerites="modalGerenciarHolerites = true"
      @abrir-auditoria-inss="modalAuditoriaINSS = true"
    />

    <!-- Content -->
    <div class="max-w-7xl mx-auto p-8">
      <!-- Filtros - Componente Separado -->
      <FolhaFiltrosPeriodo 
        v-model:mes="filtros.mes"
        v-model:ano="filtros.ano"
        :loading="loading"
        :loading-holerites="loadingHolerites"
        :tem-folha="!!folha"
        @calcular="calcularFolha"
        @gerar-holerites="gerarHolerites"
      />

      <!-- Loading -->
      <div v-if="loading" class="card text-center py-12">
        <Icon name="heroicons:arrow-path" class="animate-spin text-gray-400 mx-auto mb-4" size="48" />
        <p class="text-gray-600">Calculando folha de pagamento...</p>
      </div>

      <!-- Resultado -->
      <template v-else-if="folha">
        <!-- Cards de Totais - Componente Separado -->
        <FolhaCardsTotais :totais="folha.totais" />

        <!-- Resumo Detalhado - Componente Separado -->
        <FolhaResumoDetalhadoCard 
          :titulo="`${nomeMes(filtros.mes)}/${filtros.ano}`"
          :totais="folha.totais"
          mostrar-detalhes
          class="mb-8"
        />

        <!-- Ações Rápidas: Férias, 13º, Rescisão - Componente Separado -->
        <FolhaAcoesRapidasCalculos 
          @abrir-modal-adiantamento="abrirModalAdiantamento"
          @abrir-modal-13-salario="abrirModal13Salario"
          @abrir-modal-rescisao="abrirModalRescisao"
          class="mb-8"
        />

        <!-- Tabela de Colaboradores - Componente Separado -->
        <FolhaDetalhamentoColaboradores 
          :folha="folha.folha"
          :totais="folha.totais"
          :mes="filtros.mes"
          :ano="filtros.ano"
          :loading-acoes="loadingAcoes"
          :loading-emails="loadingEmails"
          @editar="abrirModalEdicao"
          @gerar-holerite="gerarHoleriteIndividual"
          @enviar-email="enviarHoleritePorEmail"
        />

        <!-- Observações - Componente Separado -->
        <FolhaObservacoes />
      </template>

      <!-- Empty State -->
      <div v-else class="card text-center py-12">
        <Icon name="heroicons:calculator" class="text-gray-300 mx-auto mb-4" size="64" />
        <h3 class="text-lg font-semibold text-gray-800 mb-2">Nenhuma folha calculada</h3>
        <p class="text-gray-600 mb-6">Selecione o mês e ano e clique em "Calcular Folha"</p>
      </div>
    </div>

    <!-- Modal de 13º Salário -->
    <Modal13Salario 
      v-model="modal13Aberto"
      @sucesso="handleSucesso13"
    />

    <!-- Modal de Adiantamento Salarial -->
    <ModalAdiantamento 
      :show="modalAdiantamento.aberto"
      :colaboradores="colaboradoresAtivos"
      :percentual="parametrosAdiantamento.percentual"
      :dia-pagamento="parametrosAdiantamento.diaPagamento"
      @close="modalAdiantamento.aberto = false"
      @success="handleSucessoAdiantamento"
    />

    <!-- Modal de Gerenciar Holerites -->
    <ModalGerenciarHolerites v-model="modalGerenciarHolerites" />

    <!-- Modal de Auditoria INSS -->
    <ModalAuditoriaINSS 
      v-model:aberto="modalAuditoriaINSS"
      @fechar="modalAuditoriaINSS = false"
    />

    <!-- Modal de Edição - Componente Separado -->
    <FolhaModalEdicao 
      v-model:aberto="modalEdicao.aberto"
      :dados="modalEdicao.dados"
      v-model:proventos="proventosData"
      v-model:descontos="descontosData"
      v-model:beneficios="beneficiosData"
      v-model:impostos="impostosData"
      :resumo="modalEdicao.resumo"
      :nome-mes="nomeMes(filtros.mes)"
      :ano="filtros.ano"
      @recalcular="recalcularResumo"
      @fechar="fecharModalEdicao"
      @salvar="salvarEdicao"
    />
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: ['admin'],
  layout: false,
})

// Estado da folha
const loading = ref(false)
const folha = ref<any>(null)

// Filtros
const hoje = new Date()
const filtros = ref({
  mes: String(hoje.getMonth() + 1),
  ano: String(hoje.getFullYear()),
})

// Usar composables
const { nomeMes } = useFolhaCalculos()

// Composable de holerites
const {
  loadingAcoes,
  loadingEmails,
  loadingHolerites,
  gerarHolerites: gerarHoleritesAction,
  gerarHoleriteIndividual: gerarHoleriteIndividualAction,
  enviarHoleritePorEmail: enviarHoleritePorEmailAction,
} = useFolhaHolerites()

// Composable de modal de edição
const {
  modalEdicao,
  beneficiosData,
  proventosData,
  descontosData,
  impostosData,
  abrirModalEdicao,
  fecharModalEdicao,
  recalcularResumo,
  salvarEdicao,
} = useFolhaModalEdicao()

// Composable de modais
const {
  modal13Aberto,
  modalGerenciarHolerites,
  modalAdiantamento,
  colaboradoresAtivos,
  parametrosAdiantamento,
  abrirModal13Salario,
  handleSucesso13,
  abrirModalAdiantamento,
  handleSucessoAdiantamento: handleSucessoAdiantamentoBase,
  abrirModalRescisao,
  inicializarDados,
} = useFolhaModais()

// Modal de Auditoria INSS
const modalAuditoriaINSS = ref(false)

// Calcular folha
const calcularFolha = async () => {
  loading.value = true
  try {
    const response = await $fetch<{ success: boolean; data: any }>('/api/folha/calcular', {
      method: 'POST',
      body: {
        mes: parseInt(filtros.value.mes),
        ano: parseInt(filtros.value.ano),
      },
    })

    if (response.success) {
      folha.value = response.data
    }
  } catch (error: any) {
    console.error('Erro ao calcular folha:', error)
    alert(`Erro ao calcular folha: ${error.data?.message || error.message || 'Erro desconhecido'}`)
  } finally {
    loading.value = false
  }
}

// Wrapper para gerar holerites
const gerarHolerites = async () => {
  if (!folha.value) {
    alert('Calcule a folha primeiro')
    return
  }
  await gerarHoleritesAction(filtros.value.mes, filtros.value.ano, folha.value.totais.total_colaboradores)
}

// Wrapper para gerar holerite individual
const gerarHoleriteIndividual = async (item: any) => {
  await gerarHoleriteIndividualAction(item, filtros.value.mes, filtros.value.ano)
}

// Wrapper para enviar holerite por email
const enviarHoleritePorEmail = async (item: any) => {
  await enviarHoleritePorEmailAction(item, filtros.value.mes, filtros.value.ano)
}

// Handler de sucesso do adiantamento
const handleSucessoAdiantamento = () => {
  handleSucessoAdiantamentoBase(() => {
    if (folha.value) {
      calcularFolha()
    }
  })
}

// Inicializar e calcular ao montar
onMounted(async () => {
  await inicializarDados()
  await calcularFolha()
})
</script>
