<template>
  <div class="card">
    <h3 class="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
      <Icon :name="icon" :class="iconColor" />
      {{ title }}
    </h3>
    <div class="grid md:grid-cols-2 gap-4">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title: string
  icon: string
  iconColor?: string
}>()
</script>
