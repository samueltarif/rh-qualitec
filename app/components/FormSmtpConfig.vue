<template>
  <div class="card">
    <h2 class="text-xl font-semibold mb-4">Configurações SMTP</h2>
    
    <form @submit.prevent="$emit('salvar')" class="space-y-4">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Servidor SMTP *</label>
          <input v-model="smtp.servidor_smtp" type="text" required placeholder="smtp.gmail.com" class="input" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Porta *</label>
          <input v-model.number="smtp.porta" type="number" required placeholder="587" class="input" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Usuário SMTP *</label>
          <input v-model="smtp.usuario_smtp" type="text" required placeholder="seu-email@empresa.com" class="input" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Senha SMTP *</label>
          <input v-model="smtp.senha_smtp" type="password" required placeholder="••••••••" class="input" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">E-mail Remetente *</label>
          <input v-model="smtp.email_remetente" type="email" required placeholder="noreply@empresa.com" class="input" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Nome Remetente *</label>
          <input v-model="smtp.nome_remetente" type="text" required placeholder="RH Empresa" class="input" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">E-mail Resposta</label>
          <input v-model="smtp.email_resposta" type="email" placeholder="rh@empresa.com" class="input" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Timeout (segundos)</label>
          <input v-model.number="smtp.timeout" type="number" placeholder="30" class="input" />
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div class="flex items-center">
          <input v-model="smtp.usa_ssl" type="checkbox" id="usa_ssl" class="checkbox" />
          <label for="usa_ssl" class="ml-2 text-sm text-gray-700">Usar SSL</label>
        </div>
        <div class="flex items-center">
          <input v-model="smtp.usa_tls" type="checkbox" id="usa_tls" class="checkbox" />
          <label for="usa_tls" class="ml-2 text-sm text-gray-700">Usar TLS</label>
        </div>
        <div class="flex items-center">
          <input v-model="smtp.ativo" type="checkbox" id="smtp_ativo" class="checkbox" />
          <label for="smtp_ativo" class="ml-2 text-sm text-gray-700">Ativo</label>
        </div>
      </div>

      <div class="flex gap-3 pt-4">
        <button type="submit" class="btn-primary" :disabled="salvando">
          <Icon name="mdi:content-save" class="mr-2" />
          {{ salvando ? 'Salvando...' : 'Salvar Configurações' }}
        </button>
        <button type="button" @click="$emit('testar')" class="btn-secondary" :disabled="testando || !smtp.servidor_smtp">
          <Icon name="mdi:test-tube" class="mr-2" />
          {{ testando ? 'Testando...' : 'Testar Conexão' }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  smtp: {
    servidor_smtp: string
    porta: number
    usa_ssl: boolean
    usa_tls: boolean
    usuario_smtp: string
    senha_smtp: string
    email_remetente: string
    nome_remetente: string
    email_resposta: string
    timeout: number
    ativo: boolean
  }
  salvando: boolean
  testando: boolean
}>()

defineEmits<{ salvar: []; testar: [] }>()
</script>
