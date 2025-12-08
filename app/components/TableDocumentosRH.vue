<template>
  <div class="card overflow-hidden">
    <div class="overflow-x-auto">
      <table class="w-full">
        <thead class="bg-gray-50 border-b border-gray-200">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Colaborador</th>
            <th class="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Tipo</th>
            <th class="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Período</th>
            <th class="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Data Envio</th>
            <th class="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
            <th class="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Ações</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200">
          <tr v-for="doc in documentos" :key="doc.id" class="hover:bg-gray-50">
            <td class="px-6 py-4">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 bg-blue-900 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                  {{ getInitials(doc.colaborador?.nome || 'NN') }}
                </div>
                <div>
                  <p class="font-medium text-gray-800">{{ doc.colaborador?.nome || 'N/A' }}</p>
                  <p class="text-xs text-gray-500">{{ doc.colaborador?.cargo?.nome || '' }}</p>
                </div>
              </div>
            </td>
            <td class="px-6 py-4">
              <div class="flex items-center gap-2">
                <Icon :name="getTipoIcon(doc.tipo)" class="text-gray-400" size="18" />
                <span class="text-sm text-gray-700">{{ formatTipo(doc.tipo) }}</span>
              </div>
            </td>
            <td class="px-6 py-4 text-sm text-gray-600">
              <span v-if="doc.data_inicio">{{ formatDate(doc.data_inicio) }}</span>
              <span v-if="doc.data_inicio && doc.data_fim"> - {{ formatDate(doc.data_fim) }}</span>
              <span v-if="doc.horas" class="block text-xs text-gray-500">{{ doc.horas }}h</span>
            </td>
            <td class="px-6 py-4 text-sm text-gray-600">{{ formatDate(doc.created_at) }}</td>
            <td class="px-6 py-4">
              <span class="badge" :class="getStatusClass(doc.status)">{{ doc.status }}</span>
            </td>
            <td class="px-6 py-4">
              <div class="flex items-center justify-end gap-2">
                <a v-if="doc.arquivo_url" :href="doc.arquivo_url" target="_blank" class="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg" title="Ver Arquivo">
                  <Icon name="heroicons:eye" size="18" />
                </a>
                <button v-if="doc.status === 'Pendente'" class="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg" title="Aprovar" @click="$emit('aprovar', doc)">
                  <Icon name="heroicons:check" size="18" />
                </button>
                <button v-if="doc.status === 'Pendente'" class="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg" title="Rejeitar" @click="$emit('rejeitar', doc)">
                  <Icon name="heroicons:x-mark" size="18" />
                </button>
                <button class="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg" title="Excluir" @click="$emit('excluir', doc)">
                  <Icon name="heroicons:trash" size="18" />
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{ documentos: any[] }>()
defineEmits<{ aprovar: [doc: any]; rejeitar: [doc: any]; excluir: [doc: any] }>()

const getInitials = (nome: string) => {
  const names = nome.split(' ')
  return names.length === 1 ? names[0].substring(0, 2).toUpperCase() : (names[0][0] + names[names.length - 1][0]).toUpperCase()
}

const formatDate = (dateString: string) => dateString ? new Date(dateString).toLocaleDateString('pt-BR') : '-'

const formatTipo = (tipo: string) => {
  const tipos: Record<string, string> = { 'Atestado': 'Atestado Médico', 'Declaracao_Horas': 'Declaração de Horas', 'Declaracao_Comparecimento': 'Declaração de Comparecimento', 'Licenca': 'Licença', 'Ferias': 'Férias', 'Advertencia': 'Advertência', 'Outros': 'Outros' }
  return tipos[tipo] || tipo
}

const getTipoIcon = (tipo: string) => {
  const icons: Record<string, string> = { 'Atestado': 'heroicons:heart', 'Declaracao_Horas': 'heroicons:clock', 'Declaracao_Comparecimento': 'heroicons:building-office', 'Licenca': 'heroicons:calendar-days', 'Ferias': 'heroicons:sun', 'Advertencia': 'heroicons:exclamation-triangle', 'Outros': 'heroicons:document' }
  return icons[tipo] || 'heroicons:document'
}

const getStatusClass = (status: string) => {
  const classes: Record<string, string> = { 'Pendente': 'badge-warning', 'Aprovado': 'badge-success', 'Rejeitado': 'badge-error' }
  return classes[status] || 'badge-info'
}
</script>
