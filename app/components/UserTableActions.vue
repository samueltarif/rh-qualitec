<template>
  <div class="flex items-center justify-end gap-2">
    <!-- Botão Ativar/Desativar -->
    <button
      @click="$emit('toggle-status')"
      class="p-2 hover:bg-gray-100 rounded-lg transition-colors"
      :title="isActive ? 'Desativar' : 'Ativar'"
    >
      <Icon 
        :name="isActive ? 'heroicons:no-symbol' : 'heroicons:check-circle'" 
        :class="isActive ? 'text-red-600' : 'text-green-600'"
        size="20"
      />
    </button>

    <!-- Botão Editar -->
    <button
      @click="$emit('edit')"
      class="p-2 hover:bg-gray-100 rounded-lg transition-colors"
      title="Editar"
    >
      <Icon name="heroicons:pencil" class="text-blue-600" size="20" />
    </button>
  </div>
</template>

<script setup lang="ts">
interface Props {
  isActive: boolean
}

defineProps<Props>()

defineEmits<{
  'toggle-status': []
  'edit': []
}>()
</script>
