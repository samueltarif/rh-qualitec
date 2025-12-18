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

      <!-- Barra de Ações em Massa -->
      <div v-if="modoSelecao" class="bg-red-50 border-2 border-red-200 rounded-xl p-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <Icon name="heroicons:check-circle" class="text-red-700" size="24" />
            <div>
              <p class="font-semibold text-gray-800">{{ selecionados.length }} holerite(s) selecionado(s)</p>
              <p class="text-sm text-gray-600">Selecione os holerites que deseja excluir</p>
            </div>
          </div>
          <div class="flex gap-2">
            <UIButton 
              variant="secondary" 
              size="sm"
              @click="cancelarSelecao"
            >
              Cancelar
            </UIButton>
            <UIButton 
              variant="danger" 
              size="sm"
              icon-left="heroicons:trash"
              @click="excluirSelecionados"
              :disabled="selecionados.length === 0"
            >
              Excluir Selecionados ({{ selecionados.length }})
            </UIButton>
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

          <div class="flex items-end gap-2">
            <UIButton 
              variant="secondary" 
              size="sm"
              icon-left="heroicons:x-mark"
              @click="limparFiltros"
              class="flex-1"
            >
              Limpar
            </UIButton>
          </div>
        </div>
        
        <!-- Ações em Massa -->
        <div class="flex gap-2 mt-3 pt-3 border-t border-gray-200">
          <UIButton 
            v-if="!modoSelecao"
            variant="secondary" 
            size="sm"
            icon-left="heroicons:check-circle"
            @click="ativarModoSelecao"
            :disabled="holeristesFiltrados.length === 0"
          >
            Selecionar Múltiplos
          </UIButton>
          <UIButton 
            v-if="!modoSelecao"
            variant="danger" 
            size="sm"
            icon-left="heroicons:trash"
            @click="confirmarExcluirTodos"
            :disabled="holeristesFiltrados.length === 0"
          >
            Excluir Todos Filtrados ({{ holeristesFiltrados.length }})
          </UIButton>
          <UIButton 
            v-if="modoSelecao"
            variant="secondary" 
            size="sm"
            @click="selecionarTodos"
          >
            Selecionar Todos ({{ holeristesFiltrados.length }})
          </UIButton>
          <UIButton 
            v-if="modoSelecao && selecionados.length > 0"
            variant="secondary" 
            size="sm"
            @click="desmarcarTodos"
          >
            Desmarcar Todos
          </UIButton>
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
          class="bg-white border-2 rounded-xl p-4 transition-all cursor-pointer"
          :class="{
            'border-red-500 bg-red-50': modoSelecao && selecionados.includes(holerite.id),
            'border-gray-200 hover:border-red-300': !modoSelecao || !selecionados.includes(holerite.id)
          }"
          @click="modoSelecao && toggleSelecao(holerite.id)"
        >
          <div class="flex items-start justify-between mb-3">
            <div class="flex items-start gap-2 flex-1">
              <!-- Checkbox de Seleção -->
              <div v-if="modoSelecao" class="mt-1">
                <input 
                  type="checkbox" 
                  :checked="selecionados.includes(holerite.id)"
                  @click.stop="toggleSelecao(holerite.id)"
                  class="w-5 h-5 text-red-600 border-gray-300 rounded focus:ring-red-500"
                />
              </div>
              <div class="flex-1">
                <h4 class="font-semibold text-gray-800">{{ holerite.nome_colaborador }}</h4>
                <p class="text-sm text-gray-500">{{ nomeMes(holerite.mes) }}/{{ holerite.ano }}</p>
              </div>
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
              <span class="font-medium">{{ formatCurrency(calcularTotalProventos(holerite)) }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600">Descontos:</span>
              <span class="font-medium text-red-600">{{ formatCurrency(calcularTotalDescontos(holerite)) }}</span>
            </div>
            <div class="flex justify-between border-t pt-1">
              <span class="text-gray-700 font-medium">Líquido:</span>
              <span class="font-bold text-green-700">{{ formatCurrency(calcularSalarioLiquido(holerite)) }}</span>
            </div>
          </div>

          <div v-if="!modoSelecao" class="flex gap-2">
            <UIButton 
              variant="secondary" 
              size="sm"
              icon-left="heroicons:eye"
              @click.stop="visualizarHolerite(holerite)"
              class="flex-1"
            >
              Ver
            </UIButton>
            <UIButton 
              v-if="holerite.status === 'gerado'"
              variant="danger" 
              size="sm"
              icon-left="heroicons:trash"
              @click.stop="confirmarExclusao(holerite)"
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

const selecionados = ref<string[]>([])
const modoSelecao = ref(false)

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
  const valorTotal = holeristesFiltrados.value.reduce((sum, h) => sum + calcularSalarioLiquido(h), 0)

  return { total, gerados, enviados, valorTotal }
})

