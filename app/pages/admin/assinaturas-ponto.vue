<template>
  <div class="p-6">
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Gerenciar Assinaturas de Ponto</h1>
        <p class="text-gray-600 mt-1">Visualize, gerencie e exporte as assinaturas digitais de ponto dos funcionários</p>
      </div>
      <div class="flex gap-3">
        <button @click="exportarRelatorio" 
                class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2">
          <Icon name="heroicons:document-arrow-down" size="16" />
          Exportar CSV
        </button>
        <button @click="renovarAssinaturasAutomatico" 
                class="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2">
          <Icon name="heroicons:arrow-path" size="16" />
          Renovar Automático
        </button>
      </div>
    </div>

    <!-- Estatísticas -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <div class="bg-white rounded-lg shadow-sm border p-4">
        <div class="flex items-center">
          <div class="p-2 bg-blue-100 rounded-lg">
            <Icon name="heroicons:document-text" class="w-6 h-6 text-blue-600" />
          </div>
          <div class="ml-3">
            <p class="text-sm font-medium text-gray-600">Total Assinaturas</p>
            <p class="text-2xl font-bold text-gray-900">{{ stats.total }}</p>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow-sm border p-4">
        <div class="flex items-center">
          <div class="p-2 bg-green-100 rounded-lg">
            <Icon name="heroicons:calendar-days" class="w-6 h-6 text-green-600" />
          </div>
          <div class="ml-3">
            <p class="text-sm font-medium text-gray-600">Este Mês</p>
            <p class="text-2xl font-bold text-gray-900">{{ stats.esteMes }}</p>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow-sm border p-4">
        <div class="flex items-center">
          <div class="p-2 bg-yellow-100 rounded-lg">
            <Icon name="heroicons:clock" class="w-6 h-6 text-yellow-600" />
          </div>
          <div class="ml-3">
            <p class="text-sm font-medium text-gray-600">Últimos 7 dias</p>
            <p class="text-2xl font-bold text-gray-900">{{ stats.ultimos7Dias }}</p>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow-sm border p-4">
        <div class="flex items-center">
          <div class="p-2 bg-purple-100 rounded-lg">
            <Icon name="heroicons:users" class="w-6 h-6 text-purple-600" />
          </div>
          <div class="ml-3">
            <p class="text-sm font-medium text-gray-600">Colaboradores</p>
            <p class="text-2xl font-bold text-gray-900">{{ stats.colaboradoresUnicos }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Filtros -->
    <div class="bg-white rounded-lg shadow-sm border p-4 mb-6">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Mês</label>
          <select 
            v-model="filtros.mes" 
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todos os meses</option>
            <option v-for="m in meses" :key="m.value" :value="m.value">{{ m.label }}</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Ano</label>
          <select 
            v-model="filtros.ano" 
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todos os anos</option>
            <option v-for="a in anos" :key="a" :value="a">{{ a }}</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Funcionário</label>
          <select 
            v-model="filtros.colaborador_id" 
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todos os funcionários</option>
            <option v-for="c in colaboradores" :key="c.id" :value="c.id">{{ c.nome }}</option>
          </select>
        </div>
        <div class="flex items-end">
          <button 
            @click="buscarAssinaturas"
            class="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            :disabled="loading"
          >
            <Icon name="heroicons:magnifying-glass" size="16" class="mr-2" />
            Buscar
          </button>
        </div>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="text-center py-12">
      <Icon name="heroicons:arrow-path" class="animate-spin text-gray-400 mx-auto" size="40" />
      <p class="text-gray-500 mt-2">Carregando assinaturas...</p>
    </div>

    <!-- Tabela de Assinaturas -->
    <div v-else-if="assinaturas.length > 0" class="bg-white rounded-lg shadow-sm border overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Funcionário
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Período
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Data da Assinatura
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Resumo
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                IP
              </th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ações
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="assinatura in assinaturas" :key="assinatura.id" class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <div class="flex-shrink-0 h-10 w-10">
                    <div class="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <span class="text-sm font-medium text-blue-600">
                        {{ assinatura.colaborador?.nome?.charAt(0) }}
                      </span>
                    </div>
                  </div>
                  <div class="ml-4">
                    <div class="text-sm font-medium text-gray-900">
                      {{ assinatura.colaborador?.nome }}
                    </div>
                    <div class="text-sm text-gray-500">
                      {{ assinatura.colaborador?.email }}
                    </div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">
                  {{ formatarPeriodo(assinatura.mes, assinatura.ano) }}
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">
                  {{ formatarDataHora(assinatura.data_assinatura) }}
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">
                  {{ assinatura.total_dias }} dias
                </div>
                <div class="text-sm text-gray-500">
                  {{ assinatura.total_horas }}
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-500">
                  {{ assinatura.ip_assinatura || 'N/A' }}
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div class="flex items-center justify-end gap-2">
                  <button
                    @click="visualizarAssinatura(assinatura)"
                    class="text-blue-600 hover:text-blue-900 p-1 rounded"
                    title="Visualizar assinatura"
                  >
                    <Icon name="heroicons:eye" size="16" />
                  </button>
                  <button
                    @click="baixarPDF(assinatura)"
                    class="text-red-600 hover:text-red-900 p-1 rounded"
                    title="Baixar PDF"
                  >
                    <Icon name="heroicons:document-arrow-down" size="16" />
                  </button>
                  <button
                    @click="baixarCSV(assinatura)"
                    class="text-green-600 hover:text-green-900 p-1 rounded"
                    title="Baixar CSV"
                  >
                    <Icon name="heroicons:arrow-down-tray" size="16" />
                  </button>
                  <button
                    @click="zerarAssinatura(assinatura.id)"
                    class="text-yellow-600 hover:text-yellow-900 p-1 rounded"
                    title="Zerar assinatura"
                  >
                    <Icon name="heroicons:arrow-path" size="16" />
                  </button>
                  <button
                    @click="excluirAssinatura(assinatura.id)"
                    class="text-red-600 hover:text-red-900 p-1 rounded"
                    title="Excluir assinatura"
                  >
                    <Icon name="heroicons:trash" size="16" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="text-center py-12">
      <Icon name="heroicons:document-text" class="text-gray-300 mx-auto" size="48" />
      <p class="text-gray-500 mt-2">Nenhuma assinatura encontrada</p>
      <p class="text-gray-400 text-sm mt-1">As assinaturas aparecerão aqui quando os funcionários assinarem seus pontos</p>
    </div>

    <!-- Modal de Visualização -->
    <ModalVisualizarAssinatura
      v-if="assinaturaVisualizacao"
      :assinatura="assinaturaVisualizacao"
      @close="assinaturaVisualizacao = null"
    />
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'admin',
  middleware: 'auth'
})

