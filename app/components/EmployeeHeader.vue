<template>
  <header class="bg-gradient-to-r from-slate-800 to-slate-900 border-b-4 border-amber-500 sticky top-0 z-40">
    <div class="max-w-7xl mx-auto px-6 py-4">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 bg-amber-500 rounded-lg flex items-center justify-center shadow-lg">
            <Icon name="heroicons:cog-6-tooth" class="text-slate-900" size="28" />
          </div>
          <div>
            <h1 class="text-xl font-bold text-white">Portal do Colaborador</h1>
            <p class="text-sm text-slate-400">{{ empresa || 'Qualitec Instrumentos de Medição' }}</p>
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
