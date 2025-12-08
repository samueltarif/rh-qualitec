<template>
  <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
    <div class="card bg-gradient-to-br from-red-500 to-red-600 text-white">
      <div class="flex items-center gap-3">
        <Icon name="heroicons:exclamation-circle" size="32" class="opacity-80" />
        <div>
          <p class="text-2xl font-bold">{{ stats.criticos }}</p>
          <p class="text-sm opacity-80">Críticos</p>
        </div>
      </div>
    </div>
    <div class="card bg-gradient-to-br from-amber-500 to-amber-600 text-white">
      <div class="flex items-center gap-3">
        <Icon name="heroicons:exclamation-triangle" size="32" class="opacity-80" />
        <div>
          <p class="text-2xl font-bold">{{ stats.altos }}</p>
          <p class="text-sm opacity-80">Alta Prioridade</p>
        </div>
      </div>
    </div>
    <div class="card bg-gradient-to-br from-blue-500 to-blue-600 text-white">
      <div class="flex items-center gap-3">
        <Icon name="heroicons:bell" size="32" class="opacity-80" />
        <div>
          <p class="text-2xl font-bold">{{ stats.pendentes }}</p>
          <p class="text-sm opacity-80">Pendentes</p>
        </div>
      </div>
    </div>
    <div class="card bg-gradient-to-br from-green-500 to-green-600 text-white">
      <div class="flex items-center gap-3">
        <Icon name="heroicons:check-circle" size="32" class="opacity-80" />
        <div>
          <p class="text-2xl font-bold">{{ stats.resolvidos }}</p>
          <p class="text-sm opacity-80">Resolvidos</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  stats: {
    criticos: number
    altos: number
    pendentes: number
    resolvidos: number
  }
}>()
</script>
