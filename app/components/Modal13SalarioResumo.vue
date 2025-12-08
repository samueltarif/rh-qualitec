<template>
  <div class="card bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-200">
    <div class="grid md:grid-cols-3 gap-4">
      <div>
        <p class="text-sm text-gray-600">Colaboradores Selecionados</p>
        <p class="text-2xl font-bold text-gray-800">{{ totalSelecionados }}</p>
      </div>
      <div>
        <p class="text-sm text-gray-600">Total em 13º Salário</p>
        <p class="text-2xl font-bold text-green-700">{{ formatCurrency(valorTotal) }}</p>
      </div>
      <div>
        <p class="text-sm text-gray-600">Parcela</p>
        <p class="text-2xl font-bold text-blue-700">
          {{ parcelaTexto }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  totalSelecionados: number
  valorTotal: number
  parcela: string
}>()

const parcelaTexto = computed(() => {
  if (props.parcela === '1') return '1ª'
  if (props.parcela === '2') return '2ª'
  if (props.parcela === 'completo') return 'Completo'
  return 'Integral'
})

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}
</script>
