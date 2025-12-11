<template>
  <div class="bg-gradient-to-r from-slate-800 to-slate-700 rounded-lg sm:rounded-xl p-4 sm:p-6 shadow-lg">
    <div class="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
      <!-- Info do Registro -->
      <div class="flex items-center gap-3 sm:gap-4 w-full sm:w-auto">
        <div class="w-12 h-12 sm:w-16 sm:h-16 bg-amber-500 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
          <Icon name="heroicons:finger-print" class="text-slate-900 w-6 h-6 sm:w-8 sm:h-8" />
        </div>
        <div class="text-left sm:text-left flex-1 min-w-0">
          <h3 class="text-base sm:text-lg font-bold text-white">Registro de Ponto</h3>
          <p class="text-xs sm:text-sm text-slate-400 truncate">{{ dataHoraAtual }}</p>
        </div>
      </div>

      <!-- Botão de Registro com GPS -->
      <div class="w-full sm:w-auto">
        <ButtonBaterPontoGeo @sucesso="$emit('sucesso', $event)" class="w-full sm:w-auto" />
      </div>
    </div>

    <!-- Último Registro -->
    <div v-if="ultimoRegistro" class="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-slate-600">
      <p class="text-xs sm:text-sm text-slate-400 text-center sm:text-left">
        Último registro: <span class="text-amber-400 font-medium">{{ ultimoRegistro }}</span>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  dataHoraAtual: string
  ultimoRegistro?: string
}

withDefaults(defineProps<Props>(), {
  ultimoRegistro: ''
})

defineEmits<{
  sucesso: [data: any]
}>()
</script>
