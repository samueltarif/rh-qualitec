<template>
  <div class="group relative overflow-hidden rounded-xl sm:rounded-2xl backdrop-blur-xl border p-3 sm:p-4 lg:p-6 hover:border-opacity-50 transition-all" :class="gradientClass">
    <div class="absolute top-0 right-0 w-16 sm:w-20 h-16 sm:h-20 rounded-full blur-2xl" :class="glowClass"></div>
    <div class="relative">
      <div class="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
        <div class="w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center flex-shrink-0" :class="iconBgClass">
          <Icon :name="icon" :class="iconClass" class="w-5 h-5 sm:w-6 sm:h-6" />
        </div>
        <span :class="labelClass" class="text-xs sm:text-sm font-medium truncate">{{ label }}</span>
      </div>
      <p :class="valueSize" class="font-bold text-white truncate">{{ formattedValue }}</p>
      <p class="text-gray-400 text-xs sm:text-sm mt-0.5 sm:mt-1 truncate">{{ subtitle }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  icon: string
  label: string
  value: number | string
  subtitle: string
  color: 'emerald' | 'amber' | 'purple' | 'red' | 'blue' | 'cyan' | 'pink' | 'green'
  format?: 'currency' | 'percent' | 'number'
  size?: 'sm' | 'lg'
}>()

const colorMap = {
  emerald: { gradient: 'bg-gradient-to-br from-emerald-600/20 to-emerald-900/20 border-emerald-500/30', glow: 'bg-emerald-500/10', iconBg: 'bg-emerald-500/20', icon: 'text-emerald-400', label: 'text-emerald-400' },
  amber: { gradient: 'bg-gradient-to-br from-amber-600/20 to-amber-900/20 border-amber-500/30', glow: 'bg-amber-500/10', iconBg: 'bg-amber-500/20', icon: 'text-amber-400', label: 'text-amber-400' },
  purple: { gradient: 'bg-gradient-to-br from-purple-600/20 to-purple-900/20 border-purple-500/30', glow: 'bg-purple-500/10', iconBg: 'bg-purple-500/20', icon: 'text-purple-400', label: 'text-purple-400' },
  red: { gradient: 'bg-gradient-to-br from-red-600/20 to-red-900/20 border-red-500/30', glow: 'bg-red-500/10', iconBg: 'bg-red-500/20', icon: 'text-red-400', label: 'text-red-400' },
  blue: { gradient: 'bg-white/5 border-white/10', glow: 'bg-blue-500/10', iconBg: 'bg-blue-500/20', icon: 'text-blue-400', label: 'text-blue-400' },
  cyan: { gradient: 'bg-white/5 border-white/10', glow: 'bg-cyan-500/10', iconBg: 'bg-cyan-500/20', icon: 'text-cyan-400', label: 'text-cyan-400' },
  pink: { gradient: 'bg-white/5 border-white/10', glow: 'bg-pink-500/10', iconBg: 'bg-pink-500/20', icon: 'text-pink-400', label: 'text-pink-400' },
  green: { gradient: 'bg-white/5 border-white/10', glow: 'bg-green-500/10', iconBg: 'bg-green-500/20', icon: 'text-green-400', label: 'text-green-400' },
}

const colors = computed(() => colorMap[props.color])
const gradientClass = computed(() => colors.value.gradient)
const glowClass = computed(() => colors.value.glow)
const iconBgClass = computed(() => colors.value.iconBg)
const iconClass = computed(() => colors.value.icon)
const labelClass = computed(() => colors.value.label)
const valueSize = computed(() => {
  if (props.size === 'sm') return 'text-lg sm:text-xl lg:text-2xl'
  if (props.format === 'currency') return 'text-xl sm:text-2xl lg:text-3xl'
  return 'text-2xl sm:text-3xl lg:text-4xl'
})

const formattedValue = computed(() => {
  if (props.format === 'currency') {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(Number(props.value))
  }
  if (props.format === 'percent') return `${props.value}%`
  return props.value
})
</script>
