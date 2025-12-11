<template>
  <div class="space-y-4 sm:space-y-6">
    <!-- Header Responsivo -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div>
        <h2 class="text-xl sm:text-2xl font-bold text-gray-800">Meus Holerites</h2>
        <p class="text-sm sm:text-base text-gray-600">Visualize e baixe seus comprovantes de pagamento</p>
      </div>
      <UIButton 
        variant="secondary" 
        icon-left="heroicons:arrow-path"
        @click="carregarHolerites"
        :disabled="loading"
        size="sm"
        class="self-start sm:self-auto"
      >
        <span class="hidden sm:inline">Atualizar</span>
        <span class="sm:hidden">Atualizar</span>
      </UIButton>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="text-center py-8 sm:py-12">
      <Icon name="heroicons:arrow-path" class="animate-spin text-gray-400 mx-auto mb-4 w-10 h-10 sm:w-12 sm:h-12" />
      <p class="text-gray-600 text-sm sm:text-base">Carregando holerites...</p>
    </div>

    <!-- Lista de Holerites - Grid Responsivo -->
    <div v-else-if="holerites.length > 0" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
      <div
        v-for="holerite in holerites"
        :key="holerite.id"
        class="bg-white rounded-lg sm:rounded-xl border-2 border-gray-200 hover:border-blue-400 transition-all group"
      >
        <div class="p-4 sm:p-6 cursor-pointer" @click="visualizarHolerite(holerite)">
          <!-- Período -->
          <div class="flex items-center justify-between mb-3 sm:mb-4">
            <div class="flex items-center gap-2 sm:gap-3">
              <div class="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors flex-shrink-0">
                <Icon name="heroicons:document-text" class="text-blue-600 w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div>
                <p class="font-bold text-gray-800 text-sm sm:text-base">{{ nomeMes(holerite.mes) }}</p>
                <p class="text-xs sm:text-sm text-gray-500">{{ holerite.ano }}</p>
              </div>
            </div>
            <UIBadge :color="getStatusColor(holerite.status)" class="text-xs">
              {{ getStatusLabel(holerite.status) }}
            </UIBadge>
          </div>

          <!-- Valores -->
          <div class="space-y-1.5 sm:space-y-2 mb-3 sm:mb-4">
            <div class="flex justify-between text-xs sm:text-sm">
              <span class="text-gray-600">Salário Bruto</span>
              <span class="font-semibold text-gray-800">{{ formatCurrency(calcularTotalProventos(holerite)) }}</span>
            </div>
            <div class="flex justify-between text-xs sm:text-sm">
              <span class="text-gray-600">Descontos</span>
              <span class="font-semibold text-red-600">{{ formatCurrency(calcularTotalDescontos(holerite)) }}</span>
            </div>
            <div class="flex justify-between pt-2 border-t border-gray-200">
              <span class="font-semibold text-gray-700 text-xs sm:text-sm">Líquido</span>
              <span class="font-bold text-green-600 text-base sm:text-lg">{{ formatCurrency(calcularSalarioLiquido(holerite)) }}</span>
            </div>
          </div>

          <!-- Data de Visualização -->
          <div v-if="holerite.visualizado_em" class="text-[10px] sm:text-xs text-gray-500 flex items-center gap-1">
            <Icon name="heroicons:eye" class="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            Visualizado em {{ formatDate(holerite.visualizado_em) }}
          </div>
          <div v-else class="text-[10px] sm:text-xs text-blue-600 font-semibold flex items-center gap-1">
            <Icon name="heroicons:sparkles" class="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            Novo holerite disponível
          </div>
        </div>

        <!-- Footer com Botões - Responsivo -->
        <div class="bg-gray-50 px-3 sm:px-4 py-2 sm:py-3 border-t border-gray-200 flex items-center justify-between gap-2">
          <button
            @click="visualizarHolerite(holerite)"
            class="flex-1 flex items-center justify-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-2 text-xs sm:text-sm font-medium text-blue-700 hover:bg-blue-100 active:bg-blue-200 rounded-lg transition-colors touch-manipulation"
          >
            <Icon name="heroicons:eye" class="w-4 h-4" />
            <span>Visualizar</span>
          </button>
          <button
            @click.stop="baixarPDFDireto(holerite)"
            class="flex-1 flex items-center justify-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-2 text-xs sm:text-sm font-medium text-green-700 hover:bg-green-100 active:bg-green-200 rounded-lg transition-colors touch-manipulation"
          >
            <Icon name="heroicons:arrow-down-tray" class="w-4 h-4" />
            <span>Baixar PDF</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Empty State - Responsivo -->
    <div v-else class="text-center py-8 sm:py-12 bg-white rounded-lg sm:rounded-xl border-2 border-dashed border-gray-300">
      <Icon name="heroicons:document-text" class="text-gray-300 mx-auto mb-3 sm:mb-4 w-12 h-12 sm:w-16 sm:h-16" />
      <h3 class="text-base sm:text-lg font-semibold text-gray-800 mb-1 sm:mb-2">Nenhum holerite disponível</h3>
      <p class="text-sm sm:text-base text-gray-600 px-4">Seus holerites aparecerão aqui quando forem gerados pelo RH</p>
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

