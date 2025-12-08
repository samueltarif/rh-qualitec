<template>
  <div v-if="error" class="min-h-screen bg-gray-50 flex items-center justify-center p-4">
    <div class="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
      <!-- Ícone de Erro -->
      <div class="flex justify-center mb-4">
        <div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
          <Icon name="heroicons:exclamation-triangle" class="text-red-600" size="32" />
        </div>
      </div>

      <!-- Título -->
      <h2 class="text-2xl font-bold text-gray-800 text-center mb-2">
        Ops! Algo deu errado
      </h2>

      <!-- Mensagem -->
      <p class="text-gray-600 text-center mb-6">
        {{ errorMessage }}
      </p>

      <!-- Detalhes (apenas em desenvolvimento) -->
      <div v-if="showDetails && isDevelopment" class="bg-gray-50 rounded p-4 mb-6">
        <p class="text-xs font-mono text-gray-700 break-all">
          {{ errorDetails }}
        </p>
      </div>

      <!-- Ações -->
      <div class="flex flex-col gap-3">
        <button
          @click="handleReload"
          class="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded transition-colors"
        >
          <Icon name="heroicons:arrow-path" size="16" class="inline mr-2" />
          Recarregar Página
        </button>

        <button
          @click="handleGoHome"
          class="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded transition-colors"
        >
          <Icon name="heroicons:home" size="16" class="inline mr-2" />
          Ir para Início
        </button>

        <button
          v-if="isDevelopment"
          @click="showDetails = !showDetails"
          class="w-full text-sm text-gray-600 hover:text-gray-800 transition-colors"
        >
          {{ showDetails ? 'Ocultar' : 'Mostrar' }} Detalhes Técnicos
        </button>
      </div>

      <!-- Informações de Suporte -->
      <div class="mt-6 pt-6 border-t border-gray-200 text-center">
        <p class="text-sm text-gray-500">
          Se o problema persistir, entre em contato com o suporte.
        </p>
        <p class="text-xs text-gray-400 mt-2">
          Código do erro: {{ errorCode }}
        </p>
      </div>
    </div>
  </div>

  <!-- Conteúdo normal quando não há erro -->
  <slot v-else />
</template>

<script setup lang="ts">
const props = defineProps<{
  error?: any
}>()

const showDetails = ref(false)
const isDevelopment = process.env.NODE_ENV === 'development'

const errorMessage = computed(() => {
  if (!props.error) return ''
  
  if (typeof props.error === 'string') return props.error
  if (props.error.message) return props.error.message
  if (props.error.statusMessage) return props.error.statusMessage
  
  return 'Ocorreu um erro inesperado. Por favor, tente novamente.'
})

const errorDetails = computed(() => {
  if (!props.error) return ''
  
  return JSON.stringify(props.error, null, 2)
})

const errorCode = computed(() => {
  if (!props.error) return 'UNKNOWN'
  
  const timestamp = new Date().getTime()
  const code = props.error.statusCode || props.error.status || 500
  
  return `ERR-${code}-${timestamp.toString().slice(-6)}`
})

const handleReload = () => {
  window.location.reload()
}

const handleGoHome = () => {
  window.location.href = '/'
}
</script>
