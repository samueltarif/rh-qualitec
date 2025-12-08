<template>
  <div class="bg-gradient-to-r from-green-600 to-green-500 rounded-lg shadow-lg p-6 text-white">
    <div class="flex items-center justify-between">
      <div class="flex items-center space-x-4">
        <div class="bg-white/20 rounded-full p-3">
          <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div>
          <p class="text-sm font-medium opacity-90">{{ titulo }}</p>
          <h2 class="text-4xl font-bold">{{ horasFormatadas }}</h2>
          <p v-if="tempoReal" class="text-xs mt-1 opacity-80 flex items-center">
            <span class="w-2 h-2 bg-green-300 rounded-full mr-2 animate-pulse"></span>
            {{ mensagemTempoReal }}
          </p>
        </div>
      </div>
      <div class="text-right">
        <div class="flex items-center text-sm mb-1">
          <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
          </svg>
          <span>{{ labelEntrada }}: {{ entrada }}</span>
        </div>
        <div class="flex items-center text-sm">
          <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{{ labelIntervalo }}: {{ intervalo }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  titulo?: string
  horas?: number
  minutos?: number
  entrada?: string
  intervalo?: string
  tempoReal?: boolean
  mensagemTempoReal?: string
  labelEntrada?: string
  labelIntervalo?: string
}

const props = withDefaults(defineProps<Props>(), {
  titulo: 'Horas Trabalhadas Hoje',
  horas: 0,
  minutos: 0,
  entrada: '07:30:00',
  intervalo: '12:00:00 - 13:15:00',
  tempoReal: true,
  mensagemTempoReal: 'Contagem em tempo real',
  labelEntrada: 'Entrada',
  labelIntervalo: 'Intervalo'
})

const horasFormatadas = computed(() => {
  const h = String(props.horas).padStart(2, '0')
  const m = String(props.minutos).padStart(2, '0')
  return `${h}h${m}`
})
</script>