// Estados
const loading = ref(false)
const assinaturas = ref<any[]>([])
const colaboradores = ref<any[]>([])
const assinaturaVisualizacao = ref<any>(null)

// Estatísticas
const stats = ref({
  total: 0,
  esteMes: 0,
  ultimos7Dias: 0,
  colaboradoresUnicos: 0
})

// Filtros
const filtros = ref({
  mes: '',
  ano: '',
  colaborador_id: ''
})

// Dados estáticos
const meses = [
  { value: 1, label: 'Janeiro' },
  { value: 2, label: 'Fevereiro' },
  { value: 3, label: 'Março' },
  { value: 4, label: 'Abril' },
  { value: 5, label: 'Maio' },
  { value: 6, label: 'Junho' },
  { value: 7, label: 'Julho' },
  { value: 8, label: 'Agosto' },
  { value: 9, label: 'Setembro' },
  { value: 10, label: 'Outubro' },
  { value: 11, label: 'Novembro' },
  { value: 12, label: 'Dezembro' },
]

const anos = computed(() => {
  const anoAtual = new Date().getFullYear()
  return [anoAtual - 2, anoAtual - 1, anoAtual, anoAtual + 1]
})

// Funções
const buscarAssinaturas = async () => {
  loading.value = true
  try {
    const params = new URLSearchParams()
    
    if (filtros.value.mes) params.append('mes', filtros.value.mes)
    if (filtros.value.ano) params.append('ano', filtros.value.ano)
    if (filtros.value.colaborador_id) params.append('colaborador_id', filtros.value.colaborador_id)
    
    console.log('🔍 Buscando assinaturas com filtros:', {
      mes: filtros.value.mes,
      ano: filtros.value.ano,
      colaborador_id: filtros.value.colaborador_id
    })
    
    const data = await $fetch(`/api/admin/assinaturas-ponto?${params.toString()}`)
    
    console.log('📊 Dados recebidos da API:', data)
    console.log('📋 Tipo dos dados:', typeof data)
    console.log('📈 É array?', Array.isArray(data))
    
    // Garantir que temos um array
    if (Array.isArray(data)) {
      assinaturas.value = data
    } else if (data && Array.isArray(data.data)) {
      assinaturas.value = data.data
    } else {
      assinaturas.value = []
    }
    
    console.log('✅ Assinaturas carregadas:', assinaturas.value.length)
    
    // Calcular estatísticas
    calcularEstatisticas()
  } catch (error) {
    console.error('❌ Erro ao buscar assinaturas:', error)
    alert('Erro ao carregar assinaturas: ' + (error.message || 'Erro desconhecido'))
  } finally {
    loading.value = false
  }
}