// Funções de cálculo - usa valores do banco quando disponíveis
const calcularTotalProventos = (holerite: any) => {
  // Se já existe o valor calculado no banco, usar ele
  if (holerite.total_proventos !== undefined && holerite.total_proventos !== null) {
    return holerite.total_proventos
  }
  
  // Senão, calcular dinamicamente (fallback)
  let total = holerite.salario_base || 0
  
  // Horas extras
  total += holerite.valor_horas_extras_50 || 0
  total += holerite.valor_horas_extras_100 || 0
  
  // Adicionais
  total += holerite.bonus || 0
  total += holerite.comissoes || 0
  total += holerite.adicional_insalubridade || 0
  total += holerite.adicional_periculosidade || 0
  total += holerite.adicional_noturno || 0
  total += holerite.outros_proventos || 0
  
  // Itens personalizados - proventos
  const itensPersonalizados = holerite.itens_personalizados || []
  itensPersonalizados
    .filter((item: any) => item.tipo === 'provento')
    .forEach((item: any) => {
      total += item.valor || 0
    })
  
  return total
}

const calcularTotalDescontos = (holerite: any) => {
  // Se já existe o valor calculado no banco, usar ele
  if (holerite.total_descontos !== undefined && holerite.total_descontos !== null) {
    return holerite.total_descontos
  }
  
  // Senão, calcular dinamicamente (fallback)
  let total = 0
  
  // Impostos
  total += holerite.inss || 0
  total += holerite.irrf || 0
  
  // Descontos
  total += holerite.adiantamento || 0
  total += holerite.emprestimos || 0
  total += holerite.faltas || 0
  total += holerite.atrasos || 0
  total += holerite.outros_descontos || 0
  
  // Benefícios (descontados)
  total += holerite.plano_saude || 0
  total += holerite.plano_odontologico || 0
  total += holerite.seguro_vida || 0
  total += holerite.auxilio_creche || 0
  total += holerite.auxilio_educacao || 0
  total += holerite.auxilio_combustivel || 0
  total += holerite.outros_beneficios || 0
  
  // Itens personalizados - descontos
  const itensPersonalizados = holerite.itens_personalizados || []
  itensPersonalizados
    .filter((item: any) => item.tipo === 'desconto')
    .forEach((item: any) => {
      total += item.valor || 0
    })
  
  return total
}

