<template>
  <div
    class="toast-item relative min-w-[320px] max-w-md rounded-lg shadow-2xl overflow-hidden backdrop-blur-sm"
    :class="toastClasses"
    @click="handleClick"
  >
    <!-- Barra de progresso -->
    <div
      v-if="toast.duration && toast.duration > 0"
      class="absolute top-0 left-0 h-1 bg-current opacity-40 transition-all ease-linear"
      :style="{ width: `${progress}%` }"
    />

    <div class="flex items-start gap-3 p-4">
      <!-- Ícone -->
      <div class="flex-shrink-0 mt-0.5">
        <component :is="iconComponent" class="w-6 h-6" />
      </div>

      <!-- Conteúdo -->
      <div class="flex-1 min-w-0">
        <h4 class="font-semibold text-sm leading-tight mb-1">
          {{ toast.title }}
        </h4>
        <p v-if="toast.message" class="text-sm opacity-90 leading-snug">
          {{ toast.message }}
        </p>
      </div>

      <!-- Botão fechar -->
      <button
        @click.stop="$emit('close')"
        class="flex-shrink-0 p-1 rounded-md hover:bg-black/10 transition-colors"
        aria-label="Fechar notificação"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Toast } from '~/composables/useToast'

interface Props {
  toast: Toast
}

const props = defineProps<Props>()
const emit = defineEmits<{
  close: []
}>()

const progress = ref(100)
let progressInterval: NodeJS.Timeout | null = null

// Ícones para cada tipo
const iconComponent = computed(() => {
  switch (props.toast.type) {
    case 'success':
      return defineComponent({
        template: `
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        `
      })
    case 'error':
      return defineComponent({
        template: `
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        `
      })
    case 'warning':
      return defineComponent({
        template: `
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        `
      })
    case 'info':
      return defineComponent({
        template: `
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        `
      })
  }
})

// Classes de estilo baseadas no tipo
const toastClasses = computed(() => {
  const baseClasses = 'border-l-4'
  
  switch (props.toast.type) {
    case 'success':
      return `${baseClasses} bg-emerald-50 border-emerald-500 text-emerald-900`
    case 'error':
      return `${baseClasses} bg-red-50 border-red-500 text-red-900`
    case 'warning':
      return `${baseClasses} bg-amber-50 border-amber-500 text-amber-900`
    case 'info':
      return `${baseClasses} bg-blue-50 border-blue-500 text-blue-900`
    default:
      return `${baseClasses} bg-gray-50 border-gray-500 text-gray-900`
  }
})

// Animação da barra de progresso
onMounted(() => {
  if (props.toast.duration && props.toast.duration > 0) {
    const startTime = Date.now()
    const duration = props.toast.duration

    progressInterval = setInterval(() => {
      const elapsed = Date.now() - startTime
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100)
      progress.value = remaining

      if (remaining === 0 && progressInterval) {
        clearInterval(progressInterval)
      }
    }, 50)
  }
})

onUnmounted(() => {
  if (progressInterval) {
    clearInterval(progressInterval)
  }
})

// Fechar ao clicar fora (opcional)
const handleClick = (e: MouseEvent) => {
  // Você pode adicionar lógica aqui se quiser fechar ao clicar no toast
}
</script>

<style scoped>
.toast-item {
  transition: all 0.2s ease;
}

.toast-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}
</style>
