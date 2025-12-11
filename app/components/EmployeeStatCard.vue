<template>
  <div class="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
    <div class="flex items-center gap-2 sm:gap-3">
      <div :class="['w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center flex-shrink-0', bgColorClass]">
        <Icon :name="icon" :class="iconColorClass" class="w-4 h-4 sm:w-5 sm:h-5" />
      </div>
      <div class="min-w-0">
        <p class="text-[10px] sm:text-xs text-slate-500 font-medium truncate">
          <span class="hidden sm:inline">{{ label }}</span>
          <span class="sm:hidden">{{ shortLabel || label }}</span>
        </p>
        <p class="text-base sm:text-lg font-bold text-slate-800">{{ value }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  icon: string
  label: string
  shortLabel?: string
  value: string | number
  color?: 'blue' | 'amber' | 'purple' | 'green' | 'red'
}

const props = withDefaults(defineProps<Props>(), {
  color: 'blue'
})

const colorClasses = {
  blue: { bg: 'bg-blue-100', icon: 'text-blue-600' },
  amber: { bg: 'bg-amber-100', icon: 'text-amber-600' },
  purple: { bg: 'bg-purple-100', icon: 'text-purple-600' },
  green: { bg: 'bg-green-100', icon: 'text-green-600' },
  red: { bg: 'bg-red-100', icon: 'text-red-600' }
}

const bgColorClass = computed(() => colorClasses[props.color].bg)
const iconColorClass = computed(() => colorClasses[props.color].icon)
</script>
