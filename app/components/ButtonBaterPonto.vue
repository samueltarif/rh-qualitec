<template>
  <button
    @click="handleClick"
    :disabled="disabled || loading"
    :class="[
      'group relative overflow-hidden',
      'bg-gradient-to-r from-orange-500 to-orange-600',
      'hover:from-orange-600 hover:to-orange-700',
      'active:from-orange-700 active:to-orange-800',
      'text-white font-semibold',
      'px-8 py-4 rounded-xl',
      'shadow-lg hover:shadow-xl',
      'transition-all duration-300',
      'flex items-center justify-center space-x-3',
      'disabled:opacity-50 disabled:cursor-not-allowed',
      'transform hover:scale-105 active:scale-95',
      sizeClasses[size]
    ]"
  >
    <!-- Efeito de brilho animado -->
    <span 
      class="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-20 transition-opacity duration-500"
      style="transform: translateX(-100%); animation: shine 2s infinite;"
    ></span>

    <!-- Ícone de impressão digital -->
    <div 
      :class="[
        'relative z-10 rounded-full p-2',
        'bg-white/20 backdrop-blur-sm',
        'transition-transform duration-300',
        loading ? 'animate-pulse' : 'group-hover:rotate-12'
      ]"
    >
      <svg 
        v-if="!loading"
        class="w-6 h-6" 
        fill="currentColor" 
        viewBox="0 0 24 24"
      >
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/>
      </svg>
      <svg 
        v-else
        class="w-6 h-6 animate-spin" 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
      </svg>
    </div>

    <!-- Texto do botão -->
    <span class="relative z-10 text-lg font-bold tracking-wide">
      {{ loading ? textoCarregando : texto }}
    </span>

    <!-- Indicador de pulso -->
    <span 
      v-if="mostrarPulso && !loading"
      class="absolute top-2 right-2 flex h-3 w-3"
    >
      <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
      <span class="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
    </span>
  </button>
</template>

<script setup lang="ts">
interface Props {
  texto?: string
  textoCarregando?: string
  loading?: boolean
  disabled?: boolean
  mostrarPulso?: boolean
  size?: 'sm' | 'md' | 'lg'
}

const props = withDefaults(defineProps<Props>(), {
  texto: 'Bater Ponto',
  textoCarregando: 'Registrando...',
  loading: false,
  disabled: false,
  mostrarPulso: true,
  size: 'md'
})

const emit = defineEmits<{
  click: []
}>()

const sizeClasses = {
  sm: 'px-6 py-3 text-base',
  md: 'px-8 py-4 text-lg',
  lg: 'px-10 py-5 text-xl'
}

const handleClick = () => {
  if (!props.disabled && !props.loading) {
    emit('click')
  }
}
</script>

<style scoped>
@keyframes shine {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}

button:active {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}
</style>
