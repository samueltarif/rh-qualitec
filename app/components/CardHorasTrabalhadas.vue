<template>
  <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
    <!-- Cabeçalho -->
    <div class="flex items-center justify-between mb-6">
      <h3 class="text-lg font-semibold text-gray-900">Horas Trabalhadas Hoje</h3>
      <div class="text-3xl font-bold text-blue-600">
        {{ horasFormatadas }}
      </div>
    </div>

    <!-- Status do Expediente -->
    <div v-if="expedienteFinalizado" class="mb-4">
      <div class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
        <svg class="w-4 h-4 mr-1.5" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
        </svg>
        Expediente finalizado
      </div>
    </div>

    <!-- Registros de Ponto -->
    <div class="space-y-3">
      <!-- Entrada -->
      <div class="flex items-center justify-between py-2 border-b border-gray-100">
        <div class="flex items-center">
          <div class="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
            <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
            </svg>
          </div>
          <div>
            <p class="text-sm font-medium text-gray-900">Entrada</p>
            <p class="text-xs text-gray-500">Início do expediente</p>
          </div>
        </div>
        <div class="text-right">
          <p class="text-lg font-semibold text-gray-900">{{ entrada || '--:--:--' }}</p>
        </div>
      </div>

      <!-- Intervalo -->
      <div class="flex items-center justify-between py-2 border-b border-gray-100">
        <div class="flex items-center">
          <div class="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center mr-3">
            <svg class="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p class="text-sm font-medium text-gray-900">Intervalo</p>
            <p class="text-xs text-gray-500">Pausa para almoço</p>
          </div>
        </div>
        <div class="text-right">
          <p class="text-lg font-semibold text-gray-900">
            {{ intervaloInicio && intervaloFim ? `${intervaloInicio} - ${intervaloFim}` : '--:--:-- - --:--:--' }}
          </p>
        </div>
      </div>

      <!-- Saída -->
      <div class="flex items-center justify-between py-2">
        <div class="flex items-center">
          <div class="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center mr-3">
            <svg class="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </div>
          <div>
            <p class="text-sm font-medium text-gray-900">Saída</p>
            <p class="text-xs text-gray-500">Fim do expediente</p>
          </div>
        </div>
        <div class="text-right">
          <p class="text-lg font-semibold text-gray-900">{{ saida || '--:--:--' }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  horasTrabalhadas?: number // em minutos
  entrada?: string
  intervaloInicio?: string
  intervaloFim?: string
  saida?: string
  expedienteFinalizado?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  horasTrabalhadas: 0,
  entrada: '',
  intervaloInicio: '',
  intervaloFim: '',
  saida: '',
  expedienteFinalizado: false
})

const horasFormatadas = computed(() => {
  if (!props.horasTrabalhadas) return '--:--'
  
  const horas = Math.floor(props.horasTrabalhadas / 60)
  const minutos = props.horasTrabalhadas % 60
  
  return `${String(horas).padStart(2, '0')}:${String(minutos).padStart(2, '0')}`
})
</script>
