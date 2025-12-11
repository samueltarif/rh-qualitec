<template>
  <div v-if="registroHoje" class="bg-gradient-to-br from-green-600 to-green-700 rounded-lg sm:rounded-xl p-4 sm:p-6 shadow-lg">
    <div class="flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-6">
      <!-- Contador de Horas -->
      <div class="flex items-center gap-3 sm:gap-4 w-full sm:w-auto">
        <div class="w-12 h-12 sm:w-16 sm:h-16 bg-white/20 rounded-lg sm:rounded-xl flex items-center justify-center backdrop-blur-sm flex-shrink-0">
          <Icon name="heroicons:clock" class="text-white w-6 h-6 sm:w-8 sm:h-8" />
        </div>
        <div class="text-left flex-1">
          <p class="text-xs sm:text-sm text-green-100 font-medium mb-0.5 sm:mb-1">Horas Trabalhadas Hoje</p>
          <p 
            class="text-2xl sm:text-4xl font-bold text-white font-mono"
            :class="{ 'animate-pulse': emAndamento }"
          >
            {{ horasFormatadas }}
          </p>
          <div v-if="emAndamento" class="flex items-center gap-1.5 sm:gap-2 mt-1 sm:mt-2">
            <span class="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-300 rounded-full animate-pulse"></span>
            <p class="text-[10px] sm:text-xs text-green-100">Contagem em tempo real</p>
          </div>
          <div v-else class="mt-1 sm:mt-2">
            <p class="text-[10px] sm:text-xs text-green-100">Expediente finalizado</p>
          </div>
        </div>
      </div>

      <!-- Detalhes dos Registros -->
      <div class="w-full sm:w-auto text-left sm:text-right border-t sm:border-t-0 border-white/20 pt-3 sm:pt-0">
        <div class="space-y-1.5 sm:space-y-2">
          <div class="flex items-center gap-2 sm:gap-3 text-white/90 sm:justify-end">
            <Icon name="heroicons:arrow-right-on-rectangle" class="w-4 h-4" />
            <span class="text-xs sm:text-sm">Entrada: {{ registroHoje.entrada_1 || '--:--' }}</span>
          </div>
          <div v-if="registroHoje.saida_1" class="flex items-center gap-2 sm:gap-3 text-white/90 sm:justify-end">
            <Icon name="heroicons:pause" class="w-4 h-4" />
            <span class="text-xs sm:text-sm">Intervalo: {{ registroHoje.saida_1 }} - {{ registroHoje.entrada_2 || '...' }}</span>
          </div>
          <div v-if="registroHoje.saida_2" class="flex items-center gap-2 sm:gap-3 text-white/90 sm:justify-end">
            <Icon name="heroicons:arrow-left-on-rectangle" class="w-4 h-4" />
            <span class="text-xs sm:text-sm">Saída: {{ registroHoje.saida_2 }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  registroHoje: any
  horasFormatadas: string
  emAndamento: boolean
}

defineProps<Props>()
</script>
