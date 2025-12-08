<template>
  <div 
    class="block p-4 rounded-xl border transition-all group relative cursor-pointer bg-gradient-to-br from-pink-600/20 to-pink-800/20 border-pink-500/30 hover:border-pink-400/50"
    @click="handleClick"
  >
    <!-- Badge de notificação para registros pendentes -->
    <span 
      v-if="registrosPendentes > 0" 
      class="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse"
    >
      {{ registrosPendentes > 99 ? '99+' : registrosPendentes }}
    </span>

    <!-- Ícone com animação de pulso se houver ação pendente -->
    <div class="relative mb-2">
      <Icon 
        name="heroicons:clock" 
        class="text-pink-400 group-hover:scale-110 transition-transform" 
        size="28" 
      />
      <span 
        v-if="podeRegistrar" 
        class="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse"
      />
    </div>

    <!-- Label e status -->
    <div>
      <p class="text-white font-medium">Ponto</p>
      <p v-if="ultimoRegistro" class="text-xs text-pink-300 mt-1">
        {{ statusTexto }}
      </p>
    </div>

    <!-- Indicador de horário -->
    <div v-if="mostrarHorario" class="mt-2 pt-2 border-t border-pink-500/20">
      <p class="text-xs text-pink-200 font-mono">
        {{ horarioAtual }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'

interface Props {
  registrosPendentes?: number
  ultimoRegistro?: {
    tipo: 'entrada' | 'saida' | 'intervalo_inicio' | 'intervalo_fim'
    horario: string
  } | null
  mostrarHorario?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  registrosPendentes: 0,
  ultimoRegistro: null,
  mostrarHorario: true
})

const emit = defineEmits<{
  click: []
}>()

const horarioAtual = ref('')
let intervalId: NodeJS.Timeout | null = null

// Atualiza o horário atual
const atualizarHorario = () => {
  const agora = new Date()
  horarioAtual.value = agora.toLocaleTimeString('pt-BR', { 
    hour: '2-digit', 
    minute: '2-digit',
    second: '2-digit'
  })
}

// Verifica se pode registrar ponto (baseado no último registro)
const podeRegistrar = computed(() => {
  if (!props.ultimoRegistro) return true
  
  // Lógica: se o último foi entrada ou intervalo_inicio, pode registrar saída
  return ['entrada', 'intervalo_inicio'].includes(props.ultimoRegistro.tipo)
})

// Texto de status baseado no último registro
const statusTexto = computed(() => {
  if (!props.ultimoRegistro) return 'Nenhum registro hoje'
  
  const tipos: Record<string, string> = {
    entrada: 'Entrada registrada',
    saida: 'Saída registrada',
    intervalo_inicio: 'Em intervalo',
    intervalo_fim: 'Retornou do intervalo'
  }
  
  return tipos[props.ultimoRegistro.tipo] || 'Último registro'
})

const handleClick = () => {
  emit('click')
  // Navega para a página de ponto
  navigateTo('/ponto')
}

onMounted(() => {
  if (props.mostrarHorario) {
    atualizarHorario()
    intervalId = setInterval(atualizarHorario, 1000)
  }
})

onUnmounted(() => {
  if (intervalId) {
    clearInterval(intervalId)
  }
})
</script>
