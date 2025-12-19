<template>
  <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-lg font-semibold text-gray-900 flex items-center">
        <Icon name="heroicons:cpu-chip" class="w-5 h-5 mr-2 text-blue-600" />
        Status do Sistema
      </h3>
      <button 
        @click="refreshStatus"
        :disabled="loading"
        class="text-sm text-blue-600 hover:text-blue-800 disabled:opacity-50"
      >
        <Icon name="heroicons:arrow-path" :class="{ 'animate-spin': loading }" class="w-4 h-4" />
      </button>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <!-- Status Geral -->
      <div class="flex items-center p-3 rounded-lg" :class="statusColor">
        <div class="flex-shrink-0">
          <Icon :name="statusIcon" class="w-6 h-6" />
        </div>
        <div class="ml-3">
          <p class="text-sm font-medium">Sistema</p>
          <p class="text-xs opacity-75">{{ systemStatus }}</p>
        </div>
      </div>

      <!-- Database -->
      <div class="flex items-center p-3 rounded-lg" :class="dbColor">
        <div class="flex-shrink-0">
          <Icon :name="dbIcon" class="w-6 h-6" />
        </div>
        <div class="ml-3">
          <p class="text-sm font-medium">Database</p>
          <p class="text-xs opacity-75">{{ dbStatus }}</p>
        </div>
      </div>

      <!-- Email -->
      <div class="flex items-center p-3 rounded-lg" :class="emailColor">
        <div class="flex-shrink-0">
          <Icon :name="emailIcon" class="w-6 h-6" />
        </div>
        <div class="ml-3">
          <p class="text-sm font-medium">Email</p>
          <p class="text-xs opacity-75">{{ emailStatus }}</p>
        </div>
      </div>

      <!-- Performance -->
      <div class="flex items-center p-3 rounded-lg bg-gray-50 text-gray-700">
        <div class="flex-shrink-0">
          <Icon name="heroicons:clock" class="w-6 h-6" />
        </div>
        <div class="ml-3">
          <p class="text-sm font-medium">Performance</p>
          <p class="text-xs opacity-75">{{ responseTime }}ms</p>
        </div>
      </div>
    </div>

    <!-- Detalhes Técnicos -->
    <div v-if="showDetails" class="mt-4 pt-4 border-t border-gray-200">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
        <div>
          <h4 class="font-medium text-gray-900 mb-2">Ambiente</h4>
          <ul class="space-y-1 text-gray-600">
            <li>Runtime: {{ runtimeInfo.runtime }}</li>
            <li>Região: {{ runtimeInfo.region }}</li>
            <li>Versão: {{ runtimeInfo.version }}</li>
          </ul>
        </div>
        <div>
          <h4 class="font-medium text-gray-900 mb-2">Últimas Verificações</h4>
          <ul class="space-y-1 text-gray-600">
            <li>Database: {{ formatTime(lastChecks.database) }}</li>
            <li>Email: {{ formatTime(lastChecks.email) }}</li>
            <li>Sistema: {{ formatTime(lastChecks.system) }}</li>
          </ul>
        </div>
      </div>
    </div>

    <div class="mt-4 flex justify-between items-center">
      <button 
        @click="showDetails = !showDetails"
        class="text-sm text-gray-500 hover:text-gray-700"
      >
        {{ showDetails ? 'Ocultar' : 'Mostrar' }} detalhes
      </button>
      <p class="text-xs text-gray-400">
        Última atualização: {{ formatTime(lastUpdate) }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
interface SystemHealth {
  system: 'healthy' | 'warning' | 'error'
  database: 'healthy' | 'warning' | 'error'
  email: 'healthy' | 'warning' | 'error'
  responseTime: number
}

const loading = ref(false)
const showDetails = ref(false)
const lastUpdate = ref(new Date())

const health = ref<SystemHealth>({
  system: 'healthy',
  database: 'healthy',
  email: 'warning',
  responseTime: 0
})

const lastChecks = ref({
  system: new Date(),
  database: new Date(),
  email: new Date()
})

const runtimeInfo = ref({
  runtime: 'Node.js',
  region: 'São Paulo',
  version: '2025.1'
})

// Computed properties para status
const systemStatus = computed(() => {
  switch (health.value.system) {
    case 'healthy': return 'Operacional'
    case 'warning': return 'Atenção'
    case 'error': return 'Erro'
    default: return 'Desconhecido'
  }
})

const dbStatus = computed(() => {
  switch (health.value.database) {
    case 'healthy': return 'Conectado'
    case 'warning': return 'Lento'
    case 'error': return 'Desconectado'
    default: return 'Desconhecido'
  }
})

const emailStatus = computed(() => {
  switch (health.value.email) {
    case 'healthy': return 'Configurado'
    case 'warning': return 'Não configurado'
    case 'error': return 'Erro'
    default: return 'Desconhecido'
  }
})

const responseTime = computed(() => health.value.responseTime)

// Computed properties para cores
const statusColor = computed(() => {
  switch (health.value.system) {
    case 'healthy': return 'bg-green-50 text-green-700'
    case 'warning': return 'bg-yellow-50 text-yellow-700'
    case 'error': return 'bg-red-50 text-red-700'
    default: return 'bg-gray-50 text-gray-700'
  }
})

const dbColor = computed(() => {
  switch (health.value.database) {
    case 'healthy': return 'bg-green-50 text-green-700'
    case 'warning': return 'bg-yellow-50 text-yellow-700'
    case 'error': return 'bg-red-50 text-red-700'
    default: return 'bg-gray-50 text-gray-700'
  }
})

const emailColor = computed(() => {
  switch (health.value.email) {
    case 'healthy': return 'bg-green-50 text-green-700'
    case 'warning': return 'bg-yellow-50 text-yellow-700'
    case 'error': return 'bg-red-50 text-red-700'
    default: return 'bg-gray-50 text-gray-700'
  }
})

// Computed properties para ícones
const statusIcon = computed(() => {
  switch (health.value.system) {
    case 'healthy': return 'heroicons:check-circle'
    case 'warning': return 'heroicons:exclamation-triangle'
    case 'error': return 'heroicons:x-circle'
    default: return 'heroicons:question-mark-circle'
  }
})

const dbIcon = computed(() => {
  switch (health.value.database) {
    case 'healthy': return 'heroicons:circle-stack'
    case 'warning': return 'heroicons:exclamation-triangle'
    case 'error': return 'heroicons:x-circle'
    default: return 'heroicons:circle-stack'
  }
})

const emailIcon = computed(() => {
  switch (health.value.email) {
    case 'healthy': return 'heroicons:envelope'
    case 'warning': return 'heroicons:envelope-open'
    case 'error': return 'heroicons:x-circle'
    default: return 'heroicons:envelope'
  }
})

// Funções
const formatTime = (date: Date) => {
  return date.toLocaleTimeString('pt-BR', { 
    hour: '2-digit', 
    minute: '2-digit' 
  })
}

const checkSystemHealth = async () => {
  const startTime = Date.now()
  
  try {
    // Verificar database
    const dbResponse = await $fetch('/api/dashboard/stats')
    health.value.database = 'healthy'
    lastChecks.value.database = new Date()
    
    // Verificar email (se configurado)
    try {
      await $fetch('/api/email/smtp')
      health.value.email = 'healthy'
    } catch {
      health.value.email = 'warning'
    }
    lastChecks.value.email = new Date()
    
    // Calcular tempo de resposta
    health.value.responseTime = Date.now() - startTime
    
    // Status geral
    health.value.system = 'healthy'
    lastChecks.value.system = new Date()
    
  } catch (error) {
    console.error('Erro ao verificar saúde do sistema:', error)
    health.value.system = 'error'
    health.value.database = 'error'
    health.value.responseTime = Date.now() - startTime
  }
  
  lastUpdate.value = new Date()
}

const refreshStatus = async () => {
  loading.value = true
  try {
    await checkSystemHealth()
  } finally {
    loading.value = false
  }
}

// Verificar status ao montar o componente
onMounted(() => {
  checkSystemHealth()
  
  // Verificar a cada 5 minutos
  setInterval(checkSystemHealth, 5 * 60 * 1000)
})
</script>