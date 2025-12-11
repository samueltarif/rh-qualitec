<template>
  <div class="bg-white rounded-lg sm:rounded-xl border border-slate-200 shadow-sm overflow-hidden">
    <!-- Navegação de Tabs - Responsiva -->
    <div class="border-b border-slate-200">
      <nav class="flex overflow-x-auto scrollbar-hide" style="-webkit-overflow-scrolling: touch;">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          @click="$emit('change', tab.id)"
          :class="[
            'flex items-center gap-1.5 sm:gap-2 px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-medium border-b-2 transition-colors whitespace-nowrap min-w-fit touch-manipulation',
            modelValue === tab.id
              ? 'border-amber-500 text-amber-600 bg-amber-50'
              : 'border-transparent text-slate-600 hover:text-slate-800 hover:bg-slate-50 active:bg-slate-100'
          ]"
        >
          <Icon :name="tab.icon" class="w-4 h-4 sm:w-[18px] sm:h-[18px]" />
          <span class="hidden xs:inline sm:inline">{{ tab.label }}</span>
          <span class="xs:hidden sm:hidden">{{ tab.shortLabel || tab.label.split(' ')[0] }}</span>
          <span v-if="tab.count" class="ml-0.5 sm:ml-1 px-1.5 sm:px-2 py-0.5 text-[10px] sm:text-xs rounded-full bg-amber-100 text-amber-700">
            {{ tab.count }}
          </span>
        </button>
      </nav>
    </div>

    <!-- Conteúdo da Tab - Responsivo -->
    <div class="p-3 sm:p-4 md:p-6">
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
  shortLabel?: string
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
