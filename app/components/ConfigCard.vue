<template>
  <div 
    class="card hover:shadow-lg transition-shadow cursor-pointer" 
    @click="$emit('click')"
  >
    <div class="flex items-start gap-4">
      <div 
        class="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
        :class="bgColorClass"
      >
        <Icon :name="icon" :class="iconColorClass" size="24" />
      </div>
      <div class="flex-1">
        <h3 class="text-lg font-semibold text-gray-800 mb-1">{{ title }}</h3>
        <p class="text-sm text-gray-600 mb-3">{{ description }}</p>
        <span class="text-xs font-medium" :class="textColorClass">
          Configurar →
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  title: string
  description: string
  icon: string
  color?: 'blue' | 'green' | 'purple' | 'amber' | 'red' | 'indigo' | 'cyan' | 'pink' | 'emerald' | 'orange' | 'slate' | 'teal'
}

const props = withDefaults(defineProps<Props>(), {
  color: 'blue'
})

defineEmits<{
  click: []
}>()

const colorClasses = {
  blue: { bg: 'bg-blue-100', icon: 'text-blue-600', text: 'text-blue-600' },
  green: { bg: 'bg-green-100', icon: 'text-green-600', text: 'text-green-600' },
  purple: { bg: 'bg-purple-100', icon: 'text-purple-600', text: 'text-purple-600' },
  amber: { bg: 'bg-amber-100', icon: 'text-amber-600', text: 'text-amber-600' },
  red: { bg: 'bg-red-100', icon: 'text-red-600', text: 'text-red-600' },
  indigo: { bg: 'bg-indigo-100', icon: 'text-indigo-600', text: 'text-indigo-600' },
  cyan: { bg: 'bg-cyan-100', icon: 'text-cyan-600', text: 'text-cyan-600' },
  pink: { bg: 'bg-pink-100', icon: 'text-pink-600', text: 'text-pink-600' },
  emerald: { bg: 'bg-emerald-100', icon: 'text-emerald-600', text: 'text-emerald-600' },
  orange: { bg: 'bg-orange-100', icon: 'text-orange-600', text: 'text-orange-600' },
  slate: { bg: 'bg-slate-100', icon: 'text-slate-600', text: 'text-slate-600' },
  teal: { bg: 'bg-teal-100', icon: 'text-teal-600', text: 'text-teal-600' },
}

const bgColorClass = computed(() => colorClasses[props.color].bg)
const iconColorClass = computed(() => colorClasses[props.color].icon)
const textColorClass = computed(() => colorClasses[props.color].text)
</script>
