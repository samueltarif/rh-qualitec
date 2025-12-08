<template>
  <div class="grid md:grid-cols-4 gap-6 mb-8">
    <div class="card bg-red-50 border-2 border-red-200">
      <div class="flex items-center gap-4">
        <div class="w-12 h-12 bg-red-700 rounded-lg flex items-center justify-center">
          <Icon name="heroicons:document-text" class="text-white" size="24" />
        </div>
        <div>
          <p class="text-sm text-gray-600">Total</p>
          <p class="text-2xl font-bold text-gray-800">{{ stats.total }}</p>
        </div>
      </div>
    </div>
    <div class="card">
      <div class="flex items-center gap-4">
        <div class="w-12 h-12 bg-yellow-600 rounded-lg flex items-center justify-center">
          <Icon name="heroicons:clock" class="text-white" size="24" />
        </div>
        <div>
          <p class="text-sm text-gray-600">Pendentes</p>
          <p class="text-2xl font-bold text-gray-800">{{ stats.pendente }}</p>
        </div>
      </div>
    </div>
    <div class="card">
      <div class="flex items-center gap-4">
        <div class="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center">
          <Icon name="heroicons:check-circle" class="text-white" size="24" />
        </div>
        <div>
          <p class="text-sm text-gray-600">Aprovados</p>
          <p class="text-2xl font-bold text-gray-800">{{ stats.aprovado }}</p>
        </div>
      </div>
    </div>
    <div class="card">
      <div class="flex items-center gap-4">
        <div class="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
          <Icon name="heroicons:calendar" class="text-white" size="24" />
        </div>
        <div>
          <p class="text-sm text-gray-600">Este Mês</p>
          <p class="text-2xl font-bold text-gray-800">{{ stats.esteMes }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  stats: { total: number; pendente: number; aprovado: number; esteMes: number }
}>()
</script>
