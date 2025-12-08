<template>
  <span :class="badgeClasses">
    <Icon v-if="icon" :name="icon" :size="iconSize" />
    <slot>{{ label }}</slot>
  </span>
</template>

<script setup lang="ts">
interface Props {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'primary'
  size?: 'sm' | 'md' | 'lg'
  label?: string
  icon?: string
  iconSize?: string
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'default',
  size: 'md',
  iconSize: '14',
})

const badgeClasses = computed(() => {
  const base = 'inline-flex items-center gap-1 font-medium rounded-full'
  
  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
    lg: 'px-3 py-1.5 text-base',
  }
  
  const variants = {
    default: 'bg-gray-100 text-gray-700',
    success: 'bg-green-100 text-green-700',
    warning: 'bg-amber-100 text-amber-700',
    danger: 'bg-red-100 text-red-700',
    info: 'bg-blue-100 text-blue-700',
    primary: 'bg-red-100 text-red-700',
  }
  
  return [base, sizes[props.size], variants[props.variant]].join(' ')
})
</script>
