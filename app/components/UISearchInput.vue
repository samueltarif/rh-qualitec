<template>
  <div class="relative">
    <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
      <Icon name="heroicons:magnifying-glass" class="text-gray-400" size="20" />
    </div>
    <input
      v-model="searchValue"
      type="text"
      :placeholder="placeholder"
      class="input w-full pl-10 pr-10"
      @input="handleInput"
      @keydown.enter="$emit('search', searchValue)"
    />
    <button
      v-if="searchValue"
      type="button"
      class="absolute inset-y-0 right-0 pr-3 flex items-center"
      @click="clear"
    >
      <Icon name="heroicons:x-circle" class="text-gray-400 hover:text-gray-600" size="20" />
    </button>
  </div>
</template>

<script setup lang="ts">
interface Props {
  modelValue?: string
  placeholder?: string
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: 'Buscar...',
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  'search': [value: string]
}>()

const searchValue = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value || '')
})

const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  emit('update:modelValue', target.value)
}

const clear = () => {
  emit('update:modelValue', '')
  emit('search', '')
}
</script>
