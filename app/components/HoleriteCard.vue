<template>
  <div class="bg-white rounded-xl border-2 border-gray-200 hover:border-blue-400 transition-all group">
    <div class="p-6">
      <!-- Header -->
      <div class="flex items-center justify-between mb-4">
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
            <Icon name="heroicons:document-text" class="text-blue-600" size="24" />
          </div>
          <div>
            <p class="font-bold text-gray-800">{{ nomeMes(holerite.mes) }}</p>
            <p class="text-sm text-gray-500">{{ holerite.ano }}</p>
          </div>
        </div>
        <UIBadge :color="getStatusColor(holerite.status)">
          {{ getStatusLabel(holerite.status) }}
        </UIBadge>
      </div>

      <!-- Colaborador -->
      <div class="mb-4">
        <p class="text-sm text-gray-500">Colaborador</p>
        <p class="font-semibold text-gray-800">{{ holerite.nome_colaborador }}</p>
      </div>

      <!-- Valores -->
      <div class="space-y-2 mb-4">
        <div class="flex justify-between text-sm">
          <span class="text-gray-600">Salário Bruto</span>
          <span class="font-semibold text-gray-800">{{ formatCurrency(holerite.salario_bruto) }}</span>
        </div>
        <div class="flex justify-between text-sm">
          <span class="text-gray-600">Descontos</span>
          <span class="font-semibold text-red-600">-{{ formatCurrency(holerite.total_descontos) }}</span>
        </div>
        <div class="flex justify-between pt-2 border-t">
          <span class="font-bold text-gray-800">Líquido</span>
          <span class="font-bold text-green-600">{{ formatCurrency(holerite.salario_liquido) }}</span>
        </div>
      </div>

      <!-- Tipo -->
      <div v-if="holerite.tipo === 'decimo_terceiro'" class="mb-4">
        <UIBadge color="purple">
          13º Salário - {{ holerite.parcela_13 }}ª Parcela
        </UIBadge>
      </div>

      <!-- Ações -->
      <div class="flex gap-2">
        <UIButton
          variant="secondary"
          size="sm"
          icon-left="heroicons:eye"
          @click="$emit('visualizar', holerite)"
          class="flex-1"
        >
          Visualizar
        </UIButton>
        
        <UIButton
          v-if="showDelete && holerite.status === 'gerado'"
          variant="danger"
          size="sm"
          icon-left="heroicons:trash"
          @click="$emit('excluir', holerite)"
        >
          Excluir
        </UIButton>
      </div>
    </div>
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
  holerite: Holerite
  showDelete?: boolean
}

defineProps<Props>()
defineEmits(['visualizar', 'excluir'])

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

const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    gerado: 'blue',
    enviado: 'green',
    pago: 'purple',
    cancelado: 'red'
  }
  return colors[status] || 'gray'
}

const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    gerado: 'Gerado',
    enviado: 'Enviado',
    pago: 'Pago',
    cancelado: 'Cancelado'
  }
  return labels[status] || status
}
</script>
