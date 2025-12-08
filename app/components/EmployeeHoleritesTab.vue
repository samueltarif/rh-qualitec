<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h2 class="text-2xl font-bold text-gray-800">Meus Holerites</h2>
        <p class="text-gray-600">Visualize e baixe seus comprovantes de pagamento</p>
      </div>
      <UIButton 
        variant="secondary" 
        icon-left="heroicons:arrow-path"
        @click="carregarHolerites"
        :disabled="loading"
      >
        Atualizar
      </UIButton>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="text-center py-12">
      <Icon name="heroicons:arrow-path" class="animate-spin text-gray-400 mx-auto mb-4" size="48" />
      <p class="text-gray-600">Carregando holerites...</p>
    </div>

    <!-- Lista de Holerites -->
    <div v-else-if="holerites.length > 0" class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-for="holerite in holerites"
        :key="holerite.id"
        class="bg-white rounded-xl border-2 border-gray-200 hover:border-blue-400 transition-all group"
      >
        <div class="p-6 cursor-pointer" @click="visualizarHolerite(holerite)">
          <!-- Período -->
          <div class="flex items-center justify-between mb-4">
            <div class="flex items-center gap-3">
              <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                <Icon name="heroicons:document-text" class="text-blue-600" size="24" />
              </div>
              <div>
                <p class="font-bold text-gray-800">{{ nomeMes(holerite.mes) }}</p>
                <p class="text-sm text-gray-500">{{ holerite.ano }}</p>
              </div>
            </div>
            <UIBadge :color="getStatusColor(holerite.status)">
              {{ getStatusLabel(holerite.status) }}
            </UIBadge>
          </div>

          <!-- Valores -->
          <div class="space-y-2 mb-4">
            <div class="flex justify-between text-sm">
              <span class="text-gray-600">Salário Bruto</span>
              <span class="font-semibold text-gray-800">{{ formatCurrency(holerite.salario_bruto) }}</span>
            </div>
            <div class="flex justify-between text-sm">
              <span class="text-gray-600">Descontos</span>
              <span class="font-semibold text-red-600">{{ formatCurrency(holerite.total_descontos) }}</span>
            </div>
            <div class="flex justify-between pt-2 border-t border-gray-200">
              <span class="font-semibold text-gray-700">Líquido</span>
              <span class="font-bold text-green-600 text-lg">{{ formatCurrency(holerite.salario_liquido) }}</span>
            </div>
          </div>

          <!-- Data de Visualização -->
          <div v-if="holerite.visualizado_em" class="text-xs text-gray-500 flex items-center gap-1">
            <Icon name="heroicons:eye" size="14" />
            Visualizado em {{ formatDate(holerite.visualizado_em) }}
          </div>
          <div v-else class="text-xs text-blue-600 font-semibold flex items-center gap-1">
            <Icon name="heroicons:sparkles" size="14" />
            Novo holerite disponível
          </div>
        </div>

        <!-- Footer com Botões -->
        <div class="bg-gray-50 px-4 py-3 border-t border-gray-200 flex items-center justify-between gap-2">
          <button
            @click="visualizarHolerite(holerite)"
            class="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-blue-700 hover:bg-blue-100 rounded-lg transition-colors"
          >
            <Icon name="heroicons:eye" size="16" />
            Visualizar
          </button>
          <button
            @click.stop="baixarPDFDireto(holerite)"
            class="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-green-700 hover:bg-green-100 rounded-lg transition-colors"
          >
            <Icon name="heroicons:arrow-down-tray" size="16" />
            Baixar PDF
          </button>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="text-center py-12 bg-white rounded-xl border-2 border-dashed border-gray-300">
      <Icon name="heroicons:document-text" class="text-gray-300 mx-auto mb-4" size="64" />
      <h3 class="text-lg font-semibold text-gray-800 mb-2">Nenhum holerite disponível</h3>
      <p class="text-gray-600">Seus holerites aparecerão aqui quando forem gerados pelo RH</p>
    </div>

    <!-- Modal de Visualização -->
    <ModalHolerite
      :show="showModal"
      :holerite="holeriteAtual"
      @close="showModal = false"
    />
  </div>
</template>

<script setup lang="ts">
import { downloadHoleritePDF } from '~/utils/holeritePDF'

const loading = ref(false)
const holerites = ref<any[]>([])
const showModal = ref(false)
const holeriteAtual = ref<any>(null)

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value || 0)
}

const formatDate = (date: string) => {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('pt-BR')
}

const nomeMes = (mes: number) => {
  const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
  return meses[mes - 1]
}

const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    gerado: 'blue',
    enviado: 'purple',
    visualizado: 'green',
    pago: 'emerald',
  }
  return colors[status] || 'gray'
}

const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    gerado: 'Disponível',
    enviado: 'Enviado',
    visualizado: 'Visualizado',
    pago: 'Pago',
  }
  return labels[status] || status
}

const carregarHolerites = async () => {
  loading.value = true
  try {
    const response = await $fetch<{ success: boolean; data: any[] }>('/api/funcionario/holerites')
    if (response.success) {
      holerites.value = response.data
    }
  } catch (error) {
    console.error('Erro ao carregar holerites:', error)
  } finally {
    loading.value = false
  }
}

const visualizarHolerite = async (holerite: any) => {
  try {
    // Buscar detalhes completos do holerite
    const response = await $fetch<{ success: boolean; data: any }>(`/api/holerites/${holerite.id}`)
    if (response.success) {
      holeriteAtual.value = response.data
      showModal.value = true
      
      // Atualizar status na lista
      const index = holerites.value.findIndex(h => h.id === holerite.id)
      if (index !== -1) {
        holerites.value[index] = response.data
      }
    }
  } catch (error) {
    console.error('Erro ao visualizar holerite:', error)
    alert('Erro ao carregar holerite')
  }
}

const baixarPDFDireto = async (holerite: any) => {
  try {
    // Buscar dados completos do holerite
    const response = await $fetch<{ success: boolean; data: any }>(`/api/holerites/${holerite.id}`)
    if (!response.success) {
      throw new Error('Erro ao buscar holerite')
    }

    // Buscar dados da empresa
    const { data: empresaData } = await $fetch<{ success: boolean; data: any }>('/api/empresa')
    
    const empresa = empresaData?.success ? {
      nome: empresaData.data.nome || 'EMPRESA',
      cnpj: empresaData.data.cnpj || '',
      endereco: empresaData.data.endereco || '',
      cidade: empresaData.data.cidade || '',
      estado: empresaData.data.estado || '',
    } : undefined

    downloadHoleritePDF(response.data, empresa)
  } catch (error) {
    console.error('Erro ao gerar PDF:', error)
    alert('Erro ao gerar PDF. Tente novamente.')
  }
}

// Carregar ao montar
onMounted(() => {
  carregarHolerites()
})
</script>
