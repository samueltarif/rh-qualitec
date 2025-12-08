<template>
  <div class="card bg-gradient-to-br from-purple-50 to-blue-50 border-2 border-purple-200 sticky top-4">
    <h4 class="text-sm font-semibold text-purple-800 mb-4 flex items-center gap-2">
      <Icon name="heroicons:document-text" size="18" />
      Resumo do Holerite
    </h4>
    <div class="space-y-3 text-sm">
      <div class="flex justify-between items-center pb-2 border-b border-purple-200">
        <span class="text-gray-600">Salário Base</span>
        <span class="font-semibold text-gray-800">{{ formatCurrency(resumo.salario_base) }}</span>
      </div>
      <div class="flex justify-between items-center text-green-700">
        <span>+ Total Proventos</span>
        <span class="font-semibold">{{ formatCurrency(resumo.total_proventos) }}</span>
      </div>
      <div class="flex justify-between items-center pb-2 border-b border-purple-200 font-medium">
        <span class="text-gray-700">= Salário Bruto</span>
        <span class="text-gray-800">{{ formatCurrency(resumo.salario_bruto) }}</span>
      </div>
      <div class="flex justify-between items-center text-blue-700">
        <span>- INSS</span>
        <span class="font-semibold">{{ formatCurrency(resumo.inss) }}</span>
      </div>
      <div class="flex justify-between items-center text-purple-700">
        <span>- IRRF</span>
        <span class="font-semibold">{{ formatCurrency(resumo.irrf) }}</span>
      </div>
      <div class="flex justify-between items-center text-red-700">
        <span>- Outros Descontos</span>
        <span class="font-semibold">{{ formatCurrency(resumo.outros_descontos) }}</span>
      </div>
      <div class="flex justify-between items-center pb-2 border-b-2 border-purple-300 font-medium text-red-700">
        <span>= Total Descontos</span>
        <span>{{ formatCurrency(resumo.total_descontos) }}</span>
      </div>
      <div class="flex justify-between items-center pt-2 text-lg font-bold">
        <span class="text-gray-800">💰 Salário Líquido</span>
        <span class="text-green-700">{{ formatCurrency(resumo.salario_liquido) }}</span>
      </div>
      <div class="mt-4 pt-3 border-t border-purple-200 space-y-2">
        <div class="flex justify-between items-center text-green-600">
          <span>🏦 FGTS (8% - Empresa)</span>
          <span class="font-semibold">{{ formatCurrency(resumo.fgts) }}</span>
        </div>
        <div v-if="resumo.total_beneficios > 0" class="flex justify-between items-center text-amber-600">
          <span>🎁 Total Benefícios</span>
          <span class="font-semibold">{{ formatCurrency(resumo.total_beneficios) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Resumo {
  salario_base: number
  total_proventos: number
  salario_bruto: number
  inss: number
  irrf: number
  outros_descontos: number
  total_descontos: number
  salario_liquido: number
  fgts: number
  total_beneficios: number
}

const props = withDefaults(defineProps<{
  resumo: Resumo
}>(), {
  resumo: () => ({
    salario_base: 0,
    total_proventos: 0,
    salario_bruto: 0,
    inss: 0,
    irrf: 0,
    outros_descontos: 0,
    total_descontos: 0,
    salario_liquido: 0,
    fgts: 0,
    total_beneficios: 0,
  })
})

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value || 0)
}
</script>
