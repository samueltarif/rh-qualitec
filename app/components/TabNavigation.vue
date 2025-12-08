<template>
  <div class="border-b border-gray-200">
    <nav class="flex space-x-8">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        @click="$emit('change', tab.id)"
        :class="[
          'py-4 px-1 border-b-2 font-medium text-sm transition-colors flex items-center space-x-2',
          modelValue === tab.id
            ? 'border-orange-500 text-orange-600'
            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
        ]"
      >
        <component v-if="tab.icon" :is="tab.icon" class="w-5 h-5" />
        <span>{{ tab.label }}</span>
      </button>
    </nav>
  </div>
</template>

<script setup lang="ts">
interface Tab {
  id: string
  label: string
  icon?: any
}

interface Props {
  tabs: Tab[]
  modelValue: string
}

defineProps<Props>()

defineEmits<{
  change: [value: string]
}>()
</script>
