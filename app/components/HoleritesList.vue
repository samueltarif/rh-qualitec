<template>
  <div class="space-y-6">
    <!-- Filtros -->
    <div class="bg-white rounded-xl border-2 border-gray-200 p-6">
      <div class="grid md:grid-cols-4 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Mês</label>
          <select v-model="filtros.mes" class="w-full px-4 py-2 border border-gray-300 rounded-lg">
            <option value="">Todos</option>
            <option v-for="m in 12" :key="m" :value="m">{{ nomeMesCompleto(m) }}</option>
          </select>
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Ano</label>
          <select v-model="filtros.ano" class="w-full px-4 py-2 border border-gray-300 rounded-lg">
            <option value="">Todos</option>
            <option v-for="a in anos" :key="a" :value="a">{{ a }}</option>
          </select>
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Status</label>
          <select v-model="filtros.status" class="w-full px-4 py-2 border border-gray-300 rounded-lg">
            <option value="">Todos</option>
            <option value="gerado">Gerado</option>
            <option value="enviado">Enviado</option>
            <option value="pago">Pago</option>
          </select>
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Tipo</label>
          <select v-model="filtros.tipo" class="w-full px-4 py-2 border border-gray-300 rounded-lg">
            <option value="">Todos</option>
            <option value="mensal">Mensal</option>
            <option value="decimo_terceiro">13º Salário</option>
          </select>
        </div>
      </div>
      
      <div class="mt-4 flex gap-2">
        <UIButton @click="aplicarFiltros" icon-left="heroicons:funnel">
          Filtrar
        </UIButton>
        <UIButton variant="secondary" @click="limparFiltros" icon-left="heroicons:x-mark">
          Limpar
        </UIButton>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="text-center py-12">
      <Icon name="heroicons:arrow-path" class="animate-spin text-gray-400 mx-auto mb-4" size="48" />
      <p class="text-gray-600">Carregando holerites...</p>
    </div>

    <!-- Lista -->
    <div v-else-if="holeristesFiltrados.length > 0" class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      <HoleriteCard
        v-for="holerite in holeristesFiltrados"
        :key="holerite.id"
        :holerite="holerite"
        :show-delete="showDelete"
        @visualizar="$emit('visualizar', $event)"
        @excluir="$emit('excluir', $event)"
      />
    </div>

    <!-- Empty State -->
    <UIEmptyState
      v-else
      icon="heroicons:document-text"
      title="Nenhum holerite encontrado"
      description="Não há holerites para os filtros selecionados"
    />
  </div>
</template>

<script setup lang="ts">
interface Holerite {
  id: string
  mes: number
  ano: number
  nome_colaborador: string
  salario_bruto: number
  total_descontos: number
  salario_liquido: number
  status: string
  tipo?: string
  parcela_13?: string
}

interface Props {
  holerites: Holerite[]
  loading?: boolean
  showDelete?: boolean
}

const props = defineProps<Props>()
defineEmits(['visualizar', 'excluir'])

const filtros = ref({
  mes: '',
  ano: '',
  status: '',
  tipo: ''
})

const anoAtual = new Date().getFullYear()
const anos = computed(() => {
  return Array.from({ length: 5 }, (_, i) => anoAtual - i)
})

const holeristesFiltrados = computed(() => {
  let resultado = [...props.holerites]
  
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

const nomeMesCompleto = (mes: number) => {
  const meses = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ]
  return meses[mes - 1]
}

const aplicarFiltros = () => {
  // Filtros são aplicados automaticamente via computed
}

const limparFiltros = () => {
  filtros.value = {
    mes: '',
    ano: '',
    status: '',
    tipo: ''
  }
}
</script>
