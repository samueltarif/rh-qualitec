<template>
  <div class="text-center py-12">
    <div :class="iconContainerClasses">
      <Icon :name="icon" :class="iconColorClass" size="48" />
    </div>
    <h3 class="text-lg font-semibold text-gray-800 mt-4">{{ title }}</h3>
    <p v-if="description" class="text-gray-500 mt-2 max-w-md mx-auto">{{ description }}</p>
    <div v-if="$slots.action" class="mt-6">
      <slot name="action" />
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  icon?: string
  title: string
  description?: string
  color?: 'red' | 'blue' | 'green' | 'amber' | 'gray'
}

const props = withDefaults(defineProps<Props>(), {
  icon: 'heroicons:inbox',
  color: 'gray',
})

const iconContainerClasses = computed(() => {
  const colors = {
    red: 'bg-red-100',
    blue: 'bg-blue-100',
    green: 'bg-green-100',
    amber: 'bg-amber-100',
    gray: 'bg-gray-100',
  }
  return `w-20 h-20 rounded-full flex items-center justify-center mx-auto ${colors[props.color]}`
})

const iconColorClass = computed(() => {
  const colors = {
    red: 'text-red-600',
    blue: 'text-blue-600',
    green: 'text-green-600',
    amber: 'text-amber-600',
    gray: 'text-gray-400',
  }
  return colors[props.color]
})
</script>
