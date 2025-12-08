<template>
  <div class="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow">
    <div class="flex items-start justify-between mb-3">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
          <Icon name="heroicons:calendar" class="text-amber-600" size="20" />
        </div>
        <div>
          <h4 class="font-semibold text-gray-800">{{ colaboradorNome }}</h4>
          <p class="text-sm text-gray-500">{{ formatDate(periodo.data_inicio) }} a {{ formatDate(periodo.data_fim) }}</p>
        </div>
      </div>
      <UIBadge :variant="statusVariant">{{ statusLabel }}</UIBadge>
    </div>

    <div class="grid grid-cols-3 gap-4 mb-4">
      <div class="text-center p-2 bg-gray-50 rounded-lg">
        <p class="text-xs text-gray-500">Direito</p>
        <p class="text-lg font-bold text-gray-800">{{ periodo.dias_direito }}</p>
      </div>
      <div class="text-center p-2 bg-green-50 rounded-lg">
        <p class="text-xs text-gray-500">Gozados</p>
        <p class="text-lg font-bold text-green-600">{{ periodo.dias_gozados }}</p>
      </div>
      <div class="text-center p-2 bg-blue-50 rounded-lg">
        <p class="text-xs text-gray-500">Saldo</p>
        <p class="text-lg font-bold text-blue-600">{{ periodo.dias_saldo }}</p>
      </div>
    </div>

    <!-- Barra de progresso -->
    <div class="mb-3">
      <div class="flex justify-between text-xs text-gray-500 mb-1">
        <span>Utilização</span>
        <span>{{ percentualUtilizado }}%</span>
      </div>
      <div class="h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          class="h-full rounded-full transition-all"
          :class="percentualUtilizado > 80 ? 'bg-red-500' : percentualUtilizado > 50 ? 'bg-amber-500' : 'bg-green-500'"
          :style="{ width: `${percentualUtilizado}%` }"
        ></div>
      </div>
    </div>

    <!-- Limite de gozo -->
    <div v-if="periodo.data_limite_gozo" class="flex items-center gap-2 text-sm" :class="limiteProximo ? 'text-red-600' : 'text-gray-500'">
      <Icon :name="limiteProximo ? 'heroicons:exclamation-triangle' : 'heroicons:clock'" size="16" />
      <span>Limite: {{ formatDate(periodo.data_limite_gozo) }}</span>
    </div>

    <!-- Ações -->
    <div v-if="showActions" class="flex gap-2 mt-4 pt-4 border-t border-gray-100">
      <UIButton theme="admin" variant="outline" size="sm" full-width @click="$emit('solicitar', periodo)">
        <Icon name="heroicons:plus" size="16" class="mr-1" />
        Solicitar
      </UIButton>
      <UIButton theme="admin" variant="ghost" size="sm" @click="$emit('detalhes', periodo)">
        <Icon name="heroicons:eye" size="16" />
      </UIButton>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Periodo {
  id: string
  data_inicio: string
  data_fim: string
  dias_direito: number
  dias_gozados: number
  dias_vendidos: number
  dias_saldo: number
  status: string
  data_limite_gozo: string
}

interface Props {
  periodo: Periodo
  colaboradorNome?: string
  showActions?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  colaboradorNome: '',
  showActions: true,
})

defineEmits<{
  'solicitar': [periodo: Periodo]
  'detalhes': [periodo: Periodo]
}>()

const statusVariant = computed(() => {
  const variants: Record<string, 'default' | 'success' | 'warning' | 'danger' | 'info'> = {
    em_aquisicao: 'info',
    adquirido: 'success',
    vencido: 'danger',
    gozado: 'default',
  }
  return variants[props.periodo.status] || 'default'
})

const statusLabel = computed(() => {
  const labels: Record<string, string> = {
    em_aquisicao: 'Em Aquisição',
    adquirido: 'Adquirido',
    vencido: 'Vencido',
    gozado: 'Gozado',
  }
  return labels[props.periodo.status] || props.periodo.status
})

const percentualUtilizado = computed(() => {
  const utilizado = props.periodo.dias_gozados + props.periodo.dias_vendidos
  return Math.round((utilizado / props.periodo.dias_direito) * 100)
})

const limiteProximo = computed(() => {
  if (!props.periodo.data_limite_gozo) return false
  const limite = new Date(props.periodo.data_limite_gozo)
  const hoje = new Date()
  const diffDias = Math.ceil((limite.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24))
  return diffDias <= 60
})

const formatDate = (date: string) => {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('pt-BR')
}
</script>
