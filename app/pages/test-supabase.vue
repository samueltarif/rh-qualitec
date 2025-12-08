<template>
  <div class="min-h-screen bg-gray-50 p-8">
    <div class="max-w-4xl mx-auto">
      <!-- Header -->
      <div class="card mb-6">
        <h1 class="text-3xl font-bold text-gray-800 mb-2">
          Teste de Conexão Supabase
        </h1>
        <p class="text-gray-600">
          Sistema RH Qualitec - Verificação de Configuração
        </p>
      </div>

      <!-- Status da Conexão -->
      <div class="card mb-6">
        <h2 class="text-xl font-bold text-gray-800 mb-4">Status da Conexão</h2>
        
        <div class="space-y-3">
          <!-- URL -->
          <div class="flex items-center gap-3">
            <Icon 
              :name="supabaseUrl ? 'heroicons:check-circle' : 'heroicons:x-circle'" 
              :class="supabaseUrl ? 'text-green-500' : 'text-red-500'"
              size="24"
            />
            <div>
              <p class="font-medium text-gray-700">Supabase URL</p>
              <p class="text-sm text-gray-500">{{ supabaseUrl || 'Não configurado' }}</p>
            </div>
          </div>

          <!-- Anon Key -->
          <div class="flex items-center gap-3">
            <Icon 
              :name="supabaseKey ? 'heroicons:check-circle' : 'heroicons:x-circle'" 
              :class="supabaseKey ? 'text-green-500' : 'text-red-500'"
              size="24"
            />
            <div>
              <p class="font-medium text-gray-700">Anon Key</p>
              <p class="text-sm text-gray-500 font-mono">
                {{ supabaseKey ? supabaseKey.substring(0, 30) + '...' : 'Não configurado' }}
              </p>
            </div>
          </div>

          <!-- Cliente Supabase -->
          <div class="flex items-center gap-3">
            <Icon 
              :name="client ? 'heroicons:check-circle' : 'heroicons:x-circle'" 
              :class="client ? 'text-green-500' : 'text-red-500'"
              size="24"
            />
            <div>
              <p class="font-medium text-gray-700">Cliente Supabase</p>
              <p class="text-sm text-gray-500">
                {{ client ? 'Inicializado com sucesso' : 'Erro na inicialização' }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Teste de Conexão -->
      <div class="card mb-6">
        <h2 class="text-xl font-bold text-gray-800 mb-4">Teste de Conexão</h2>
        
        <button 
          @click="testConnection"
          :disabled="loading"
          class="employee-btn-primary mb-4"
        >
          <span v-if="loading">Testando...</span>
          <span v-else>Testar Conexão com Banco</span>
        </button>

        <!-- Resultado do Teste -->
        <div v-if="testResult" class="mt-4">
          <div 
            v-if="testResult.success" 
            class="bg-green-50 border border-green-200 rounded-lg p-4"
          >
            <div class="flex items-start gap-3">
              <Icon name="heroicons:check-circle" class="text-green-500 flex-shrink-0" size="24" />
              <div>
                <p class="font-medium text-green-800">Conexão bem-sucedida!</p>
                <p class="text-sm text-green-700 mt-1">{{ testResult.message }}</p>
                <pre v-if="testResult.data" class="mt-2 text-xs bg-green-100 p-2 rounded overflow-auto">{{ JSON.stringify(testResult.data, null, 2) }}</pre>
              </div>
            </div>
          </div>

          <div 
            v-else 
            class="bg-red-50 border border-red-200 rounded-lg p-4"
          >
            <div class="flex items-start gap-3">
              <Icon name="heroicons:x-circle" class="text-red-500 flex-shrink-0" size="24" />
              <div>
                <p class="font-medium text-red-800">Erro na conexão</p>
                <p class="text-sm text-red-700 mt-1">{{ testResult.message }}</p>
                <pre v-if="testResult.error" class="mt-2 text-xs bg-red-100 p-2 rounded overflow-auto">{{ testResult.error }}</pre>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Informações do Projeto -->
      <div class="card">
        <h2 class="text-xl font-bold text-gray-800 mb-4">Informações do Projeto</h2>
        
        <div class="grid md:grid-cols-2 gap-4">
          <div>
            <p class="text-sm text-gray-500">Projeto Supabase</p>
            <p class="font-mono text-sm text-gray-800">utuxefswedolrninwgvs</p>
          </div>
          <div>
            <p class="text-sm text-gray-500">Região</p>
            <p class="text-sm text-gray-800">supabase.co</p>
          </div>
          <div>
            <p class="text-sm text-gray-500">Módulo Nuxt</p>
            <p class="text-sm text-gray-800">@nuxtjs/supabase v1.4.0</p>
          </div>
          <div>
            <p class="text-sm text-gray-500">Cliente JS</p>
            <p class="text-sm text-gray-800">@supabase/supabase-js v2.45.0</p>
          </div>
        </div>
      </div>

      <!-- Voltar -->
      <div class="mt-6 text-center">
        <NuxtLink to="/" class="text-blue-600 hover:text-blue-800">
          ← Voltar para página inicial
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const client = useSupabaseClient()
const config = useRuntimeConfig()

const supabaseUrl = config.public.supabaseUrl
const supabaseKey = config.public.supabaseKey

const loading = ref(false)
const testResult = ref<{
  success: boolean
  message: string
  data?: any
  error?: any
} | null>(null)

const testConnection = async () => {
  loading.value = true
  testResult.value = null

  try {
    // Tenta fazer uma query simples para testar a conexão
    const { data, error } = await client
      .from('app_users')
      .select('count')
      .limit(1)

    if (error) {
      // Se a tabela não existe, ainda é uma conexão válida
      if (error.code === '42P01') {
        testResult.value = {
          success: true,
          message: 'Conexão estabelecida! A tabela "app_users" ainda não existe. Execute as migrations.',
          error: error.message
        }
      } else {
        testResult.value = {
          success: false,
          message: 'Erro ao conectar com o banco de dados',
          error: error.message
        }
      }
    } else {
      testResult.value = {
        success: true,
        message: 'Conexão estabelecida com sucesso! Banco de dados acessível.',
        data: data
      }
    }
  } catch (err: any) {
    testResult.value = {
      success: false,
      message: 'Erro ao testar conexão',
      error: err.message
    }
  } finally {
    loading.value = false
  }
}
</script>
