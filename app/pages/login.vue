<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
    <div class="max-w-md w-full">
      <!-- Card de Login -->
      <div class="card shadow-xl">
        <!-- Logo/Header -->
        <div class="text-center mb-8">
          <div class="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-900 to-blue-700 rounded-2xl mb-4 shadow-lg">
            <Icon name="heroicons:building-office-2" class="text-white" size="40" />
          </div>
          <h1 class="text-3xl font-bold text-gray-800 mb-2">Sistema RH Qualitec</h1>
          <p class="text-gray-600">Faça login para continuar</p>
        </div>

        <!-- Mensagem de Sucesso (se houver) -->
        <div v-if="successMessage" class="mb-4 bg-green-50 border border-green-200 rounded-lg p-3 animate-fade-in">
          <div class="flex items-start gap-2">
            <Icon name="heroicons:check-circle" class="text-green-500 flex-shrink-0 mt-0.5" size="20" />
            <p class="text-sm text-green-700">{{ successMessage }}</p>
          </div>
        </div>

        <!-- Formulário -->
        <form @submit.prevent="handleLogin" class="space-y-5">
          <!-- Email -->
          <UIInput
            id="email"
            ref="emailInput"
            v-model="credentials.email"
            type="email"
            label="Email"
            placeholder="seu@email.com"
            icon-left="heroicons:envelope"
            autocomplete="email"
            required
            :disabled="isLoading"
            @enter="handleLogin"
          />

          <!-- Senha -->
          <UIInput
            id="password"
            v-model="credentials.password"
            type="password"
            label="Senha"
            placeholder="••••••••"
            icon-left="heroicons:lock-closed"
            autocomplete="current-password"
            required
            :disabled="isLoading"
            :error="error"
            @enter="handleLogin"
          />

          <!-- Botão de Login -->
          <LoginButton :disabled="!credentials.email || !credentials.password" />
        </form>

        <!-- Credenciais de Teste -->
        <div class="mt-6 pt-6 border-t border-gray-200">
          <div class="flex items-center justify-center gap-2 mb-3">
            <Icon name="heroicons:information-circle" class="text-gray-400" size="16" />
            <p class="text-xs text-gray-500 font-medium">Credenciais de teste</p>
          </div>
          <div class="space-y-2">
            <button
              type="button"
              @click="fillCredentials('admin')"
              class="w-full bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg p-3 text-left transition-colors"
              :disabled="isLoading"
            >
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-xs font-semibold text-red-800 mb-1">👑 Admin</p>
                  <p class="text-xs text-red-600 font-mono">silvana@qualitec.ind.br</p>
                </div>
                <Icon name="heroicons:arrow-right" class="text-red-400" size="16" />
              </div>
            </button>
          </div>
          <p class="text-xs text-gray-400 text-center mt-3">
            Clique para preencher automaticamente
          </p>
        </div>
      </div>

      <!-- Links -->
      <div class="text-center mt-6 space-y-2">
        <NuxtLink to="/" class="text-sm text-blue-600 hover:text-blue-800 font-medium inline-flex items-center gap-1 transition-colors">
          <Icon name="heroicons:arrow-left" size="16" />
          Voltar para página inicial
        </NuxtLink>
      </div>

      <!-- Footer -->
      <div class="text-center mt-8">
        <p class="text-xs text-gray-400">
          © 2025 Qualitec Indústria Ltda. Todos os direitos reservados.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: false, // Sem layout
})

const { login, isLoading, error, clearError } = useAppAuth()

const credentials = ref({
  email: '',
  password: ''
})

const showPassword = ref(false)
const successMessage = ref('')
const emailInput = ref<any>(null)

// Focar no input de email ao montar - removido pois UIInput é um componente

// Limpar erro quando usuário digitar
watch(credentials, () => {
  if (error.value) {
    clearError()
  }
  if (successMessage.value) {
    successMessage.value = ''
  }
}, { deep: true })

// Preencher credenciais de teste
const fillCredentials = (type: 'admin') => {
  if (type === 'admin') {
    credentials.value.email = 'silvana@qualitec.ind.br'
    credentials.value.password = 'qualitec25'
  }
  
  // Focar no botão de login após preencher
  setTimeout(() => {
    const loginButton = document.querySelector('button[type="submit"]') as HTMLButtonElement
    loginButton?.focus()
  }, 100)
}

// Fazer login
const handleLogin = async () => {
  if (!credentials.value.email || !credentials.value.password) {
    return
  }
  
  clearError()
  await login(credentials.value)
}

// Atalhos de teclado
const handleKeydown = (event: KeyboardEvent) => {
  // Ctrl/Cmd + K para preencher admin
  if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
    event.preventDefault()
    fillCredentials('admin')
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
  // Focar no primeiro input após montar
  nextTick(() => {
    const firstInput = document.querySelector('input[type="email"]') as HTMLInputElement
    firstInput?.focus()
  })
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
})
</script>

<style scoped>
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
  20%, 40%, 60%, 80% { transform: translateX(5px); }
}

@keyframes fade-in {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}

.animate-shake {
  animation: shake 0.5s ease-in-out;
}

.animate-fade-in {
  animation: fade-in 0.3s ease-out;
}
</style>
