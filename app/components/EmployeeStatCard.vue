<template>
  <div class="bg-white rounded-xl p-4 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
    <div class="flex items-center gap-3">
      <div :class="['w-10 h-10 rounded-lg flex items-center justify-center', bgColorClass]">
        <Icon :name="icon" :class="iconColorClass" size="20" />
      </div>
      <div>
        <p class="text-xs text-slate-500 font-medium">{{ label }}</p>
        <p class="text-lg font-bold text-slate-800">{{ value }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  icon: string
  label: string
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
