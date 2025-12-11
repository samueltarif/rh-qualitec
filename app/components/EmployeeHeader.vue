<template>
  <header class="bg-gradient-to-r from-slate-800 to-slate-900 border-b-4 border-amber-500 sticky top-0 z-40">
    <div class="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-3 sm:py-4">
      <div class="flex items-center justify-between gap-2">
        <div class="flex items-center gap-2 sm:gap-4 min-w-0">
          <div class="w-10 h-10 sm:w-12 sm:h-12 bg-amber-500 rounded-lg flex items-center justify-center shadow-lg flex-shrink-0">
            <Icon name="heroicons:cog-6-tooth" class="text-slate-900 w-5 h-5 sm:w-7 sm:h-7" />
          </div>
          <div class="min-w-0">
            <h1 class="text-base sm:text-xl font-bold text-white truncate">Portal do Colaborador</h1>
            <p class="text-xs sm:text-sm text-slate-400 truncate hidden sm:block">{{ empresa || 'Qualitec Instrumentos de Medição' }}</p>
          </div>
        </div>
        <UserProfileDropdown theme="employee" />
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
interface Props {
  empresa?: string
}

withDefaults(defineProps<Props>(), {
  empresa: 'Qualitec Instrumentos de Medição'
})
</script>
