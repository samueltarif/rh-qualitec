<template>
  <UIModal v-model="isOpen" size="full">
    <template #header>
      <div class="flex items-center gap-3">
        <Icon name="heroicons:document-text" class="text-red-700" size="24" />
        <div>
          <h3 class="text-xl font-bold text-gray-800">Gerenciar Holerites</h3>
          <p class="text-sm text-gray-500">Visualize, exclua e gerencie todos os holerites</p>
        </div>
      </div>
    </template>

    <div class="space-y-6">
      <!-- Stats -->
      <div class="grid md:grid-cols-4 gap-4">
        <div class="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-blue-700 rounded-lg flex items-center justify-center">
              <Icon name="heroicons:document-text" class="text-white" size="20" />
            </div>
            <div>
              <p class="text-xs text-gray-600">Total de Holerites</p>
              <p class="text-2xl font-bold text-gray-800">{{ stats.total }}</p>
            </div>
          </div>
        </div>

        <div class="bg-green-50 border-2 border-green-200 rounded-xl p-4">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-green-700 rounded-lg flex items-center justify-center">
              <Icon name="heroicons:document-check" class="text-white" size="20" />
            </div>
            <div>
              <p class="text-xs text-gray-600">Gerados</p>
              <p class="text-2xl font-bold text-gray-800">{{ stats.gerados }}</p>
            </div>
          </div>
        </div>

        <div class="bg-purple-50 border-2 border-purple-200 rounded-xl p-4">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-purple-700 rounded-lg flex items-center justify-center">
              <Icon name="heroicons:paper-airplane" class="text-white" size="20" />
            </div>
            <div>
              <p class="text-xs text-gray-600">Enviados</p>
              <p class="text-2xl font-bold text-gray-800">{{ stats.enviados }}</p>
            </div>
          </div>
        </div>

        <div class="bg-amber-50 border-2 border-amber-200 rounded-xl p-4">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-amber-700 rounded-lg flex items-center justify-center">
              <Icon name="heroicons:currency-dollar" class="text-white" size="20" />
            </div>
            <div>
              <p class="text-xs text-gray-600">Valor Total</p>
              <p class="text-lg font-bold text-gray-800">{{ formatCurrency(stats.valorTotal) }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Filtros -->
      <div class="bg-white rounded-xl border-2 border-gray-200 p-4">
        <div class="grid md:grid-cols-5 gap-3">
          <div>
            <label class="block text-xs font-medium text-gray-700 mb-1">Mês</label>
            <select v-model="filtros.mes" class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg">
              <option value="">Todos</option>
              <option v-for="m in 12" :key="m" :value="m">{{ nomeMes(m) }}</option>
            </select>
          </div>
          
          <div>
            <label class="block text-xs font-medium text-gray-700 mb-1">Ano</label>
            <select v-model="filtros.ano" class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg">
              <option value="">Todos</option>
              <option v-for="a in anos" :key="a" :value="a">{{ a }}</option>
            </select>
          </div>
          
          <div>
            <label class="block text-xs font-medium text-gray-700 mb-1">Status</label>
            <select v-model="filtros.status" class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg">
              <option value="">Todos</option>
              <option value="gerado">Gerado</option>
              <option value="enviado">Enviado</option>
              <option value="pago">Pago</option>
            </select>
          </div>
          
          <div>
            <label class="block text-xs font-medium text-gray-700 mb-1">Tipo</label>
            <select v-model="filtros.tipo" class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg">
              <option value="">Todos</option>
              <option value="mensal">Mensal</option>
              <option value="decimo_terceiro">13º Salário</option>
            </select>
          </div>

          <div class="flex items-end">
            <UIButton 
              variant="secondary" 
              size="sm"
              icon-left="heroicons:x-mark"
              @click="limparFiltros"
              class="w-full"
            >
              Limpar
            </UIButton>
          </div>
        </div>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="text-center py-12">
        <Icon name="heroicons:arrow-path" class="animate-spin text-gray-400 mx-auto mb-4" size="48" />
        <p class="text-gray-600">Carregando holerites...</p>
      </div>

      <!-- Lista -->
      <div v-else-if="holeristesFiltrados.length > 0" class="grid md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
        <div
          v-for="holerite in holeristesFiltrados"
          :key="holerite.id"
          class="bg-white border-2 border-gray-200 rounded-xl p-4 hover:border-red-300 transition-colors"
        >
          <div class="flex items-start justify-between mb-3">
            <div class="flex-1">
              <h4 class="font-semibold text-gray-800">{{ holerite.nome_colaborador }}</h4>
              <p class="text-sm text-gray-500">{{ nomeMes(holerite.mes) }}/{{ holerite.ano }}</p>
            </div>
            <span 
              class="px-2 py-1 text-xs font-medium rounded-lg"
              :class="{
                'bg-green-100 text-green-700': holerite.status === 'gerado',
                'bg-blue-100 text-blue-700': holerite.status === 'enviado',
                'bg-purple-100 text-purple-700': holerite.status === 'pago'
              }"
            >
              {{ holerite.status }}
            </span>
          </div>

          <div class="space-y-1 mb-3 text-sm">
            <div class="flex justify-between">
              <span class="text-gray-600">Bruto:</span>
              <span class="font-medium">{{ formatCurrency(holerite.salario_bruto) }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600">Descontos:</span>
              <span class="font-medium text-red-600">{{ formatCurrency(holerite.total_descontos) }}</span>
            </div>
            <div class="flex justify-between border-t pt-1">
              <span class="text-gray-700 font-medium">Líquido:</span>
              <span class="font-bold text-green-700">{{ formatCurrency(holerite.salario_liquido) }}</span>
            </div>
          </div>

          <div class="flex gap-2">
            <UIButton 
              variant="secondary" 
              size="sm"
              icon-left="heroicons:eye"
              @click="visualizarHolerite(holerite)"
              class="flex-1"
            >
              Ver
            </UIButton>
            <UIButton 
              v-if="holerite.status === 'gerado'"
              variant="danger" 
              size="sm"
              icon-left="heroicons:trash"
              @click="confirmarExclusao(holerite)"
            >
              Excluir
            </UIButton>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="text-center py-12">
        <Icon name="heroicons:document-text" class="text-gray-300 mx-auto mb-4" size="64" />
        <h3 class="text-lg font-semibold text-gray-800 mb-2">Nenhum holerite encontrado</h3>
        <p class="text-gray-600">Não há holerites para os filtros selecionados</p>
      </div>
    </div>

    <template #footer>
      <div class="flex justify-between items-center">
        <UIButton 
          variant="secondary" 
          icon-left="heroicons:arrow-path"
          @click="carregarHolerites"
          :disabled="loading"
        >
          Atualizar
        </UIButton>
        <UIButton 
          variant="secondary"
          @click="fechar"
        >
          Fechar
        </UIButton>
      </div>
    </template>

    <!-- Modal de Visualização -->
    <ModalHolerite
      :show="modalVisualizar"
      :holerite="holeriteAtual"
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
  </UIModal>
</template>

<script setup lang="ts">
const props = defineProps<{
  modelValue: boolean
}>()

const emit = defineEmits(['update:modelValue'])

const { buscarHolerites, excluirHolerite: excluirHoleriteAPI, holerites, loading } = useHolerites()

const modalVisualizar = ref(false)
const modalExcluir = ref(false)
const holeriteAtual = ref<any>(null)
const holeriteParaExcluir = ref<any>(null)
const excluindo = ref(false)

const filtros = ref({
  mes: '',
  ano: '',
  status: '',
  tipo: ''
})

const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const anoAtual = new Date().getFullYear()
const anos = computed(() => {
  return Array.from({ length: 5 }, (_, i) => anoAtual - i)
})

const holeristesFiltrados = computed(() => {
  let resultado = [...holerites.value]
  
  if (filtros.value.mes) {
    resultado = resultado.filter(h => h.mes === Number(filtros.value.mes))
  }
  
  if (filtros.value.ano) {
    resultado = resultado.filter(h => h.ano === Number(filtros.value.ano))
  }
  
  if (filtros.value.status) {
    resultado = resultado.filter(h => h.status === filtros.value.status)
  }
  
  if (filtros.value.tipo) {
    resultado = resultado.filter(h => h.tipo === filtros.value.tipo)
  }
  
  return resultado
})

const stats = computed(() => {
  const total = holeristesFiltrados.value.length
  const gerados = holeristesFiltrados.value.filter(h => h.status === 'gerado').length
  const enviados = holeristesFiltrados.value.filter(h => h.status === 'enviado').length
  const valorTotal = holeristesFiltrados.value.reduce((sum, h) => sum + (h.salario_liquido || 0), 0)

  return { total, gerados, enviados, valorTotal }
})

const nomeMes = (mes: number) => {
  const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
  return meses[mes - 1]
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value || 0)
}

const limparFiltros = () => {
  filtros.value = {
    mes: '',
    ano: '',
    status: '',
    tipo: ''
  }
}

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

const fechar = () => {
  isOpen.value = false
}

// Carregar ao abrir
watch(() => props.modelValue, (newValue) => {
  if (newValue) {
    carregarHolerites()
  }
})
</script>
