<template>
  <UIModal
    :model-value="show"
    title="💰 Gerar Adiantamento Salarial"
    size="lg"
    @update:model-value="(val) => !val && $emit('close')"
  >
    <div class="space-y-6">
      <!-- Informações -->
      <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div class="flex items-start gap-3">
          <div class="text-blue-600 text-xl">ℹ️</div>
          <div class="flex-1 text-sm text-blue-800">
            <p class="font-semibold mb-2">Como funciona o adiantamento:</p>
            <ul class="space-y-1 list-disc list-inside">
              <li>Valor: <strong>{{ percentual }}%</strong> do salário bruto</li>
              <li>Pagamento: Dia <strong>{{ diaPagamento }}</strong> do mês</li>
              <li><strong>Sem descontos</strong> de INSS, IRRF ou benefícios</li>
              <li>Será <strong>descontado automaticamente</strong> no holerite do dia 5</li>
            </ul>
          </div>
        </div>
      </div>

      <!-- Seleção de Período -->
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Mês
          </label>
          <select
            v-model="form.mes"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option v-for="m in meses" :key="m.value" :value="m.value">
              {{ m.label }}
            </option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Ano
          </label>
          <select
            v-model="form.ano"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option v-for="a in anos" :key="a" :value="a">
              {{ a }}
            </option>
          </select>
        </div>
      </div>

      <!-- Seleção de Colaboradores -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">
          Colaboradores
        </label>
        <div class="space-y-2 max-h-64 overflow-y-auto border border-gray-200 rounded-lg p-3">
          <label class="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer">
            <input
              type="checkbox"
              :checked="todosColaboradoresSelecionados"
              @change="toggleTodosColaboradores"
              class="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
            />
            <span class="font-medium text-gray-900">Todos os colaboradores</span>
          </label>
          <div class="border-t border-gray-200 my-2"></div>
          <label
            v-for="colab in colaboradores"
            :key="colab.id"
            class="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer"
          >
            <input
              type="checkbox"
              :value="colab.id"
              v-model="form.colaborador_ids"
              class="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
            />
            <div class="flex-1">
              <div class="font-medium text-gray-900">{{ colab.nome }}</div>
              <div class="text-xs text-gray-500">
                {{ colab.cargo?.nome || 'Sem cargo' }} • 
                Salário: R$ {{ formatarMoeda(colab.salario) }} • 
                Adiantamento: R$ {{ calcularAdiantamento(colab.salario) }}
              </div>
            </div>
          </label>
        </div>
      </div>

      <!-- Resumo -->
      <div v-if="form.colaborador_ids.length > 0" class="bg-gray-50 rounded-lg p-4">
        <h4 class="font-semibold text-gray-900 mb-3">📊 Resumo</h4>
        <div class="grid grid-cols-2 gap-4 text-sm">
          <div>
            <div class="text-gray-600">Colaboradores selecionados</div>
            <div class="text-lg font-bold text-gray-900">{{ form.colaborador_ids.length }}</div>
          </div>
          <div>
            <div class="text-gray-600">Valor total estimado</div>
            <div class="text-lg font-bold text-green-600">R$ {{ calcularTotalEstimado() }}</div>
          </div>
        </div>
      </div>

      <!-- Aviso -->
      <div class="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <div class="flex items-start gap-3">
          <div class="text-amber-600 text-xl">⚠️</div>
          <div class="flex-1 text-sm text-amber-800">
            <p class="font-semibold mb-1">Atenção:</p>
            <p>
              Os adiantamentos gerados serão automaticamente descontados nos holerites mensais.
              Certifique-se de gerar os holerites do dia 5 após o pagamento dos adiantamentos.
            </p>
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="flex justify-end gap-3">
        <button
          @click="$emit('close')"
          class="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          :disabled="loading"
        >
          Cancelar
        </button>
        <button
          @click="gerarAdiantamentos"
          :disabled="loading || form.colaborador_ids.length === 0"
          class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          <span v-if="loading" class="animate-spin">⏳</span>
          <span v-else>💰</span>
          {{ loading ? 'Gerando...' : 'Gerar Adiantamentos' }}
        </button>
      </div>
    </template>
  </UIModal>
</template>

<script setup lang="ts">
const props = defineProps<{
  show: boolean
  colaboradores: any[]
  percentual: number
  diaPagamento: number
}>()

const emit = defineEmits(['close', 'success'])

const mesAtual = new Date().getMonth() + 1
const anoAtual = new Date().getFullYear()

const form = ref({
  mes: mesAtual,
  ano: anoAtual,
  colaborador_ids: [] as number[],
})

const loading = ref(false)

const meses = [
  { value: 1, label: 'Janeiro' },
  { value: 2, label: 'Fevereiro' },
  { value: 3, label: 'Março' },
  { value: 4, label: 'Abril' },
  { value: 5, label: 'Maio' },
  { value: 6, label: 'Junho' },
  { value: 7, label: 'Julho' },
  { value: 8, label: 'Agosto' },
  { value: 9, label: 'Setembro' },
  { value: 10, label: 'Outubro' },
  { value: 11, label: 'Novembro' },
  { value: 12, label: 'Dezembro' },
]

const anos = computed(() => {
  const anos = []
  for (let i = anoAtual - 1; i <= anoAtual + 1; i++) {
    anos.push(i)
  }
  return anos
})

const todosColaboradoresSelecionados = computed(() => {
  return form.value.colaborador_ids.length === props.colaboradores.length
})

const toggleTodosColaboradores = () => {
  if (todosColaboradoresSelecionados.value) {
    form.value.colaborador_ids = []
  } else {
    form.value.colaborador_ids = props.colaboradores.map(c => c.id)
  }
}

const formatarMoeda = (valor: number) => {
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(valor || 0)
}

const calcularAdiantamento = (salario: number) => {
  const valor = (salario * props.percentual) / 100
  return formatarMoeda(valor)
}

const calcularTotalEstimado = () => {
  const total = props.colaboradores
    .filter(c => form.value.colaborador_ids.includes(c.id))
    .reduce((sum, c) => sum + ((c.salario * props.percentual) / 100), 0)
  return formatarMoeda(total)
}

const gerarAdiantamentos = async () => {
  if (form.value.colaborador_ids.length === 0) {
    alert('Selecione pelo menos um colaborador')
    return
  }

  if (!confirm(`Confirma a geração de ${form.value.colaborador_ids.length} adiantamento(s)?`)) {
    return
  }

  loading.value = true

  try {
    const { data, error } = await useFetch('/api/adiantamento/gerar', {
      method: 'POST',
      body: {
        mes: form.value.mes,
        ano: form.value.ano,
        colaborador_ids: form.value.colaborador_ids,
      },
    })

    if (error.value) {
      throw new Error(error.value.message || 'Erro ao gerar adiantamentos')
    }

    const resultado = data.value as any

    if (resultado.success) {
      alert(`✅ Sucesso!\n\n${resultado.data.total_gerados} adiantamento(s) gerado(s)${resultado.data.total_erros > 0 ? `\n${resultado.data.total_erros} erro(s)` : ''}`)
      emit('success')
      emit('close')
    }
  } catch (error: any) {
    console.error('Erro ao gerar adiantamentos:', error)
    alert(`❌ Erro: ${error.message}`)
  } finally {
    loading.value = false
  }
}

// Resetar form ao abrir
watch(() => props.show, (newVal) => {
  if (newVal) {
    form.value.mes = mesAtual
    form.value.ano = anoAtual
    form.value.colaborador_ids = []
  }
})
</script>
