<template>
  <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
    <UiCard padding="p-4">
      <p class="text-sm text-gray-500">Total Bruto</p>
      <p class="text-2xl font-bold text-gray-800">{{ formatarMoeda(totalBruto) }}</p>
    </UiCard>
    <UiCard padding="p-4">
      <p class="text-sm text-gray-500">Total INSS</p>
      <p class="text-2xl font-bold text-red-600">{{ formatarMoeda(totalINSS) }}</p>
    </UiCard>
    <UiCard padding="p-4">
      <p class="text-sm text-gray-500">Total IRRF</p>
      <p class="text-2xl font-bold text-red-600">{{ formatarMoeda(totalIRRF) }}</p>
    </UiCard>
    <UiCard padding="p-4">
      <p class="text-sm text-gray-500">Total Líquido</p>
      <p class="text-2xl font-bold text-green-600">{{ formatarMoeda(totalLiquido) }}</p>
    </UiCard>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  totalBruto: number
  totalINSS: number
  totalIRRF: number
  totalLiquido: number
}>()

const formatarMoeda = (valor: number) => valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
</script>
