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
  const base = 'inline-flex items-center justify-center gap-1.5 sm:gap-2 font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed min-h-[36px] sm:min-h-[40px] touch-manipulation'
  
  const sizes = {
    sm: 'px-2.5 sm:px-3 py-1.5 text-xs sm:text-sm',
    md: 'px-3 sm:px-4 py-2 text-sm sm:text-base',
    lg: 'px-4 sm:px-6 py-2.5 sm:py-3 text-base sm:text-lg',
  }
  
  const variants = {
    primary: 'bg-red-700 text-white hover:bg-red-800 active:bg-red-900',
    secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300 active:bg-gray-400',
    danger: 'bg-red-600 text-white hover:bg-red-700 active:bg-red-800',
    ghost: 'bg-transparent text-gray-700 hover:bg-gray-100 active:bg-gray-200',
  }
  
  return [
    base,
    sizes[props.size || 'md'],
    variants[props.variant || 'primary'],
  ].join(' ')
})
</script>
