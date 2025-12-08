<template>
  <NuxtLink 
    :to="to" 
    class="block p-4 rounded-xl border transition-all group relative cursor-pointer" 
    :class="classes"
  >
    <!-- Badge de notificação -->
    <span 
      v-if="badge && badge > 0" 
      class="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse"
    >
      {{ badge > 99 ? '99+' : badge }}
    </span>
    <Icon :name="icon" :class="iconClass" class="mb-2 group-hover:scale-110 transition-transform" size="28" />
    <p class="text-white font-medium">{{ label }}</p>
  </NuxtLink>
</template>

<script setup lang="ts">
interface Props {
  to: string
  icon: string
  label: string
  classes: string
  iconClass: string
  badge?: number
}

defineProps<Props>()
</script>
