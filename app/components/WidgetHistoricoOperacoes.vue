<template>
  <div class="card">
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-lg font-semibold text-gray-800 flex items-center gap-2">
        <Icon name="heroicons:clock" class="text-gray-600" size="24" />
        {{ titulo }}
      </h3>
      <UIButton @click="$emit('refresh')" theme="admin" variant="secondary" size="sm">
        <Icon name="heroicons:arrow-path" class="mr-1" size="16" />
        Atualizar
      </UIButton>
    </div>

    <div v-if="loading" class="text-center py-8">
      <Icon name="heroicons:arrow-path" class="animate-spin text-gray-400 mx-auto mb-2" size="32" />
      <p class="text-sm text-gray-600">Carregando...</p>
    </div>

    <div v-else-if="items.length === 0" class="text-center py-8">
      <Icon name="heroicons:inbox" class="text-gray-300 mx-auto mb-2" size="48" />
      <p class="text-gray-500">Nenhum registro encontrado</p>
    </div>

    <div v-else class="overflow-x-auto">
      <table class="w-full">
        <thead class="bg-gray-50 border-b border-gray-200">
          <tr>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Data</th>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
            <th v-if="tipo === 'importacao'" class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Arquivo</th>
            <th v-if="tipo === 'exportacao'" class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Formato</th>
            <th class="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">{{ tipo === 'importacao' ? 'Total' : 'Registros' }}</th>
            <th v-if="tipo === 'importacao'" class="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Sucesso</th>
            <th v-if="tipo === 'importacao'" class="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Erros</th>
            <th v-if="tipo === 'exportacao'" class="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Tamanho</th>
            <th class="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
            <th class="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Ações</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200">
          <tr v-for="item in items" :key="item.id" class="hover:bg-gray-50">
            <td class="px-4 py-3 text-sm text-gray-900">{{ formatarData(item.created_at) }}</td>
            <td class="px-4 py-3 text-sm text-gray-700">{{ formatarTipo(item.tipo_entidade) }}</td>
            <td v-if="tipo === 'importacao'" class="px-4 py-3 text-sm text-gray-700">{{ item.arquivo_nome }}</td>
            <td v-if="tipo === 'exportacao'" class="px-4 py-3 text-sm text-gray-700 uppercase">{{ item.formato }}</td>
            <td class="px-4 py-3 text-sm text-center text-gray-900">{{ item.total_registros }}</td>
            <td v-if="tipo === 'importacao'" class="px-4 py-3 text-sm text-center text-green-600 font-medium">{{ item.registros_sucesso }}</td>
            <td v-if="tipo === 'importacao'" class="px-4 py-3 text-sm text-center text-red-600 font-medium">{{ item.registros_erro }}</td>
            <td v-if="tipo === 'exportacao'" class="px-4 py-3 text-sm text-center text-gray-700">{{ formatarTamanho(item.arquivo_tamanho) }}</td>
            <td class="px-4 py-3 text-center">
              <span class="px-2 py-1 text-xs font-medium rounded-full" :class="getStatusClass(item.status)">{{ formatarStatus(item.status) }}</span>
            </td>
            <td class="px-4 py-3 text-center">
              <button v-if="tipo === 'importacao' && item.registros_erro > 0" @click="$emit('ver-erros', item)" class="text-teal-600 hover:text-teal-800 text-sm">Ver Erros</button>
              <button v-if="tipo === 'exportacao' && item.status === 'concluido' && item.arquivo_url" @click="$emit('baixar', item)" class="text-teal-600 hover:text-teal-800 text-sm font-medium">
                <Icon name="heroicons:arrow-down-tray" class="inline mr-1" size="16" />Baixar
              </button>
              <span v-if="tipo === 'exportacao' && item.status === 'expirado'" class="text-xs text-gray-400">Expirado</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  titulo: string
  items: any[]
  loading: boolean
  tipo: 'importacao' | 'exportacao'
}>()

defineEmits<{
  refresh: []
  'ver-erros': [item: any]
  baixar: [item: any]
}>()

const formatarData = (data: string) => new Date(data).toLocaleString('pt-BR')

const formatarTipo = (tipo: string) => {
  const tipos: Record<string, string> = {
    colaboradores: 'Colaboradores', usuarios: 'Usuários', ferias: 'Férias',
    documentos: 'Documentos', ponto: 'Ponto', folha: 'Folha',
    departamentos: 'Departamentos', cargos: 'Cargos', jornadas: 'Jornadas',
  }
  return tipos[tipo] || tipo
}

const formatarStatus = (status: string) => {
  const statuses: Record<string, string> = {
    processando: 'Processando', concluido: 'Concluído', erro: 'Erro', parcial: 'Parcial', expirado: 'Expirado',
  }
  return statuses[status] || status
}

const getStatusClass = (status: string) => {
  const classes: Record<string, string> = {
    processando: 'bg-blue-100 text-blue-700', concluido: 'bg-green-100 text-green-700',
    erro: 'bg-red-100 text-red-700', parcial: 'bg-yellow-100 text-yellow-700', expirado: 'bg-gray-100 text-gray-600',
  }
  return classes[status] || 'bg-gray-100 text-gray-600'
}

const formatarTamanho = (bytes: number) => {
  if (!bytes) return '-'
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / 1048576).toFixed(1) + ' MB'
}
</script>
