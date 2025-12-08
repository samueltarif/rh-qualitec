<template>
  <div class="w-full">
    <label v-if="label" class="block text-sm font-medium text-gray-700 mb-1">
      {{ label }}
      <span v-if="required" class="text-red-500">*</span>
    </label>
    <input
      :type="type"
      :value="modelValue"
      @input="handleInput"
      :placeholder="placeholder"
      :disabled="disabled"
      :required="required"
      :min="min"
      :max="max"
      :step="step"
      :class="[
        'w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed',
        shouldUppercase ? 'uppercase' : ''
      ]"
    />
    <p v-if="error" class="mt-1 text-sm text-red-600">{{ error }}</p>
    <p v-else-if="description" class="mt-1 text-sm text-gray-500">{{ description }}</p>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  modelValue?: string | number
  type?: string
  label?: string
  placeholder?: string
  error?: string
  description?: string
  disabled?: boolean
  required?: boolean
  min?: number
  max?: number
  step?: number
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string | number]
}>()

// Determina se deve aplicar uppercase (todos os campos de texto exceto email)
const shouldUppercase = computed(() => {
  const textTypes = ['text', 'tel', undefined]
  return textTypes.includes(props.type)
})

const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  let value: string | number = target.value
  
  // Converte para maiúsculas se for campo de texto (exceto email)
  if (shouldUppercase.value && typeof value === 'string') {
    value = value.toUpperCase()
  }
  
  emit('update:modelValue', value)
}
</script>
