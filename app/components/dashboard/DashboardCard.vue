<template>
  <component 
    :is="to ? 'NuxtLink' : 'div'"
    :to="to"
    :class="[
      'bg-white rounded-2xl p-6 shadow-sm border border-gray-100 transition-all',
      to ? 'hover:shadow-md hover:border-primary-200 group' : ''
    ]"
  >
    <div 
      class="w-14 h-14 rounded-xl flex items-center justify-center mb-4 transition-colors"
      :class="[iconBgClass, to ? groupHoverClass : '']"
    >
      <slot name="icon">
        <svg class="w-7 h-7" :class="iconColorClass" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="iconPath"/>
        </svg>
      </slot>
    </div>
    <h3 class="text-xl font-bold text-gray-800 mb-2">{{ title }}</h3>
    <p class="text-gray-500">{{ description }}</p>
    <slot />
  </component>
</template>

<script setup lang="ts">
interface Props {
  title: string
  description: string
  to?: string
  color?: 'blue' | 'green' | 'purple' | 'orange'
  iconPath?: string
}

const props = withDefaults(defineProps<Props>(), {
  color: 'blue',
  iconPath: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6'
})

const colorMap = {
  blue: { bg: 'bg-blue-100', icon: 'text-blue-600', hover: 'group-hover:bg-blue-200' },
  green: { bg: 'bg-green-100', icon: 'text-green-600', hover: 'group-hover:bg-green-200' },
  purple: { bg: 'bg-purple-100', icon: 'text-purple-600', hover: 'group-hover:bg-purple-200' },
  orange: { bg: 'bg-orange-100', icon: 'text-orange-600', hover: 'group-hover:bg-orange-200' }
}

const iconBgClass = computed(() => colorMap[props.color].bg)
const iconColorClass = computed(() => colorMap[props.color].icon)
const groupHoverClass = computed(() => colorMap[props.color].hover)
</script>
