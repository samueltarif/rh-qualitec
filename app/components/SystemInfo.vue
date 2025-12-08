<template>
  <div class="card bg-gradient-to-br from-gray-50 to-gray-100">
    <h3 class="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
      <Icon name="heroicons:information-circle" class="text-gray-600" size="24" />
      Informações do Sistema
    </h3>
    <div class="grid md:grid-cols-3 gap-6">
      <div>
        <p class="text-sm text-gray-600 mb-1">Versão do Sistema</p>
        <p class="text-lg font-semibold text-gray-800">{{ version }}</p>
      </div>
      <div>
        <p class="text-sm text-gray-600 mb-1">Última Atualização</p>
        <p class="text-lg font-semibold text-gray-800">{{ lastUpdate }}</p>
      </div>
      <div>
        <p class="text-sm text-gray-600 mb-1">Ambiente</p>
        <p class="text-lg font-semibold text-gray-800">{{ environment }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  version?: string
  environment?: string
}

const props = withDefaults(defineProps<Props>(), {
  version: 'v1.0.0',
  environment: 'Produção'
})

const lastUpdate = computed(() => {
  return new Date().toLocaleDateString('pt-BR')
})
</script>
