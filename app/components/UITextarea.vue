<template>
  <div class="w-full">
    <label v-if="label" :for="textareaId" class="block text-sm font-semibold text-gray-700 mb-2">
      {{ label }}
      <span v-if="required" class="text-red-500">*</span>
    </label>
    <textarea
      :id="textareaId"
      v-model="textareaValue"
      :placeholder="placeholder"
      :disabled="disabled"
      :required="required"
      :rows="rows"
      :class="textareaClasses"
      @input="handleInput"
      @blur="$emit('blur', $event)"
    />
    <p v-if="error" class="mt-1 text-sm text-red-600 flex items-center gap-1">
      <Icon name="heroicons:exclamation-circle" size="16" />
      {{ error }}
    </p>
    <p v-if="helperText && !error" class="mt-1 text-sm text-gray-500">{{ helperText }}</p>
  </div>
</template>

<script setup lang="ts">
interface Props {
  modelValue?: string
  label?: string
  placeholder?: string
  rows?: number
  disabled?: boolean
  required?: boolean
  error?: string
  helperText?: string
  id?: string
  uppercase?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  rows: 3,
  disabled: false,
  required: false,
  uppercase: true, // Por padrão, converte para maiúsculas
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  'blur': [event: FocusEvent]
}>()

const textareaId = computed(() => props.id || `textarea-${Math.random().toString(36).substr(2, 9)}`)

const textareaValue = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value || '')
})

const textareaClasses = computed(() => {
  const base = 'input w-full resize-none transition-all focus:ring-2 focus:ring-blue-500 focus:border-transparent'
  const errorClass = props.error ? 'border-red-300 focus:ring-red-500' : ''
  const disabledClass = props.disabled ? 'opacity-50 cursor-not-allowed bg-gray-50' : ''
  const uppercaseClass = props.uppercase ? 'uppercase' : ''
  return [base, errorClass, disabledClass, uppercaseClass].join(' ')
})

const handleInput = (event: Event) => {
  const target = event.target as HTMLTextAreaElement
  let value = target.value
  
  // Converte para maiúsculas se a prop uppercase estiver ativa
  if (props.uppercase) {
    value = value.toUpperCase()
  }
  
  emit('update:modelValue', value)
}
</script>
