<template>
  <div class="space-y-4">
    <!-- Ações em Massa -->
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-3">
        <UICheckbox 
          :model-value="todosSelecionados"
          @update:model-value="$emit('toggle-todos')"
          label="Selecionar Todos"
        />
        <span class="text-sm text-gray-600">
          {{ totalSelecionados }} de {{ totalColaboradores }} selecionados
        </span>
      </div>
      <UIButton 
        theme="admin" 
        variant="secondary" 
        size="sm"
        icon-left="heroicons:funnel"
        @click="$emit('toggle-filtros')"
      >
        Filtros
      </UIButton>
    </div>

    <!-- Filtros Avançados -->
    <div v-if="mostrarFiltros" class="card bg-gray-50">
      <div class="grid md:grid-cols-2 gap-3">
        <UISearchInput 
          :model-value="busca"
          @update:model-value="$emit('update:busca', $event)"
          placeholder="Buscar por nome ou CPF..."
        />
        <select 
          :value="filtroStatus" 
          @change="$emit('update:filtroStatus', ($event.target as HTMLSelectElement).value)"
          class="px-3 py-2 border border-gray-300 rounded-lg"
        >
          <option value="">Todos os Status</option>
          <option value="Ativo">Ativo</option>
          <option value="Ferias">Férias</option>
          <option value="Afastado">Afastado</option>
        </select>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  todosSelecionados: boolean
  totalSelecionados: number
  totalColaboradores: number
  mostrarFiltros: boolean
  busca: string
  filtroStatus: string
}>()

defineEmits<{
  'toggle-todos': []
  'toggle-filtros': []
  'update:busca': [value: string]
  'update:filtroStatus': [value: string]
}>()
</script>
