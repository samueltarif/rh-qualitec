<template>
  <header class="bg-white border-b border-gray-200 sticky top-0 z-40">
    <div class="max-w-7xl mx-auto px-8 py-4">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-4">
          <NuxtLink 
            v-if="backTo" 
            :to="backTo" 
            class="w-10 h-10 bg-red-700 rounded-lg flex items-center justify-center hover:bg-red-800 transition-colors"
          >
            <Icon name="heroicons:arrow-left" class="text-white" size="20" />
          </NuxtLink>
          <div>
            <h1 class="text-xl font-bold text-gray-800">{{ title }}</h1>
            <p v-if="subtitle" class="text-sm text-gray-500">{{ subtitle }}</p>
          </div>
        </div>
        <div class="flex items-center gap-3">
          <slot name="actions" />
          <UserProfileDropdown :theme="theme" />
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
defineProps<{
  title: string
  subtitle?: string
  backTo?: string
  theme?: 'admin' | 'employee'
}>()
</script>
