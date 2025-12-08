<template>
  <div class="w-full">
    <label v-if="label" :for="inputId" class="block text-sm font-semibold text-gray-700 mb-2">
      {{ label }}
      <span v-if="required" class="text-red-500">*</span>
    </label>
    <div class="relative">
      <div v-if="iconLeft" class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Icon :name="iconLeft" class="text-gray-400" size="20" />
      </div>
      <input
        :id="inputId"
        v-model="dateValue"
        type="date"
        :min="min"
        :max="max"
        :disabled="disabled"
        :required="required"
        :class="inputClasses"
        @change="handleChange"
      />
    </div>
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
  iconLeft?: string
  min?: string
  max?: string
  disabled?: boolean
  required?: boolean
  error?: string
  helperText?: string
  id?: string
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
  required: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  'change': [event: Event]
}>()

const inputId = computed(() => props.id || `date-${Math.random().toString(36).substr(2, 9)}`)

const dateValue = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value || '')
})

const inputClasses = computed(() => {
  const base = 'input w-full transition-all focus:ring-2 focus:ring-blue-500 focus:border-transparent'
  const paddingLeft = props.iconLeft ? 'pl-10' : 'pl-4'
  const errorClass = props.error ? 'border-red-300 focus:ring-red-500' : ''
  const disabledClass = props.disabled ? 'opacity-50 cursor-not-allowed bg-gray-50' : ''
  return [base, paddingLeft, errorClass, disabledClass].join(' ')
})

const handleChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  emit('update:modelValue', target.value)
  emit('change', event)
}
</script>
