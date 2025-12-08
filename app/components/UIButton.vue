<template>
  <button
    :type="type"
    :disabled="disabled || loading"
    :class="buttonClasses"
    @click="$emit('click', $event)"
  >
    <Icon v-if="loading" name="heroicons:arrow-path" class="animate-spin" size="20" />
    <slot v-else />
  </button>
</template>

<script setup lang="ts">
const props = defineProps<{
  type?: 'button' | 'submit' | 'reset'
  theme?: 'admin' | 'default'
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  disabled?: boolean
  loading?: boolean
  size?: 'sm' | 'md' | 'lg'
}>()

defineEmits<{
  click: [event: MouseEvent]
}>()

const buttonClasses = computed(() => {
  const base = 'inline-flex items-center justify-center font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
  
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  }
  
  const variants = {
    primary: 'bg-red-700 text-white hover:bg-red-800',
    secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300',
    danger: 'bg-red-600 text-white hover:bg-red-700',
    ghost: 'bg-transparent text-gray-700 hover:bg-gray-100',
  }
  
  return [
    base,
    sizes[props.size || 'md'],
    variants[props.variant || 'primary'],
  ].join(' ')
})
</script>
