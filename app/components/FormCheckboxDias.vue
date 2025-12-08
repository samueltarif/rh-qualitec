<template>
  <div class="contents">
    <label class="flex items-center gap-3">
      <input 
        type="checkbox" 
        :checked="checked" 
        @change="$emit('update:checked', ($event.target as HTMLInputElement).checked)"
        class="rounded text-red-600"
      >
      <span>{{ label }}</span>
    </label>
    <div v-if="showDias" class="flex items-center gap-2">
      <span class="text-sm text-gray-600">{{ diasLabel }}</span>
      <input 
        type="number" 
        :value="dias" 
        @input="$emit('update:dias', Number(($event.target as HTMLInputElement).value))"
        class="input w-20" 
        :min="min" 
        :max="max"
      >
      <span v-if="suffix" class="text-sm text-gray-500">{{ suffix }}</span>
    </div>
    <div v-else></div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  label: string
  checked: boolean
  dias?: number
  diasLabel?: string
  showDias?: boolean
  min?: number
  max?: number
  suffix?: string
}>()

defineEmits<{
  'update:checked': [value: boolean]
  'update:dias': [value: number]
}>()
</script>
