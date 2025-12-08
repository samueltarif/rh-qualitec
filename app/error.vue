<template>
  <div class="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
    <div class="max-w-2xl w-full">
      <!-- Card Principal -->
      <div class="bg-white rounded-2xl shadow-2xl overflow-hidden">
        <!-- Header com Gradiente -->
        <div class="bg-gradient-to-r from-red-600 to-orange-600 p-8 text-white">
          <div class="flex items-center justify-center mb-4">
            <div class="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
              <Icon 
                :name="errorIcon" 
                class="text-white" 
                size="40" 
              />
            </div>
          </div>
          <h1 class="text-4xl font-bold text-center mb-2">
            {{ errorTitle }}
          </h1>
          <p class="text-center text-red-100">
            {{ errorSubtitle }}
          </p>
        </div>

        <!-- Conteúdo -->
        <div class="p-8">
          <!-- Mensagem Principal -->
          <div class="bg-gray-50 rounded-lg p-6 mb-6">
            <p class="text-gray-700 text-center text-lg">
              {{ errorMessage }}
            </p>
          </div>

          <!-- Sugestões -->
          <div class="mb-6">
            <h3 class="font-semibold text-gray-800 mb-3">O que você pode fazer:</h3>
            <ul class="space-y-2">
              <li class="flex items-start gap-2 text-gray-600">
                <Icon name="heroicons:check-circle" class="text-green-600 mt-0.5" size="20" />
                <span>Verifique sua conexão com a internet</span>
              </li>
              <li class="flex items-start gap-2 text-gray-600">
                <Icon name="heroicons:check-circle" class="text-green-600 mt-0.5" size="20" />
                <span>Tente recarregar a página</span>
              </li>
              <li class="flex items-start gap-2 text-gray-600">
                <Icon name="heroicons:check-circle" class="text-green-600 mt-0.5" size="20" />
                <span>Volte para a página inicial</span>
              </li>
              <li v-if="error.statusCode === 401" class="flex items-start gap-2 text-gray-600">
                <Icon name="heroicons:check-circle" class="text-green-600 mt-0.5" size="20" />
                <span>Faça login novamente</span>
              </li>
            </ul>
          </div>

          <!-- Detalhes Técnicos (Desenvolvimento) -->
          <div v-if="isDevelopment" class="mb-6">
            <button
              @click="showDetails = !showDetails"
              class="text-sm text-gray-600 hover:text-gray-800 flex items-center gap-2 mb-2"
            >
              <Icon 
                :name="showDetails ? 'heroicons:chevron-down' : 'heroicons:chevron-right'" 
                size="16" 
              />
              Detalhes Técnicos
            </button>
            
            <div v-if="showDetails" class="bg-gray-900 rounded-lg p-4 overflow-auto max-h-64">
              <pre class="text-xs text-green-400 font-mono">{{ errorDetails }}</pre>
            </div>
          </div>

          <!-- Ações -->
          <div class="flex flex-col sm:flex-row gap-3">
            <button
              @click="handleError"
              class="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <Icon name="heroicons:arrow-path" size="20" />
              Recarregar Página
            </button>

            <NuxtLink
              to="/"
              class="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <Icon name="heroicons:home" size="20" />
              Página Inicial
            </NuxtLink>
          </div>

          <!-- Informações de Suporte -->
          <div class="mt-8 pt-6 border-t border-gray-200 text-center">
            <p class="text-sm text-gray-600 mb-2">
              Precisa de ajuda? Entre em contato com o suporte.
            </p>
            <div class="flex items-center justify-center gap-4 text-xs text-gray-500">
              <span>Código: {{ errorCode }}</span>
              <span>•</span>
              <span>{{ timestamp }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  error: any
}>()

const showDetails = ref(false)
const isDevelopment = process.env.NODE_ENV === 'development'

const errorIcon = computed(() => {
  const code = props.error?.statusCode || 500
  
  if (code === 404) return 'heroicons:magnifying-glass'
  if (code === 401) return 'heroicons:lock-closed'
  if (code === 403) return 'heroicons:shield-exclamation'
  if (code >= 500) return 'heroicons:server'
  
  return 'heroicons:exclamation-triangle'
})

const errorTitle = computed(() => {
  const code = props.error?.statusCode || 500
  
  if (code === 404) return 'Página Não Encontrada'
  if (code === 401) return 'Não Autorizado'
  if (code === 403) return 'Acesso Negado'
  if (code >= 500) return 'Erro no Servidor'
  
  return 'Erro'
})

const errorSubtitle = computed(() => {
  const code = props.error?.statusCode || 500
  
  if (code === 404) return 'A página que você procura não existe'
  if (code === 401) return 'Você precisa fazer login'
  if (code === 403) return 'Você não tem permissão para acessar'
  if (code >= 500) return 'Algo deu errado no servidor'
  
  return 'Ocorreu um problema'
})

const errorMessage = computed(() => {
  if (props.error?.message) return props.error.message
  if (props.error?.statusMessage) return props.error.statusMessage
  
  return 'Desculpe, encontramos um problema ao processar sua solicitação.'
})

const errorDetails = computed(() => {
  return JSON.stringify({
    statusCode: props.error?.statusCode,
    message: props.error?.message,
    stack: props.error?.stack,
    url: props.error?.url,
  }, null, 2)
})

const errorCode = computed(() => {
  const code = props.error?.statusCode || 500
  const timestamp = new Date().getTime()
  return `ERR-${code}-${timestamp.toString().slice(-8)}`
})

const timestamp = computed(() => {
  return new Date().toLocaleString('pt-BR')
})

const handleError = () => clearError({ redirect: '/' })
</script>
