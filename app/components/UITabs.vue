<template>
  <div>
    <div class="flex gap-1 border-b border-gray-200 overflow-x-auto">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        type="button"
        class="px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors -mb-px flex items-center gap-2"
        :class="modelValue === tab.id 
          ? 'border-red-700 text-red-700' 
          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'"
        @click="$emit('update:modelValue', tab.id)"
      >
        <Icon v-if="tab.icon" :name="tab.icon" size="18" />
        {{ tab.label }}
        <span v-if="tab.count !== undefined && tab.count > 0" class="px-2 py-0.5 text-xs rounded-full" :class="modelValue === tab.id ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'">
          {{ tab.count }}
        </span>
      </button>
    </div>
    <div class="pt-6">
      <slot :name="modelValue" />
    </div>
  </div>
</template>

<script setup lang="ts">
interface Tab {
  id: string
  label: string
  icon?: string
  count?: number
}

interface Props {
  modelValue: string
  tabs: Tab[]
}

defineProps<Props>()
defineEmits<{
  'update:modelValue': [value: string]
}>()
</script>
