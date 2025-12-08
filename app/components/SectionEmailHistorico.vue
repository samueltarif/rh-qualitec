<template>
  <div class="card">
    <div class="flex justify-between items-center mb-4">
      <h2 class="text-xl font-semibold">Histórico de Envios</h2>
      <select v-model="filtroLocal" class="input w-40">
        <option value="">Todos</option>
        <option value="enviado">Enviados</option>
        <option value="pendente">Pendentes</option>
        <option value="falha">Falhas</option>
      </select>
    </div>

    <div class="overflow-x-auto">
      <table class="table">
        <thead>
          <tr>
            <th>Data</th>
            <th>Destinatário</th>
            <th>Assunto</th>
            <th>Template</th>
            <th>Status</th>
            <th>Aberto</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="email in historico" :key="email.id">
            <td>{{ formatarData(email.created_at) }}</td>
            <td>
              <div class="font-medium">{{ email.destinatario_nome }}</div>
              <div class="text-xs text-gray-500">{{ email.destinatario_email }}</div>
            </td>
            <td>{{ email.assunto }}</td>
            <td>
              <span v-if="email.templates_email" class="text-sm text-gray-600">{{ email.templates_email.nome }}</span>
              <span v-else class="text-xs text-gray-400">-</span>
            </td>
            <td>
              <span :class="['px-2 py-1 text-xs rounded', statusClass(email.status)]">{{ email.status }}</span>
            </td>
            <td>
              <Icon v-if="email.aberto_em" name="mdi:email-open" class="text-green-600" title="E-mail aberto" />
              <Icon v-else name="mdi:email" class="text-gray-400" title="Não aberto" />
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  historico: any[]
  filtroStatus: string
}>()

const emit = defineEmits<{
  'update:filtroStatus': [value: string]
}>()

const filtroLocal = computed({
  get: () => props.filtroStatus,
  set: (val) => emit('update:filtroStatus', val)
})

const formatarData = (data: string) => new Date(data).toLocaleString('pt-BR')

const statusClass = (status: string) => {
  const classes: Record<string, string> = {
    enviado: 'bg-green-100 text-green-700',
    pendente: 'bg-amber-100 text-amber-700',
    falha: 'bg-red-100 text-red-700',
  }
  return classes[status] || 'bg-gray-100 text-gray-700'
}
</script>