// Funções de cálculo - usa valores do banco quando disponíveis
const calcularTotalProventos = (holerite: any) => {
  // Se já existe o valor calculado no banco, usar ele
  if (holerite.total_proventos !== undefined && holerite.total_proventos !== null) {
    return holerite.total_proventos
  }
  
  // Senão, calcular dinamicamente (fallback)
  let total = holerite.salario_base || 0
  
  // Horas extras
  total += holerite.valor_horas_extras_50 || 0
  total += holerite.valor_horas_extras_100 || 0
  
  // Adicionais
  total += holerite.bonus || 0
  total += holerite.comissoes || 0
  total += holerite.adicional_insalubridade || 0
  total += holerite.adicional_periculosidade || 0
  total += holerite.adicional_noturno || 0
  total += holerite.outros_proventos || 0
  
  // Itens personalizados - proventos
  const itensPersonalizados = holerite.itens_personalizados || []
  itensPersonalizados
    .filter((item: any) => item.tipo === 'provento')
    .forEach((item: any) => {
      total += item.valor || 0
    })
  
  return total
}

const calcularTotalDescontos = (holerite: any) => {
  // Se já existe o valor calculado no banco, usar ele
  if (holerite.total_descontos !== undefined && holerite.total_descontos !== null) {
    return holerite.total_descontos
  }
  
  // Senão, calcular dinamicamente (fallback)
  let total = 0
  
  // Impostos
  total += holerite.inss || 0
  total += holerite.irrf || 0
  
  // Descontos
  total += holerite.adiantamento || 0
  total += holerite.emprestimos || 0
  total += holerite.faltas || 0
  total += holerite.atrasos || 0
  total += holerite.outros_descontos || 0
  
  // Benefícios (descontados)
  total += holerite.plano_saude || 0
  total += holerite.plano_odontologico || 0
  total += holerite.seguro_vida || 0
  total += holerite.auxilio_creche || 0
  total += holerite.auxilio_educacao || 0
  total += holerite.auxilio_combustivel || 0
  total += holerite.outros_beneficios || 0
  
  // Itens personalizados - descontos
  const itensPersonalizados = holerite.itens_personalizados || []
  itensPersonalizados
    .filter((item: any) => item.tipo === 'desconto')
    .forEach((item: any) => {
      total += item.valor || 0
    })
  
  return total
}

const calcularSalarioLiquido = (holerite: any) => {
  // Se já existe o valor calculado no banco, usar ele
  if (holerite.salario_liquido !== undefined && holerite.salario_liquido !== null) {
    return holerite.salario_liquido
  }
  
  // Senão, calcular dinamicamente (fallback)
  return calcularTotalProventos(holerite) - calcularTotalDescontos(holerite)
}

// Carregar ao montar
onMounted(() => {
  carregarHolerites()
})
</script>
