<template>
  <div class="w-full">
    <label v-if="label" class="block text-sm font-medium text-gray-700 mb-1">
      {{ label }}
      <span v-if="required" class="text-red-500">*</span>
    </label>
    <select
      :value="modelValue"
      @input="$emit('update:modelValue', ($event.target as HTMLSelectElement).value)"
      :disabled="disabled"
      :required="required"
      class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
    >
      <slot />
    </select>
    <p v-if="error" class="mt-1 text-sm text-red-600">{{ error }}</p>
    <p v-else-if="description" class="mt-1 text-sm text-gray-500">{{ description }}</p>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  modelValue?: string | number
  label?: string
  error?: string
  description?: string
  disabled?: boolean
  required?: boolean
}>()

defineEmits<{
  'update:modelValue': [value: string]
}>()
</script>
