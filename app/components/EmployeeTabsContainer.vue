<template>
  <div class="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
    <!-- Navegação de Tabs -->
    <div class="border-b border-slate-200">
      <nav class="flex overflow-x-auto">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          @click="$emit('change', tab.id)"
          :class="[
            'flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap',
            modelValue === tab.id
              ? 'border-amber-500 text-amber-600 bg-amber-50'
              : 'border-transparent text-slate-600 hover:text-slate-800 hover:bg-slate-50'
          ]"
        >
          <Icon :name="tab.icon" size="18" />
          {{ tab.label }}
          <span v-if="tab.count" class="ml-1 px-2 py-0.5 text-xs rounded-full bg-amber-100 text-amber-700">
            {{ tab.count }}
          </span>
        </button>
      </nav>
    </div>

    <!-- Conteúdo da Tab -->
    <div class="p-6">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
interface Tab {
  id: string
  label: string
  icon: string
  count?: number
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
