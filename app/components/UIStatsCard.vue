<template>
  <div :class="cardClasses">
    <div class="flex items-center justify-between">
      <div>
        <p class="text-sm font-medium text-gray-500">{{ label }}</p>
        <p class="text-2xl font-bold mt-1" :class="valueColorClass">{{ value }}</p>
        <p v-if="subtitle" class="text-xs text-gray-400 mt-1">{{ subtitle }}</p>
      </div>
      <div v-if="icon" :class="iconContainerClasses">
        <Icon :name="icon" :class="iconColorClass" size="24" />
      </div>
    </div>
    <div v-if="trend !== undefined" class="mt-3 flex items-center gap-1 text-sm">
      <Icon 
        :name="trend >= 0 ? 'heroicons:arrow-trending-up' : 'heroicons:arrow-trending-down'" 
        :class="trend >= 0 ? 'text-green-500' : 'text-red-500'"
        size="16"
      />
      <span :class="trend >= 0 ? 'text-green-600' : 'text-red-600'">{{ Math.abs(trend) }}%</span>
      <span class="text-gray-400">vs mês anterior</span>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  label: string
  value: string | number
  subtitle?: string
  icon?: string
  color?: 'red' | 'blue' | 'green' | 'amber' | 'gray' | 'purple'
  trend?: number
}

const props = withDefaults(defineProps<Props>(), {
  color: 'red',
})

const cardClasses = 'bg-white rounded-xl border border-gray-200 p-5'

const iconContainerClasses = computed(() => {
  const colors = {
    red: 'bg-red-100',
    blue: 'bg-blue-100',
    green: 'bg-green-100',
    amber: 'bg-amber-100',
    gray: 'bg-gray-100',
    purple: 'bg-purple-100',
  }
  return `w-12 h-12 rounded-lg flex items-center justify-center ${colors[props.color]}`
})

const iconColorClass = computed(() => {
  const colors = {
    red: 'text-red-600',
    blue: 'text-blue-600',
    green: 'text-green-600',
    amber: 'text-amber-600',
    gray: 'text-gray-600',
    purple: 'text-purple-600',
  }
  return colors[props.color]
})

const valueColorClass = computed(() => {
  const colors = {
    red: 'text-red-700',
    blue: 'text-blue-700',
    green: 'text-green-700',
    amber: 'text-amber-700',
    gray: 'text-gray-700',
    purple: 'text-purple-700',
  }
  return colors[props.color]
})
</script>
