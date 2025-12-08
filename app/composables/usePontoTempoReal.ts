/**
 * Composable para gerenciar contagem de horas em tempo real
 * Atualiza automaticamente registros de ponto em andamento
 */

import { ref, computed, onMounted, onUnmounted } from 'vue'
import { calcularHorasTempoReal, registroEmAndamento, type RegistroPonto } from '~/utils/pontoCalculos'

export function usePontoTempoReal(registros: Ref<any[]>) {
  const horaAtual = ref(new Date())
  let intervalId: NodeJS.Timeout | null = null

  // Atualiza a hora atual a cada minuto
  const atualizarHora = () => {
    horaAtual.value = new Date()
  }

  // Calcula horas para um registro (tempo real se em andamento, fixo se finalizado)
  const calcularHoras = (registro: any) => {
    if (registroEmAndamento(registro)) {
      return calcularHorasTempoReal(registro, horaAtual.value)
    }
    return calcularHorasTrabalhadas(registro)
  }

  // Verifica se há algum registro em andamento
  const temRegistroEmAndamento = computed(() => {
    return registros.value.some(r => registroEmAndamento(r))
  })

  // Inicia o timer se houver registros em andamento
  const iniciarTimer = () => {
    if (intervalId) return
    
    // Atualizar a cada minuto (60000ms)
    intervalId = setInterval(atualizarHora, 60000)
    
    // Atualizar imediatamente
    atualizarHora()
  }

  // Para o timer
  const pararTimer = () => {
    if (intervalId) {
      clearInterval(intervalId)
      intervalId = null
    }
  }

  // Reinicia o timer se necessário
  const verificarTimer = () => {
    if (temRegistroEmAndamento.value) {
      iniciarTimer()
    } else {
      pararTimer()
    }
  }

  // Watch para iniciar/parar timer automaticamente
  watch(temRegistroEmAndamento, (temAndamento) => {
    if (temAndamento) {
      iniciarTimer()
    } else {
      pararTimer()
    }
  }, { immediate: true })

  // Lifecycle
  onMounted(() => {
    verificarTimer()
  })

  onUnmounted(() => {
    pararTimer()
  })

  return {
    horaAtual,
    calcularHoras,
    temRegistroEmAndamento,
    registroEmAndamento,
    iniciarTimer,
    pararTimer,
    verificarTimer
  }
}

/**
 * Composable simplificado para um único registro
 */
export function usePontoTempoRealSingle(registro: Ref<any>) {
  const horaAtual = ref(new Date())
  let intervalId: NodeJS.Timeout | null = null

  const atualizarHora = () => {
    horaAtual.value = new Date()
  }

  const emAndamento = computed(() => {
    return registroEmAndamento(registro.value)
  })

  const horasCalculadas = computed(() => {
    if (emAndamento.value) {
      return calcularHorasTempoReal(registro.value, horaAtual.value)
    }
    return calcularHorasTrabalhadas(registro.value)
  })

  const iniciarTimer = () => {
    if (intervalId) return
    intervalId = setInterval(atualizarHora, 60000)
    atualizarHora()
  }

  const pararTimer = () => {
    if (intervalId) {
      clearInterval(intervalId)
      intervalId = null
    }
  }

  watch(emAndamento, (andamento) => {
    if (andamento) {
      iniciarTimer()
    } else {
      pararTimer()
    }
  }, { immediate: true })

  onMounted(() => {
    if (emAndamento.value) {
      iniciarTimer()
    }
  })

  onUnmounted(() => {
    pararTimer()
  })

  return {
    horaAtual,
    emAndamento,
    horasCalculadas,
    iniciarTimer,
    pararTimer
  }
}
