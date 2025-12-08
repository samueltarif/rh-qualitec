<template>
  <div class="group relative overflow-hidden rounded-2xl backdrop-blur-xl border p-6 hover:border-opacity-50 transition-all" :class="gradientClass">
    <div class="absolute top-0 right-0 w-20 h-20 rounded-full blur-2xl" :class="glowClass"></div>
    <div class="relative">
      <div class="flex items-center gap-3 mb-3">
        <div class="w-10 h-10 rounded-lg flex items-center justify-center" :class="iconBgClass">
          <Icon :name="icon" :class="iconClass" size="24" />
        </div>
        <span :class="labelClass" class="text-sm font-medium">{{ label }}</span>
      </div>
      <p :class="valueSize" class="font-bold text-white">{{ formattedValue }}</p>
      <p class="text-gray-400 text-sm mt-1">{{ subtitle }}</p>
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
const valueSize = computed(() => props.size === 'sm' ? 'text-2xl' : props.format === 'currency' ? 'text-3xl' : 'text-4xl')

const formattedValue = computed(() => {
  if (props.format === 'currency') {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(Number(props.value))
  }
  if (props.format === 'percent') return `${props.value}%`
  return props.value
})
</script>
