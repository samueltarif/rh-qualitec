<template>
  <div class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
    <div class="overflow-x-auto">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th 
              v-for="coluna in colunas" 
              :key="coluna.key"
              class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              {{ coluna.label }}
            </th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr 
            v-for="(registro, index) in registros" 
            :key="index"
            class="hover:bg-gray-50 transition-colors"
          >
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
              {{ registro.data }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
              {{ registro.entrada }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
              {{ registro.intervaloEntrada }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
              {{ registro.intervaloSaida }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
              {{ registro.saida }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
              {{ registro.total }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <StatusBadge :status="registro.status" :mensagem="registro.statusMensagem" />
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    
    <div v-if="!registros.length" class="text-center py-12">
      <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
      <p class="mt-2 text-sm text-gray-500">Nenhum registro encontrado</p>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Registro {
  data: string
  entrada: string
  intervaloEntrada: string
  intervaloSaida: string
  saida: string
  total: string
  status: 'normal' | 'alerta' | 'falta'
  statusMensagem?: string
}

interface Coluna {
  key: string
  label: string
}

interface Props {
  registros: Registro[]
  colunas?: Coluna[]
}

withDefaults(defineProps<Props>(), {
  colunas: () => [
    { key: 'data', label: 'DATA' },
    { key: 'entrada', label: 'ENTRADA' },
    { key: 'intervaloEntrada', label: 'INTERVALO ENTRADA' },
    { key: 'intervaloSaida', label: 'INTERVALO SAÍDA' },
    { key: 'saida', label: 'SAÍDA' },
    { key: 'total', label: 'TOTAL' },
    { key: 'status', label: 'STATUS' }
  ]
})
</script>
