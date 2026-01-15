<template>
  <div>
    <label v-if="label" :for="id" class="block text-sm font-medium text-gray-600 mb-1">
      {{ label }} <span v-if="required" class="text-red-500">*</span>
    </label>
    <select
      :id="id"
      :value="modelValue"
      :disabled="disabled"
      :required="required"
      :class="[
        'w-full px-4 py-3 text-lg border-2 rounded-xl outline-none transition-colors',
        disabled ? 'border-gray-100 bg-gray-50 text-gray-500' : 'border-gray-200 focus:border-primary-500'
      ]"
      @change="$emit('update:modelValue', ($event.target as HTMLSelectElement).value)"
    >
      <option v-if="placeholder" value="">{{ placeholder }}</option>
      <option v-for="opt in options" :key="opt.value" :value="opt.value">
        {{ opt.label }}
      </option>
    </select>
  </div>
</template>

<script setup lang="ts">
interface Option {
  value: string | number
  label: string
}

interface Props {
  modelValue: string | number
  options: Option[]
  label?: string
  placeholder?: string
  disabled?: boolean
  required?: boolean
}

withDefaults(defineProps<Props>(), {
  disabled: false,
  required: false
})

defineEmits<{
  'update:modelValue': [value: string]
}>()

const id = computed(() => `select-${Math.random().toString(36).substr(2, 9)}`)
</script>
