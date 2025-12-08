<template>
  <div class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
    <div class="card">
      <div class="text-sm text-gray-600 mb-1">Enviados</div>
      <div class="text-2xl font-bold text-gray-800">{{ stats.totalEnviados }}</div>
    </div>
    <div class="card">
      <div class="text-sm text-gray-600 mb-1">Pendentes</div>
      <div class="text-2xl font-bold text-amber-600">{{ stats.totalPendentes }}</div>
    </div>
    <div class="card">
      <div class="text-sm text-gray-600 mb-1">Falhas</div>
      <div class="text-2xl font-bold text-red-600">{{ stats.totalFalhas }}</div>
    </div>
    <div class="card">
      <div class="text-sm text-gray-600 mb-1">Taxa Abertura</div>
      <div class="text-2xl font-bold text-green-600">{{ stats.taxaAbertura }}%</div>
    </div>
    <div class="card">
      <div class="text-sm text-gray-600 mb-1">Hoje</div>
      <div class="text-2xl font-bold text-blue-600">{{ stats.enviadosHoje }}</div>
    </div>
    <div class="card">
      <div class="text-sm text-gray-600 mb-1">Templates</div>
      <div class="text-2xl font-bold text-purple-600">{{ stats.totalTemplates }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  stats: {
    totalEnviados: number
    totalPendentes: number
    totalFalhas: number
    taxaAbertura: string
    enviadosHoje: number
    totalTemplates: number
  }
}>()
</script>
