<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <header class="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div class="max-w-7xl mx-auto px-8 py-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-4">
            <NuxtLink to="/configuracoes" class="w-10 h-10 bg-red-700 rounded-lg flex items-center justify-center hover:bg-red-800 transition-colors">
              <Icon name="heroicons:arrow-left" class="text-white" size="20" />
            </NuxtLink>
            <div>
              <h1 class="text-xl font-bold text-gray-800">Integrações</h1>
              <p class="text-sm text-gray-500">APIs externas, contabilidade, bancos e mais</p>
            </div>
          </div>
          <UserProfileDropdown theme="admin" />
        </div>
      </div>
    </header>

    <!-- Content -->
    <div class="max-w-7xl mx-auto p-8">
      <!-- Stats Cards -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div class="card bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <div class="flex items-center gap-3">
            <Icon name="heroicons:arrow-path" size="32" class="opacity-80" />
            <div>
              <p class="text-2xl font-bold">{{ stats.sincronizacoes.total }}</p>
              <p class="text-sm opacity-80">Sincronizações (30d)</p>
            </div>
          </div>
        </div>
        <div class="card bg-gradient-to-br from-green-500 to-green-600 text-white">
          <div class="flex items-center gap-3">
            <Icon name="heroicons:document-text" size="32" class="opacity-80" />
            <div>
              <p class="text-2xl font-bold">{{ stats.cnabs.total }}</p>
              <p class="text-sm opacity-80">Arquivos CNAB</p>
            </div>
          </div>
        </div>
        <div class="card bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <div class="flex items-center gap-3">
            <Icon name="heroicons:envelope" size="32" class="opacity-80" />
            <div>
              <p class="text-2xl font-bold">{{ stats.emails.enviados }}</p>
              <p class="text-sm opacity-80">Emails Enviados</p>
            </div>
          </div>
        </div>
        <div class="card bg-gradient-to-br from-amber-500 to-amber-600 text-white">
          <div class="flex items-center gap-3">
            <Icon name="heroicons:document-check" size="32" class="opacity-80" />
            <div>
              <p class="text-2xl font-bold">{{ stats.esocial.total }}</p>
              <p class="text-sm opacity-80">Eventos eSocial</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Tabs -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
        <div class="flex border-b border-gray-200 overflow-x-auto">
          <button
            @click="abaAtiva = 'geral'"
            class="px-6 py-3 font-medium transition-colors whitespace-nowrap"
            :class="abaAtiva === 'geral' ? 'text-red-700 border-b-2 border-red-700' : 'text-gray-500 hover:text-gray-700'"
          >
            <Icon name="heroicons:cog-6-tooth" class="inline mr-2" />
            Geral
          </button>
          <button
            @click="abaAtiva = 'contabilidade'"
            class="px-6 py-3 font-medium transition-colors whitespace-nowrap"
            :class="abaAtiva === 'contabilidade' ? 'text-red-700 border-b-2 border-red-700' : 'text-gray-500 hover:text-gray-700'"
          >
            <Icon name="heroicons:calculator" class="inline mr-2" />
            Contabilidade
          </button>
          <button
            @click="abaAtiva = 'bancos'"
            class="px-6 py-3 font-medium transition-colors whitespace-nowrap"
            :class="abaAtiva === 'bancos' ? 'text-red-700 border-b-2 border-red-700' : 'text-gray-500 hover:text-gray-700'"
          >
            <Icon name="heroicons:banknotes" class="inline mr-2" />
            Bancos/CNAB
          </button>
          <button
            @click="abaAtiva = 'email'"
            class="px-6 py-3 font-medium transition-colors whitespace-nowrap"
            :class="abaAtiva === 'email' ? 'text-red-700 border-b-2 border-red-700' : 'text-gray-500 hover:text-gray-700'"
          >
            <Icon name="heroicons:envelope" class="inline mr-2" />
            Email/SMTP
          </button>
          <button
            @click="abaAtiva = 'logs'"
            class="px-6 py-3 font-medium transition-colors whitespace-nowrap"
            :class="abaAtiva === 'logs' ? 'text-red-700 border-b-2 border-red-700' : 'text-gray-500 hover:text-gray-700'"
          >
            <Icon name="heroicons:document-text" class="inline mr-2" />
            Logs
          </button>
        </div>
      </div>

      <!-- Aba Geral -->
      <div v-if="abaAtiva === 'geral'" class="space-y-6">
        <div class="card">
          <h3 class="text-lg font-semibold text-gray-800 mb-4">Status das Integrações</h3>
          <div class="grid md:grid-cols-2 gap-4">
            <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div class="flex items-center gap-3">
                <Icon name="heroicons:calculator" class="text-blue-600" size="24" />
                <span class="font-medium">Contabilidade</span>
              </div>
              <span class="px-3 py-1 rounded-full text-sm" :class="config.contabilidade_ativa ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'">
                {{ config.contabilidade_ativa ? 'Ativa' : 'Inativa' }}
              </span>
            </div>
            <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div class="flex items-center gap-3">
                <Icon name="heroicons:document-check" class="text-purple-600" size="24" />
                <span class="font-medium">eSocial</span>
              </div>
              <span class="px-3 py-1 rounded-full text-sm" :class="config.esocial_ativo ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'">
                {{ config.esocial_ativo ? 'Ativo' : 'Inativo' }}
              </span>
            </div>
            <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div class="flex items-center gap-3">
                <Icon name="heroicons:banknotes" class="text-green-600" size="24" />
                <span class="font-medium">Banco/CNAB</span>
              </div>
              <span class="px-3 py-1 rounded-full text-sm" :class="config.banco_pagamento_ativo ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'">
                {{ config.banco_pagamento_ativo ? 'Ativo' : 'Inativo' }}
              </span>
            </div>
            <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div class="flex items-center gap-3">
                <Icon name="heroicons:clock" class="text-amber-600" size="24" />
                <span class="font-medium">Ponto Eletrônico</span>
              </div>
              <span class="px-3 py-1 rounded-full text-sm" :class="config.ponto_ativo ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'">
                {{ config.ponto_ativo ? 'Ativo' : 'Inativo' }}
              </span>
            </div>
            <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div class="flex items-center gap-3">
                <Icon name="heroicons:envelope" class="text-red-600" size="24" />
                <span class="font-medium">Email/SMTP</span>
              </div>
              <span class="px-3 py-1 rounded-full text-sm" :class="config.smtp_ativo ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'">
                {{ config.smtp_ativo ? 'Ativo' : 'Inativo' }}
              </span>
            </div>
            <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div class="flex items-center gap-3">
                <Icon name="heroicons:chat-bubble-left-right" class="text-green-600" size="24" />
                <span class="font-medium">WhatsApp</span>
              </div>
              <span class="px-3 py-1 rounded-full text-sm" :class="config.whatsapp_ativo ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'">
                {{ config.whatsapp_ativo ? 'Ativo' : 'Inativo' }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Placeholder para outras abas -->
      <div v-if="abaAtiva !== 'geral'" class="card text-center py-12">
        <Icon name="heroicons:wrench-screwdriver" size="48" class="text-gray-300 mx-auto mb-4" />
        <p class="text-gray-500">Configurações de {{ abaAtiva }} em desenvolvimento</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: ['admin'],
  layout: false,
})

const abaAtiva = ref('geral')

const stats = ref({
  sincronizacoes: { total: 0, sucesso: 0, erro: 0 },
  cnabs: { total: 0, gerados: 0, processados: 0 },
  emails: { total: 0, enviados: 0, abertos: 0 },
  esocial: { total: 0, enviados: 0, processados: 0 },
})

const config = ref({
  contabilidade_ativa: false,
  esocial_ativo: false,
  banco_pagamento_ativo: false,
  ponto_ativo: false,
  smtp_ativo: false,
  whatsapp_ativo: false,
})

const carregarStats = async () => {
  try {
    const data = await $fetch('/api/integracoes/stats')
    stats.value = data as typeof stats.value
  } catch (error) {
    console.error('Erro ao carregar stats:', error)
  }
}

const carregarConfig = async () => {
  try {
    const data = await $fetch('/api/integracoes/config')
    if (data) {
      config.value = { ...config.value, ...data }
    }
  } catch (error) {
    console.error('Erro ao carregar config:', error)
  }
}

onMounted(() => {
  carregarStats()
  carregarConfig()
})
</script>
