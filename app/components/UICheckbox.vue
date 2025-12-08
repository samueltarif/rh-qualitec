<template>
  <label class="flex items-start gap-3 cursor-pointer group" :class="{ 'opacity-50 cursor-not-allowed': disabled }">
    <input
      type="checkbox"
      :checked="modelValue"
      :disabled="disabled"
      class="w-5 h-5 rounded border-gray-300 text-red-700 focus:ring-red-500 focus:ring-2 mt-0.5 cursor-pointer disabled:cursor-not-allowed"
      @change="handleChange"
    />
    <div class="flex-1">
      <span class="text-sm font-medium text-gray-700 group-hover:text-gray-900">{{ label }}</span>
      <p v-if="description" class="text-sm text-gray-500 mt-0.5">{{ description }}</p>
    </div>
  </label>
</template>

<script setup lang="ts">
interface Props {
  modelValue?: boolean
  label: string
  description?: string
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
  disabled: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const handleChange = (event: Event) => {
  if (!props.disabled) {
    const target = event.target as HTMLInputElement
    emit('update:modelValue', target.checked)
  }
}
</script>
