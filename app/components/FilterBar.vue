<template>
  <div class="flex items-center space-x-4 bg-white p-4 rounded-lg shadow-sm border border-gray-200">
    <div class="flex items-center space-x-2">
      <label class="text-sm font-medium text-gray-700">Mês:</label>
      <select 
        :value="mes"
        @change="$emit('update:mes', ($event.target as HTMLSelectElement).value)"
        class="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
      >
        <option v-for="m in meses" :key="m.value" :value="m.value">
          {{ m.label }}
        </option>
      </select>
    </div>

    <div class="flex items-center space-x-2">
      <label class="text-sm font-medium text-gray-700">Ano:</label>
      <select 
        :value="ano"
        @change="$emit('update:ano', ($event.target as HTMLSelectElement).value)"
        class="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
      >
        <option v-for="a in anos" :key="a" :value="a">
          {{ a }}
        </option>
      </select>
    </div>

    <button
      @click="$emit('buscar')"
      class="bg-gray-800 hover:bg-gray-900 text-white px-6 py-2 rounded-md text-sm font-medium transition-colors flex items-center space-x-2"
    >
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
      <span>Buscar</span>
    </button>
  </div>
</template>

<script setup lang="ts">
interface Props {
  mes: string
  ano: string
  meses?: Array<{ value: string; label: string }>
  anos?: string[]
}

const props = withDefaults(defineProps<Props>(), {
  meses: () => [
    { value: '1', label: 'Janeiro' },
    { value: '2', label: 'Fevereiro' },
    { value: '3', label: 'Março' },
    { value: '4', label: 'Abril' },
    { value: '5', label: 'Maio' },
    { value: '6', label: 'Junho' },
    { value: '7', label: 'Julho' },
    { value: '8', label: 'Agosto' },
    { value: '9', label: 'Setembro' },
    { value: '10', label: 'Outubro' },
    { value: '11', label: 'Novembro' },
    { value: '12', label: 'Dezembro' }
  ],
  anos: () => ['2023', '2024', '2025']
})

defineEmits<{
  'update:mes': [value: string]
  'update:ano': [value: string]
  'buscar': []
}>()
</script>
