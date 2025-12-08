<template>
  <div class="grid md:grid-cols-4 gap-6 mb-8">
    <div class="card bg-blue-50 border-2 border-blue-200">
      <div class="flex items-center gap-4">
        <div class="w-12 h-12 bg-blue-700 rounded-lg flex items-center justify-center">
          <Icon name="heroicons:users" class="text-white" size="24" />
        </div>
        <div>
          <p class="text-sm text-gray-600">Colaboradores</p>
          <p class="text-2xl font-bold text-gray-800">{{ totais.total_colaboradores }}</p>
        </div>
      </div>
    </div>

    <div class="card bg-green-50 border-2 border-green-200">
      <div class="flex items-center gap-4">
        <div class="w-12 h-12 bg-green-700 rounded-lg flex items-center justify-center">
          <Icon name="heroicons:banknotes" class="text-white" size="24" />
        </div>
        <div>
          <p class="text-sm text-gray-600">Salário Bruto</p>
          <p class="text-xl font-bold text-gray-800">{{ formatCurrency(totais.total_salario_bruto) }}</p>
        </div>
      </div>
    </div>

    <div class="card bg-red-50 border-2 border-red-200">
      <div class="flex items-center gap-4">
        <div class="w-12 h-12 bg-red-700 rounded-lg flex items-center justify-center">
          <Icon name="heroicons:minus-circle" class="text-white" size="24" />
        </div>
        <div>
          <p class="text-sm text-gray-600">Total Descontos</p>
          <p class="text-xl font-bold text-gray-800">{{ formatCurrency(totais.total_descontos) }}</p>
        </div>
      </div>
    </div>

    <div class="card bg-purple-50 border-2 border-purple-200">
      <div class="flex items-center gap-4">
        <div class="w-12 h-12 bg-purple-700 rounded-lg flex items-center justify-center">
          <Icon name="heroicons:check-circle" class="text-white" size="24" />
        </div>
        <div>
          <p class="text-sm text-gray-600">Salário Líquido</p>
          <p class="text-xl font-bold text-gray-800">{{ formatCurrency(totais.total_salario_liquido) }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Totais {
  total_colaboradores: number
  total_salario_bruto: number
  total_descontos: number
  total_salario_liquido: number
}

defineProps<{
  totais: Totais
}>()

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}
</script>
