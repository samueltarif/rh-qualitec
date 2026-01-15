<template>
  <div 
    :class="[
      'rounded-xl flex items-center justify-center font-bold',
      sizeClasses,
      colorClasses
    ]"
  >
    <img v-if="src" :src="src" :alt="name" class="w-full h-full object-cover rounded-xl" />
    <span v-else :class="textSizeClass">{{ initials }}</span>
  </div>
</template>

<script setup lang="ts">
interface Props {
  name: string
  src?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  color?: 'primary' | 'green' | 'orange' | 'purple' | 'gray'
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
  color: 'primary'
})

const initials = computed(() => {
  return props.name
    .split(' ')
    .map(n => n.charAt(0))
    .slice(0, 2)
    .join('')
    .toUpperCase()
})

const sizeClasses = computed(() => {
  const sizes = {
    sm: 'w-10 h-10',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-32 h-32'
  }
  return sizes[props.size]
})

const textSizeClass = computed(() => {
  const sizes = {
    sm: 'text-sm',
    md: 'text-lg',
    lg: 'text-2xl',
    xl: 'text-5xl'
  }
  return sizes[props.size]
})

const colorClasses = computed(() => {
  const colors = {
    primary: 'bg-primary-100 text-primary-700',
    green: 'bg-green-100 text-green-700',
    orange: 'bg-orange-200 text-orange-700',
    purple: 'bg-purple-100 text-purple-700',
    gray: 'bg-gray-100 text-gray-500'
  }
  return colors[props.color]
})
</script>
