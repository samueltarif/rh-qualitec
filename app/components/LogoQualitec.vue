<template>
  <div class="flex items-center space-x-3">
    <!-- Logo SVG -->
    <div class="relative">
      <svg 
        :width="size" 
        :height="Math.round(size * 0.3)" 
        viewBox="0 0 200 60" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        class="transition-all duration-300"
      >
        <!-- Background Circle -->
        <circle cx="30" cy="30" r="25" :fill="primaryColor" :stroke="secondaryColor" stroke-width="2"/>
        
        <!-- Q Letter -->
        <path d="M20 20 Q35 15 35 30 Q35 45 20 40 Q15 35 15 30 Q15 25 20 20 Z" fill="white"/>
        <circle cx="25" cy="30" r="8" :fill="primaryColor"/>
        <path d="M30 35 L35 40" stroke="white" stroke-width="3" stroke-linecap="round"/>
        
        <!-- Company Name -->
        <text 
          x="65" 
          y="25" 
          font-family="Arial, sans-serif" 
          :font-size="textSize" 
          font-weight="bold" 
          :fill="secondaryColor"
        >
          QUALITEC
        </text>
        <text 
          x="65" 
          y="42" 
          font-family="Arial, sans-serif" 
          :font-size="subtextSize" 
          :fill="subtextColor"
        >
          {{ subtitle }}
        </text>
        
        <!-- Decorative Elements -->
        <rect x="65" y="48" width="40" height="2" :fill="primaryColor" rx="1"/>
        <rect x="110" y="48" width="20" height="2" fill="#10B981" rx="1"/>
        <rect x="135" y="48" width="15" height="2" fill="#F59E0B" rx="1"/>
      </svg>
    </div>
    
    <!-- Text version for small sizes -->
    <div v-if="showText && size < 120" class="flex flex-col">
      <span :class="textClasses" class="font-bold">QUALITEC</span>
      <span :class="subtextClasses" class="text-xs">{{ subtitle }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  size?: number
  variant?: 'default' | 'white' | 'dark'
  subtitle?: string
  showText?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  size: 200,
  variant: 'default',
  subtitle: 'Sistema RH',
  showText: false
})

const primaryColor = computed(() => {
  switch (props.variant) {
    case 'white':
      return '#ffffff'
    case 'dark':
      return '#1E40AF'
    default:
      return '#3B82F6'
  }
})

const secondaryColor = computed(() => {
  switch (props.variant) {
    case 'white':
      return '#f3f4f6'
    case 'dark':
      return '#111827'
    default:
      return '#1E40AF'
  }
})

const subtextColor = computed(() => {
  switch (props.variant) {
    case 'white':
      return '#d1d5db'
    case 'dark':
      return '#6b7280'
    default:
      return '#6B7280'
  }
})

const textSize = computed(() => Math.max(12, props.size * 0.09))
const subtextSize = computed(() => Math.max(8, props.size * 0.06))

const textClasses = computed(() => {
  const baseClasses = 'font-bold'
  switch (props.variant) {
    case 'white':
      return `${baseClasses} text-white`
    case 'dark':
      return `${baseClasses} text-gray-900`
    default:
      return `${baseClasses} text-blue-800`
  }
})

const subtextClasses = computed(() => {
  const baseClasses = 'text-xs'
  switch (props.variant) {
    case 'white':
      return `${baseClasses} text-gray-300`
    case 'dark':
      return `${baseClasses} text-gray-600`
    default:
      return `${baseClasses} text-gray-500`
  }
})
</script>