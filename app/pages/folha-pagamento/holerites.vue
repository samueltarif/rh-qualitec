<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <header class="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div class="max-w-7xl mx-auto px-8 py-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-4">
            <NuxtLink to="/folha-pagamento" class="w-10 h-10 bg-red-700 rounded-lg flex items-center justify-center hover:bg-red-800 transition-colors">
              <Icon name="heroicons:arrow-left" class="text-white" size="20" />
            </NuxtLink>
            <div>
              <h1 class="text-xl font-bold text-gray-800">Gerenciar Holerites</h1>
              <p class="text-sm text-gray-500">Visualize, exclua e gerencie todos os holerites</p>
            </div>
          </div>
          <div class="flex items-center gap-3">
            <UIButton
              variant="secondary"
              icon-left="heroicons:arrow-path"
              @click="carregarHolerites"
              :disabled="loading"
            >
              Atualizar
            </UIButton>
            <UIButton
              icon-left="heroicons:plus"
              @click="navegarParaGerar"
            >
              Gerar Holerites
            </UIButton>
            <UserProfileDropdown theme="admin" />
          </div>
        </div>
      </div>
    </header>

    <!-- Content -->
    <div class="max-w-7xl mx-auto p-8">
      <!-- Stats -->
      <div class="grid md:grid-cols-4 gap-6 mb-8">

        <UIStatsCard
          title="Total de Holerites"
          :value="stats.total"
          icon="heroicons:document-text"
          color="blue"
        />
        <UIStatsCard
          title="Gerados"
          :value="stats.gerados"
          icon="heroicons:document-check"
          color="green"
        />
        <UIStatsCard
          title="Enviados"
          :value="stats.enviados"
          icon="heroicons:paper-airplane"
          color="purple"
        />
        <UIStatsCard
          title="Valor Total"
          :value="formatCurrency(stats.valorTotal)"
          icon="heroicons:currency-dollar"
          color="amber"
        />
      </div>

      <!-- Lista de Holerites -->
      <HoleritesList
        :holerites="holerites"
        :loading="loading"
        :show-delete="true"
        @visualizar="visualizarHolerite"
        @excluir="confirmarExclusao"
      />

      <!-- Modal de Visualização -->
      <ModalHolerite
        :show="modalVisualizar"
        :holerite-id="holeriteAtual?.id"
        @close="modalVisualizar = false"
      />

      <!-- Modal de Confirmação de Exclusão -->
      <ModalConfirmarExclusao
        :show="modalExcluir"
        :holerite="holeriteParaExcluir"
        :loading="excluindo"
        @close="modalExcluir = false"
        @confirmar="excluirHolerite"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: ['admin'],
  layout: false,
})

const router = useRouter()
const { buscarHolerites, excluirHolerite: excluirHoleriteAPI, holerites, loading } = useHolerites()

const modalVisualizar = ref(false)
const modalExcluir = ref(false)
const holeriteAtual = ref<any>(null)
const holeriteParaExcluir = ref<any>(null)
const excluindo = ref(false)

const stats = computed(() => {
  const total = holerites.value.length
  const gerados = holerites.value.filter(h => h.status === 'gerado').length
  const enviados = holerites.value.filter(h => h.status === 'enviado').length
  const valorTotal = holerites.value.reduce((sum, h) => sum + (h.salario_liquido || 0), 0)

  return { total, gerados, enviados, valorTotal }
})

const carregarHolerites = async () => {
  try {
    await buscarHolerites()
  } catch (error: any) {
    console.error('Erro ao carregar holerites:', error)
    alert('Erro ao carregar holerites: ' + error.message)
  }
}

const visualizarHolerite = (holerite: any) => {
  holeriteAtual.value = holerite
  modalVisualizar.value = true
}

const confirmarExclusao = (holerite: any) => {
  if (holerite.status !== 'gerado') {
    alert('Apenas holerites com status "Gerado" podem ser excluídos')
    return
  }
  
  holeriteParaExcluir.value = holerite
  modalExcluir.value = true
}

const excluirHolerite = async () => {
  if (!holeriteParaExcluir.value) return

  excluindo.value = true
  try {
    await excluirHoleriteAPI(holeriteParaExcluir.value.id)
    alert('Holerite excluído com sucesso!')
    modalExcluir.value = false
    holeriteParaExcluir.value = null
    await carregarHolerites()
  } catch (error: any) {
    console.error('Erro ao excluir holerite:', error)
    alert('Erro ao excluir holerite: ' + error.message)
  } finally {
    excluindo.value = false
  }
}

const navegarParaGerar = () => {
  router.push('/folha-pagamento')
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value || 0)
}

// Carregar ao montar
onMounted(() => {
  carregarHolerites()
})
</script>