const calcularEstatisticas = () => {
  const agora = new Date()
  const mesAtual = agora.getMonth() + 1
  const anoAtual = agora.getFullYear()
  const seteDiasAtras = new Date(agora.getTime() - 7 * 24 * 60 * 60 * 1000)
  
  stats.value.total = assinaturas.value.length
  
  stats.value.esteMes = assinaturas.value.filter(a => 
    a.mes === mesAtual && a.ano === anoAtual
  ).length
  
  stats.value.ultimos7Dias = assinaturas.value.filter(a => 
    new Date(a.data_assinatura) >= seteDiasAtras
  ).length
  
  const colaboradoresUnicos = new Set(assinaturas.value.map(a => a.colaborador_id))
  stats.value.colaboradoresUnicos = colaboradoresUnicos.size
}

const carregarColaboradores = async () => {
  try {
    const { data } = await $fetch('/api/colaboradores')
    colaboradores.value = data || []
  } catch (error) {
    console.error('Erro ao carregar colaboradores:', error)
  }
}

const visualizarAssinatura = (assinatura: any) => {
  assinaturaVisualizacao.value = assinatura
}

const baixarCSV = async (assinatura: any) => {
  try {
    const response = await fetch(`/api/funcionario/ponto/download-csv?mes=${assinatura.mes}&ano=${assinatura.ano}&colaborador_id=${assinatura.colaborador_id}`)
    
    if (!response.ok) {
      throw new Error('Erro ao baixar arquivo')
    }
    
    const blob = await response.blob()
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `ponto_${assinatura.colaborador.nome}_${assinatura.mes}_${assinatura.ano}.csv`
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)
  } catch (error) {
    console.error('Erro ao baixar CSV:', error)
    alert('Erro ao baixar arquivo')
  }
}

const formatarPeriodo = (mes: number, ano: number) => {
  const mesNome = meses.find(m => m.value === mes)?.label || mes
  return `${mesNome}/${ano}`
}

const formatarDataHora = (data: string) => {
  return new Date(data).toLocaleString('pt-BR')
}

const baixarPDF = async (assinatura: any) => {
  try {
    const response = await fetch(`/api/funcionario/ponto/download-pdf?colaborador_id=${assinatura.colaborador_id}&mes=${assinatura.mes}&ano=${assinatura.ano}`)
    
    if (!response.ok) {
      throw new Error('Erro ao baixar PDF')
    }
    
    const blob = await response.blob()
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `relatorio_ponto_${assinatura.colaborador.nome}_${assinatura.mes}_${assinatura.ano}.pdf`
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)
  } catch (error) {
    console.error('Erro ao baixar PDF:', error)
    alert('Erro ao baixar PDF')
  }
}

const zerarAssinatura = async (id: string) => {
  if (!confirm('Tem certeza que deseja zerar esta assinatura? Isso permitirá que o funcionário assine novamente.')) {
    return
  }
  
  try {
    await $fetch(`/api/admin/assinaturas-ponto/${id}/zerar`, { method: 'POST' })
    alert('Assinatura zerada com sucesso!')
    await buscarAssinaturas()
  } catch (error) {
    console.error('Erro ao zerar assinatura:', error)
    alert('Erro ao zerar assinatura')
  }
}

const excluirAssinatura = async (id: string) => {
  if (!confirm('Tem certeza que deseja excluir esta assinatura? Esta ação não pode ser desfeita.')) {
    return
  }
  
  try {
    await $fetch(`/api/admin/assinaturas-ponto/${id}`, { method: 'DELETE' })
    alert('Assinatura excluída com sucesso!')
    await buscarAssinaturas()
  } catch (error) {
    console.error('Erro ao excluir assinatura:', error)
    alert('Erro ao excluir assinatura')
  }
}

const exportarRelatorio = async () => {
  try {
    const params = new URLSearchParams()
    if (filtros.value.mes) params.append('mes', filtros.value.mes)
    if (filtros.value.ano) params.append('ano', filtros.value.ano)
    if (filtros.value.colaborador_id) params.append('colaborador_id', filtros.value.colaborador_id)
    
    const response = await fetch(`/api/admin/assinaturas-ponto/relatorio?${params.toString()}`)
    
    if (!response.ok) {
      throw new Error('Erro ao gerar relatório')
    }
    
    const blob = await response.blob()
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `relatorio_assinaturas_${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)
  } catch (error) {
    console.error('Erro ao exportar relatório:', error)
    alert('Erro ao exportar relatório')
  }
}

const renovarAssinaturasAutomatico = async () => {
  if (!confirm('Deseja renovar automaticamente as assinaturas vencidas? Isso criará novas assinaturas para o período atual.')) {
    return
  }
  
  try {
    const result = await $fetch('/api/admin/renovar-assinaturas-automatico', { method: 'POST' })
    alert(`Renovação concluída! ${result.renovadas} assinaturas foram renovadas.`)
    await buscarAssinaturas()
  } catch (error) {
    console.error('Erro ao renovar assinaturas:', error)
    alert('Erro ao renovar assinaturas automaticamente')
  }
}

// Lifecycle
onMounted(async () => {
  await Promise.all([
    carregarColaboradores(),
    buscarAssinaturas()
  ])
})
</script>