<template>
  <button
    @click="handleClick"
    :disabled="disabled || loading"
    :class="[
      'group relative overflow-hidden',
      'bg-gradient-to-r from-amber-500 to-amber-600',
      'hover:from-amber-400 hover:to-amber-500',
      'active:from-amber-600 active:to-amber-700',
      'text-slate-900 font-bold',
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
      class="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-30 transition-opacity duration-500"
      style="transform: translateX(-100%); animation: shine 2s infinite;"
    ></span>

    <!-- Ícone -->
    <div 
      :class="[
        'relative z-10 transition-transform duration-300',
        loading ? 'animate-pulse' : 'group-hover:rotate-12'
      ]"
    >
      <Icon 
        v-if="!loading"
        name="heroicons:hand-raised" 
        :size="iconSize"
        class="text-slate-900"
      />
      <Icon 
        v-else
        name="heroicons:arrow-path" 
        :size="iconSize"
        class="animate-spin text-slate-900"
      />
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
      <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-slate-900 opacity-40"></span>
      <span class="relative inline-flex rounded-full h-3 w-3 bg-slate-900"></span>
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

const iconSize = computed(() => {
  return props.size === 'sm' ? '18' : props.size === 'lg' ? '24' : '20'
})

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
