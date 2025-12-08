<template>
  <div class="card">
    <h2 class="text-xl font-semibold mb-4">Notificações Automáticas</h2>
    
    <form @submit.prevent="$emit('salvar')" class="space-y-6">
      <div class="space-y-3">
        <h3 class="font-medium text-gray-700">Eventos que Disparam E-mails</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
          <label v-for="evento in eventos" :key="evento.key" class="flex items-center">
            <input v-model="comunicacao[evento.key]" type="checkbox" class="checkbox" />
            <span class="ml-2 text-sm text-gray-700">{{ evento.label }}</span>
          </label>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Alerta Férias (dias)</label>
          <input v-model.number="comunicacao.dias_alerta_ferias" type="number" min="1" class="input" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Alerta Documentos (dias)</label>
          <input v-model.number="comunicacao.dias_alerta_documentos" type="number" min="1" class="input" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Alerta Aniversário (dias)</label>
          <input v-model.number="comunicacao.dias_alerta_aniversario" type="number" min="0" class="input" />
        </div>
      </div>

      <div>
        <h3 class="font-medium text-gray-700 mb-3">Horários de Envio</h3>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Início</label>
            <input v-model="comunicacao.horario_envio_inicio" type="time" class="input" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Fim</label>
            <input v-model="comunicacao.horario_envio_fim" type="time" class="input" />
          </div>
          <div class="flex items-center pt-8">
            <input v-model="comunicacao.enviar_finais_semana" type="checkbox" class="checkbox" />
            <span class="ml-2 text-sm text-gray-700">Enviar nos finais de semana</span>
          </div>
        </div>
      </div>

      <div class="flex items-center gap-4">
        <label class="flex items-center">
          <input v-model="comunicacao.rastrear_abertura" type="checkbox" class="checkbox" />
          <span class="ml-2 text-sm text-gray-700">Rastrear abertura de e-mails</span>
        </label>
        <label class="flex items-center">
          <input v-model="comunicacao.rastrear_cliques" type="checkbox" class="checkbox" />
          <span class="ml-2 text-sm text-gray-700">Rastrear cliques em links</span>
        </label>
      </div>

      <div class="flex gap-3 pt-4">
        <button type="submit" class="btn-primary" :disabled="salvando">
          <Icon name="mdi:content-save" class="mr-2" />
          {{ salvando ? 'Salvando...' : 'Salvar Configurações' }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  comunicacao: Record<string, any>
  salvando: boolean
}>()

defineEmits<{ salvar: [] }>()

const eventos = [
  { key: 'notificar_admissao', label: 'Admissão de colaborador' },
  { key: 'notificar_demissao', label: 'Demissão de colaborador' },
  { key: 'notificar_aniversario', label: 'Aniversário de colaborador' },
  { key: 'notificar_ferias_aprovadas', label: 'Férias aprovadas' },
  { key: 'notificar_ferias_vencendo', label: 'Férias vencendo' },
  { key: 'notificar_documentos_vencendo', label: 'Documentos vencendo' },
  { key: 'notificar_ponto_inconsistente', label: 'Ponto inconsistente' },
  { key: 'notificar_folha_gerada', label: 'Folha de pagamento gerada' },
]
</script>
