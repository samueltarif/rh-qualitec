<template>
  <div :class="cardClasses">
    <div v-if="title || $slots.header" class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4 mb-3 sm:mb-4">
      <slot name="header">
        <div class="flex items-center gap-2 sm:gap-3">
          <div v-if="icon" :class="iconContainerClasses">
            <Icon :name="icon" :class="iconClasses" class="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div class="min-w-0">
            <h3 class="text-base sm:text-lg font-bold text-gray-800 truncate">{{ title }}</h3>
            <p v-if="subtitle" class="text-xs sm:text-sm text-gray-500 truncate">{{ subtitle }}</p>
          </div>
        </div>
      </slot>
      <div class="flex-shrink-0">
        <slot name="actions" />
      </div>
    </div>
    <slot />
  </div>
</template>

<script setup lang="ts">
interface Props {
  title?: string
  subtitle?: string
  icon?: string
  variant?: 'default' | 'bordered' | 'elevated'
  padding?: 'none' | 'sm' | 'md' | 'lg'
  iconColor?: 'red' | 'blue' | 'green' | 'amber' | 'gray'
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'default',
  padding: 'md',
  iconColor: 'red',
})

const cardClasses = computed(() => {
  const base = 'bg-white rounded-lg sm:rounded-xl'
  const variants = {
    default: 'border border-gray-200',
    bordered: 'border-2 border-gray-300',
    elevated: 'shadow-lg',
  }
  const paddings = {
    none: '',
    sm: 'p-3 sm:p-4',
    md: 'p-4 sm:p-6',
    lg: 'p-5 sm:p-8',
  }
  return [base, variants[props.variant], paddings[props.padding]].join(' ')
})

const iconContainerClasses = computed(() => {
  const colors = {
    red: 'bg-red-100',
    blue: 'bg-blue-100',
    green: 'bg-green-100',
    amber: 'bg-amber-100',
    gray: 'bg-gray-100',
  }
  return `w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${colors[props.iconColor]}`
})

const iconClasses = computed(() => {
  const colors = {
    red: 'text-red-600',
    blue: 'text-blue-600',
    green: 'text-green-600',
    amber: 'text-amber-600',
    gray: 'text-gray-600',
  }
  return colors[props.iconColor]
})
</script>