const calcularSalarioLiquido = (holerite: any) => {
  // Se já existe o valor calculado no banco, usar ele
  if (holerite.salario_liquido !== undefined && holerite.salario_liquido !== null) {
    return holerite.salario_liquido
  }
  
  // Senão, calcular dinamicamente (fallback)
  return calcularTotalProventos(holerite) - calcularTotalDescontos(holerite)
}

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
  const toast = useToast()
  
  try {
    await buscarHolerites()
  } catch (error: any) {
    console.error('Erro ao carregar holerites:', error)
    toast.error('Erro ao carregar', error.message || 'Não foi possível carregar os holerites.')
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
  const toast = useToast()
  
  if (!holeriteParaExcluir.value) return

  excluindo.value = true
  try {
    await excluirHoleriteAPI(holeriteParaExcluir.value.id)
    toast.success('Holerite excluído!', 'O holerite foi removido com sucesso.')
    modalExcluir.value = false
    holeriteParaExcluir.value = null
    await carregarHolerites()
  } catch (error: any) {
    console.error('Erro ao excluir holerite:', error)
    toast.error('Erro ao excluir', error.message || 'Não foi possível excluir o holerite.')
  } finally {
    excluindo.value = false
  }
}

// Funções de seleção múltipla
const ativarModoSelecao = () => {
  modoSelecao.value = true
  selecionados.value = []
}

const cancelarSelecao = () => {
  modoSelecao.value = false
  selecionados.value = []
}

const toggleSelecao = (id: string) => {
  const index = selecionados.value.indexOf(id)
  if (index > -1) {
    selecionados.value.splice(index, 1)
  } else {
    selecionados.value.push(id)
  }
}

const selecionarTodos = () => {
  selecionados.value = holeristesFiltrados.value.map(h => h.id)
}

const desmarcarTodos = () => {
  selecionados.value = []
}

const excluirSelecionados = async () => {
  const toast = useToast()
  
  if (selecionados.value.length === 0) return
  
  if (!confirm(`Deseja realmente excluir ${selecionados.value.length} holerite(s) selecionado(s)?`)) {
    return
  }
  
  excluindo.value = true
  let sucesso = 0
  let erros = 0
  
  for (const id of selecionados.value) {
    try {
      await excluirHoleriteAPI(id)
      sucesso++
    } catch (error) {
      erros++
      console.error('Erro ao excluir holerite:', id, error)
    }
  }
  
  excluindo.value = false
  
  if (erros === 0) {
    toast.success(
      'Holerites excluídos!',
      `${sucesso} holerite(s) foram removidos com sucesso.`
    )
  } else {
    toast.warning(
      'Exclusão parcial',
      `${sucesso} excluídos com sucesso, ${erros} com erro.`
    )
  }
  
  selecionados.value = []
  modoSelecao.value = false
  await carregarHolerites()
}

const confirmarExcluirTodos = async () => {
  const toast = useToast()
  
  if (holeristesFiltrados.value.length === 0) return
  
  const confirmacao = confirm(
    `⚠️ ATENÇÃO!\n\nVocê está prestes a excluir TODOS os ${holeristesFiltrados.value.length} holerite(s) filtrados.\n\nEsta ação NÃO pode ser desfeita!\n\nDeseja continuar?`
  )
  
  if (!confirmacao) return
  
  // Segunda confirmação para segurança
  const segundaConfirmacao = confirm(
    `Confirme novamente: Excluir ${holeristesFiltrados.value.length} holerite(s)?`
  )
  
  if (!segundaConfirmacao) return
  
  excluindo.value = true
  let sucesso = 0
  let erros = 0
  
  const loadingId = toast.info(
    'Excluindo holerites...',
    `Processando ${holeristesFiltrados.value.length} holerites...`,
    0
  )
  
  for (const holerite of holeristesFiltrados.value) {
    try {
      await excluirHoleriteAPI(holerite.id)
      sucesso++
    } catch (error) {
      erros++
      console.error('Erro ao excluir holerite:', holerite.id, error)
    }
  }
  
  excluindo.value = false
  toast.removeToast(loadingId)
  
  if (erros === 0) {
    toast.success(
      'Todos os holerites excluídos!',
      `${sucesso} holerite(s) foram removidos com sucesso.`
    )
  } else {
    toast.warning(
      'Exclusão parcial',
      `${sucesso} excluídos com sucesso, ${erros} com erro.`
    )
  }
  
  await carregarHolerites()
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
