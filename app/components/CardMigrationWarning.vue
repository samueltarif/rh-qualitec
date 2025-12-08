<template>
  <div v-if="show" class="bg-red-50 border-l-4 border-red-500 p-6 mb-6 rounded-lg">
    <div class="flex items-start gap-4">
      <Icon name="heroicons:exclamation-triangle" class="text-red-600 flex-shrink-0 mt-1" size="24" />
      <div class="flex-1">
        <h3 class="text-lg font-semibold text-red-800 mb-2">{{ titulo }}</h3>
        <p class="text-red-700 mb-3">{{ mensagem }}</p>
        <div class="bg-white p-4 rounded border border-red-200 mb-3">
          <p class="text-sm font-medium text-gray-800 mb-2">📋 Passos rápidos:</p>
          <ol class="text-sm text-gray-700 space-y-1 list-decimal list-inside">
            <li>Acesse o Supabase SQL Editor</li>
            <li>Copie o conteúdo de: <code class="bg-gray-100 px-2 py-0.5 rounded text-xs">{{ arquivoMigration }}</code></li>
            <li>Execute o SQL</li>
            <li>Recarregue esta página</li>
          </ol>
        </div>
        <a 
          href="https://supabase.com/dashboard" 
          target="_blank"
          class="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
        >
          <Icon name="heroicons:arrow-top-right-on-square" size="16" />
          Abrir Supabase
        </a>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  show: boolean
  titulo?: string
  mensagem?: string
  arquivoMigration?: string
}>()
</script>
