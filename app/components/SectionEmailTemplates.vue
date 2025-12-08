<template>
  <div class="space-y-6">
    <div class="flex justify-between items-center mb-4">
      <div>
        <h2 class="text-xl font-semibold">Templates de E-mail</h2>
        <p class="text-sm text-gray-600">Gerencie templates reutilizáveis</p>
      </div>
      <button @click="$emit('novo')" class="btn-primary">
        <Icon name="mdi:plus" class="mr-2" />
        Novo Template
      </button>
    </div>

    <div class="grid grid-cols-1 gap-4">
      <div v-for="template in templates" :key="template.id" class="card hover:shadow-lg transition-shadow">
        <div class="flex justify-between items-start">
          <div class="flex-1">
            <div class="flex items-center gap-2 mb-2">
              <h3 class="text-lg font-semibold">{{ template.nome }}</h3>
              <span v-if="template.sistema" class="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded">Sistema</span>
              <span v-if="!template.ativo" class="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">Inativo</span>
            </div>
            <p class="text-sm text-gray-600 mb-2">{{ template.descricao }}</p>
            <div class="flex items-center gap-4 text-xs text-gray-500">
              <span><Icon name="mdi:tag" class="inline" /> {{ template.categoria }}</span>
              <span><Icon name="mdi:email-send" class="inline" /> {{ template.total_enviados }} enviados</span>
              <span v-if="template.total_enviados > 0">
                <Icon name="mdi:email-open" class="inline" />
                {{ ((template.total_abertos / template.total_enviados) * 100).toFixed(1) }}% abertos
              </span>
            </div>
          </div>
          <div class="flex gap-2">
            <button @click="$emit('editar', template)" class="btn-icon" title="Editar">
              <Icon name="mdi:pencil" />
            </button>
            <button v-if="!template.sistema" @click="$emit('excluir', template.id)" class="btn-icon text-red-600 hover:bg-red-50" title="Excluir">
              <Icon name="mdi:delete" />
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  templates: any[]
}>()

defineEmits<{
  novo: []
  editar: [template: any]
  excluir: [id: string]
}>()
</script>
