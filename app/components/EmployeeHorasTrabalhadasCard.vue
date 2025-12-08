<template>
  <div v-if="registroHoje" class="bg-gradient-to-br from-green-600 to-green-700 rounded-xl p-6 shadow-lg">
    <div class="flex flex-col md:flex-row items-center justify-between gap-6">
      <!-- Contador de Horas -->
      <div class="flex items-center gap-4">
        <div class="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
          <Icon name="heroicons:clock" class="text-white" size="32" />
        </div>
        <div class="text-center md:text-left">
          <p class="text-sm text-green-100 font-medium mb-1">Horas Trabalhadas Hoje</p>
          <p 
            class="text-4xl font-bold text-white font-mono"
            :class="{ 'animate-pulse': emAndamento }"
          >
            {{ horasFormatadas }}
          </p>
          <div v-if="emAndamento" class="flex items-center gap-2 mt-2">
            <span class="w-2 h-2 bg-green-300 rounded-full animate-pulse"></span>
            <p class="text-xs text-green-100">Contagem em tempo real</p>
          </div>
          <div v-else class="mt-2">
            <p class="text-xs text-green-100">Expediente finalizado</p>
          </div>
        </div>
      </div>

      <!-- Detalhes dos Registros -->
      <div class="text-center md:text-right">
        <div class="space-y-2">
          <div class="flex items-center gap-3 text-white/90">
            <Icon name="heroicons:arrow-right-on-rectangle" size="16" />
            <span class="text-sm">Entrada: {{ registroHoje.entrada_1 || '--:--' }}</span>
          </div>
          <div v-if="registroHoje.saida_1" class="flex items-center gap-3 text-white/90">
            <Icon name="heroicons:pause" size="16" />
            <span class="text-sm">Intervalo: {{ registroHoje.saida_1 }} - {{ registroHoje.entrada_2 || '...' }}</span>
          </div>
          <div v-if="registroHoje.saida_2" class="flex items-center gap-3 text-white/90">
            <Icon name="heroicons:arrow-left-on-rectangle" size="16" />
            <span class="text-sm">Saída: {{ registroHoje.saida_2 }}</span>
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
