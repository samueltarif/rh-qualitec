<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div class="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
      <!-- Header -->
      <div class="flex items-center justify-between p-6 border-b">
        <div>
          <h3 class="text-lg font-semibold text-gray-900">
            Assinatura Digital de Ponto
          </h3>
          <p class="text-sm text-gray-600 mt-1">
            {{ assinatura.colaborador?.nome }} - {{ formatarPeriodo(assinatura.mes, assinatura.ano) }}
          </p>
        </div>
        <button
          @click="$emit('close')"
          class="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Content -->
      <div class="p-6">
        <!-- Informações do Funcionário -->
        <div class="bg-gray-50 rounded-lg p-4 mb-6">
          <h4 class="font-medium text-gray-900 mb-3">Informações do Funcionário</h4>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span class="text-gray-600">Nome:</span>
              <span class="font-medium ml-2">{{ assinatura.colaborador?.nome }}</span>
            </div>
            <div>
              <span class="text-gray-600">Email:</span>
              <span class="font-medium ml-2">{{ assinatura.colaborador?.email }}</span>
            </div>
            <div>
              <span class="text-gray-600">Cargo:</span>
              <span class="font-medium ml-2">{{ assinatura.colaborador?.cargo || 'N/A' }}</span>
            </div>
            <div>
              <span class="text-gray-600">Departamento:</span>
              <span class="font-medium ml-2">{{ assinatura.colaborador?.departamento || 'N/A' }}</span>
            </div>
          </div>
        </div>

        <!-- Resumo do Período -->
        <div class="bg-blue-50 rounded-lg p-4 mb-6">
          <h4 class="font-medium text-blue-900 mb-3">Resumo do Período</h4>
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div class="text-center">
              <div class="text-2xl font-bold text-blue-600">{{ assinatura.total_dias }}</div>
              <div class="text-blue-700">Dias Trabalhados</div>
            </div>
            <div class="text-center">
              <div class="text-2xl font-bold text-blue-600">{{ assinatura.total_horas }}</div>
              <div class="text-blue-700">Total de Horas</div>
            </div>
            <div class="text-center">
              <div class="text-lg font-medium text-blue-600">{{ formatarDataHora(assinatura.data_assinatura) }}</div>
              <div class="text-blue-700">Data da Assinatura</div>
            </div>
            <div class="text-center">
              <div class="text-lg font-medium text-blue-600">{{ assinatura.ip_assinatura || 'N/A' }}</div>
              <div class="text-blue-700">IP de Origem</div>
            </div>
          </div>
        </div>

        <!-- Assinatura Digital -->
        <div class="mb-6">
          <h4 class="font-medium text-gray-900 mb-3">Assinatura Digital</h4>
          <div class="border-2 border-gray-200 rounded-lg p-4 bg-white">
            <img 
              v-if="assinatura.assinatura_digital"
              :src="assinatura.assinatura_digital" 
              alt="Assinatura Digital"
              class="max-w-full h-auto border rounded"
            />
            <div v-else class="text-center py-8 text-gray-500">
              <Icon name="heroicons:document-text" size="48" class="mx-auto mb-2" />
              <p>Assinatura não disponível</p>
            </div>
          </div>
        </div>

        <!-- Observações -->
        <div v-if="assinatura.observacoes" class="mb-6">
          <h4 class="font-medium text-gray-900 mb-3">Observações</h4>
          <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p class="text-sm text-gray-700">{{ assinatura.observacoes }}</p>
          </div>
        </div>

        <!-- Informações Técnicas -->
        <div class="bg-gray-50 rounded-lg p-4">
          <h4 class="font-medium text-gray-900 mb-3">Informações Técnicas</h4>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span class="text-gray-600">ID da Assinatura:</span>
              <span class="font-mono text-xs ml-2 break-all">{{ assinatura.id }}</span>
            </div>
            <div>
              <span class="text-gray-600">Criado em:</span>
              <span class="font-medium ml-2">{{ formatarDataHora(assinatura.created_at) }}</span>
            </div>
            <div>
              <span class="text-gray-600">Atualizado em:</span>
              <span class="font-medium ml-2">{{ formatarDataHora(assinatura.updated_at) }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="flex items-center justify-end gap-3 p-6 border-t bg-gray-50">
        <button
          @click="baixarCSV"
          class="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          :disabled="baixando"
        >
          <Icon name="heroicons:arrow-down-tray" size="16" class="mr-2" />
          {{ baixando ? 'Baixando...' : 'Baixar CSV' }}
        </button>
        <button
          @click="$emit('close')"
          type="button"
          class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Fechar
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  assinatura: any
}

const props = defineProps<Props>()
const emit = defineEmits(['close'])

const baixando = ref(false)

const meses = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
]

const formatarPeriodo = (mes: number, ano: number) => {
  const mesNome = meses[mes - 1] || mes
  return `${mesNome}/${ano}`
}

const formatarDataHora = (data: string) => {
  return new Date(data).toLocaleString('pt-BR')
}

const baixarCSV = async () => {
  if (baixando.value) return
  
  baixando.value = true
  
  try {
    const response = await fetch(`/api/funcionario/ponto/download-csv?mes=${props.assinatura.mes}&ano=${props.assinatura.ano}&colaborador_id=${props.assinatura.colaborador_id}`)
    
    if (!response.ok) {
      throw new Error('Erro ao baixar arquivo')
    }
    
    const blob = await response.blob()
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `ponto_${props.assinatura.colaborador.nome}_${props.assinatura.mes}_${props.assinatura.ano}.csv`
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)
  } catch (error) {
    console.error('Erro ao baixar CSV:', error)
    alert('Erro ao baixar arquivo')
  } finally {
    baixando.value = false
  }
}
</script>