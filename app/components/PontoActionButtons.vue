<template>
  <div class="flex items-center justify-center gap-1">
    <button 
      @click="$emit('edit', registro)" 
      class="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" 
      :title="editTooltip"
      :disabled="disabled"
      :class="{ 'opacity-50 cursor-not-allowed': disabled }"
    >
      <Icon name="heroicons:pencil-square" size="18" />
    </button>
    
    <button 
      @click="$emit('delete', registro)" 
      class="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" 
      :title="deleteTooltip"
      :disabled="disabled"
      :class="{ 'opacity-50 cursor-not-allowed': disabled }"
    >
      <Icon name="heroicons:trash" size="18" />
    </button>

    <!-- Botão adicional customizável -->
    <button 
      v-if="showExtraAction"
      @click="$emit('extraAction', registro)" 
      class="p-1.5 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors" 
      :title="extraActionTooltip"
      :disabled="disabled"
      :class="{ 'opacity-50 cursor-not-allowed': disabled }"
    >
      <Icon :name="extraActionIcon" size="18" />
    </button>
  </div>
</template>

<script setup lang="ts">
interface Props {
  registro: any
  disabled?: boolean
  editTooltip?: string
  deleteTooltip?: string
  showExtraAction?: boolean
  extraActionIcon?: string
  extraActionTooltip?: string
}

withDefaults(defineProps<Props>(), {
  disabled: false,
  editTooltip: 'Editar registro',
  deleteTooltip: 'Excluir registro',
  showExtraAction: false,
  extraActionIcon: 'heroicons:eye',
  extraActionTooltip: 'Ação adicional'
})

defineEmits<{
  edit: [registro: any]
  delete: [registro: any]
  extraAction: [registro: any]
}>()
</script>