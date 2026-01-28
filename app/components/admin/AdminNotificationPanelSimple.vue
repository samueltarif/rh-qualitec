<template>
  <div class="space-y-1">
    <div class="p-4 text-center">
      <button @click="testarAPI" class="bg-blue-500 text-white px-4 py-2 rounded mb-4">
        🔄 Testar API
      </button>
      <div v-if="debugInfo" class="text-xs text-left bg-gray-100 p-2 rounded">
        <pre>{{ debugInfo }}</pre>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="pending" class="p-4 text-center">
      <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
      <p class="text-sm text-gray-500 mt-2">Carregando notificações...</p>
    </div>

    <!-- Debug Info -->
    <div class="p-4 bg-yellow-50 border border-yellow-200 rounded">
      <p class="text-xs text-yellow-800">
        <strong>Debug:</strong><br>
        Response: {{ response }}<br>
        Notificações: {{ notificacoes?.length || 0 }}<br>
        Pending: {{ pending }}
      </p>
    </div>

    <!-- Empty State -->
    <div v-if="!pending && (!notificacoes || notificacoes.length === 0)" class="p-8 text-center">
      <div class="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
        <span class="text-gray-400 text-lg">🔔</span>
      </div>
      <p class="text-sm text-gray-500">Nenhuma notificação no momento</p>
    </div>

    <!-- Notificações -->
    <div v-else-if="notificacoes && notificacoes.length > 0">
      <div 
        v-for="notificacao in notificacoes" 
        :key="notificacao.id"
        class="p-4 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
        :class="{ 'bg-blue-50': !notificacao.lida }"
      >
        <div class="flex items-start gap-3">
          <div class="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-blue-100">
            <span class="text-blue-600 text-sm">🔔</span>
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium text-gray-900">{{ notificacao.titulo }}</p>
            <p class="text-xs text-gray-600 mt-1">{{ notificacao.mensagem }}</p>
            <p class="text-xs text-gray-400 mt-1">{{ formatarTempo(notificacao.created_at) }}</p>
          </div>
          <div v-if="!notificacao.lida" class="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const debugInfo = ref('')
const response = ref(null)
const pending = ref(false)
const notificacoes = ref([])

const testarAPI = async () => {
  try {
    pending.value = true
    debugInfo.value = 'Fazendo requisição...'
    
    const result = await $fetch('/api/notificacoes?limite=5')
    
    response.value = result
    notificacoes.value = result?.notificacoes || []
    
    debugInfo.value = JSON.stringify(result, null, 2)
    
  } catch (error) {
    debugInfo.value = 'Erro: ' + error.message
  } finally {
    pending.value = false
  }
}

const formatarTempo = (data: string) => {
  const agora = new Date()
  const dataNotificacao = new Date(data)
  const diffMs = agora.getTime() - dataNotificacao.getTime()
  const diffHoras = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDias = Math.floor(diffHoras / 24)
  
  if (diffDias > 0) {
    return `Há ${diffDias} dia${diffDias > 1 ? 's' : ''}`
  } else if (diffHoras > 0) {
    return `Há ${diffHoras} hora${diffHoras > 1 ? 's' : ''}`
  } else {
    return 'Agora mesmo'
  }
}

// Carregar automaticamente
onMounted(() => {
  testarAPI()
})
</script>