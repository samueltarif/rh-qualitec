<template>
  <UIModal
    :model-value="show"
    @close="fecharModal"
    title="Simulador de Rescisão Contratual"
    size="2xl"
  >
    <div class="space-y-6">
      <!-- Etapa 1: Seleção do Colaborador -->
      <div v-if="etapa === 1" class="space-y-4">
        <div class="bg-amber-50 border-l-4 border-amber-500 p-4 rounded">
          <div class="flex items-start gap-3">
            <Icon name="heroicons:exclamation-triangle" class="text-amber-600 mt-0.5" size="20" />
            <div>
              <h4 class="font-semibold text-amber-900 mb-1">Atenção Legal</h4>
              <p class="text-sm text-amber-800">
                Esta é uma SIMULAÇÃO. Os valores calculados não impactam a folha de pagamento.
                Cálculos incorretos podem gerar passivo trabalhista e ações judiciais.
              </p>
            </div>
          </div>
        </div>

        <!-- Seleção de Colaborador -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Colaborador *
          </label>
          <select
            v-model="form.colaborador_id"
            @change="carregarDadosColaborador"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
            required
          >
            <option value="">Selecione um colaborador</option>
            <option v-for="col in colaboradores" :key="col.id" :value="col.id">
              {{ col.nome }} - {{ col.cargo?.nome || 'Sem cargo' }}
            </option>
          </select>
        </div>

        <!-- Dados do Colaborador (Preview) -->
        <div v-if="colaboradorSelecionado" class="bg-gray-50 rounded-lg p-4 space-y-2">
          <h4 class="font-semibold text-gray-900 mb-3">Dados do Colaborador</h4>
          <div class="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span class="text-gray-600">Cargo:</span>
              <span class="ml-2 font-medium">{{ colaboradorSelecionado.cargo?.nome }}</span>
            </div>
            <div>
              <span class="text-gray-600">Salário Base:</span>
              <span class="ml-2 font-medium">{{ formatarMoeda(colaboradorSelecionado.salario_base) }}</span>
            </div>
            <div>
              <span class="text-gray-600">Admissão:</span>
              <span class="ml-2 font-medium">{{ formatarData(colaboradorSelecionado.data_admissao) }}</span>
            </div>
            <div>
              <span class="text-gray-600">Tipo Contrato:</span>
              <span class="ml-2 font-medium">{{ colaboradorSelecionado.tipo_contrato || 'Indeterminado' }}</span>
            </div>
          </div>
        </div>

        <div class="flex justify-end gap-3 pt-4">
          <UIButton variant="secondary" @click="fecharModal">
            Cancelar
          </UIButton>
          <UIButton
            variant="warning"
            :disabled="!form.colaborador_id"
            @click="etapa = 2"
          >
            Próximo: Dados da Rescisão
          </UIButton>
        </div>
      </div>

      <!-- Etapa 2: Dados da Rescisão -->
      <div v-if="etapa === 2" class="space-y-4">
        <div class="grid grid-cols-2 gap-4">
          <!-- Tipo de Rescisão -->
          <div class="col-span-2">
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Tipo de Rescisão *
            </label>
            <select
              v-model="form.tipo_rescisao"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
              required
            >
              <option value="">Selecione o tipo</option>
              <option value="dispensa_sem_justa_causa">Dispensa sem Justa Causa</option>
              <option value="dispensa_com_justa_causa">Dispensa com Justa Causa</option>
              <option value="pedido_demissao">Pedido de Demissão</option>
              <option value="acordo_mutuo">Rescisão por Acordo (Art. 484-A CLT)</option>
              <option value="termino_experiencia">Término de Contrato de Experiência</option>
              <option value="termino_determinado">Término de Contrato Determinado</option>
              <option value="rescisao_indireta">Rescisão Indireta</option>
              <option value="morte">Morte do Empregado</option>
              <option value="aposentadoria">Aposentadoria</option>
            </select>
          </div>

          <!-- Data de Desligamento -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Data de Desligamento *
            </label>
            <input
              v-model="form.data_desligamento"
              type="date"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
              required
            />
          </div>

          <!-- Aviso Prévio -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Aviso Prévio *
            </label>
            <select
              v-model="form.aviso_previo"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
              required
            >
              <option value="trabalhado">Trabalhado</option>
              <option value="indenizado">Indenizado</option>
              <option value="nao_aplicavel">Não Aplicável</option>
            </select>
          </div>

          <!-- Dias Trabalhados no Mês -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Dias Trabalhados no Mês *
            </label>
            <input
              v-model.number="form.dias_trabalhados"
              type="number"
              min="0"
              max="31"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
              required
            />
          </div>

          <!-- Férias Vencidas -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Possui Férias Vencidas?
            </label>
            <select
              v-model="form.ferias_vencidas"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
            >
              <option :value="false">Não</option>
              <option :value="true">Sim</option>
            </select>
          </div>

          <!-- Média Horas Extras -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Média Horas Extras (últimos 12 meses)
            </label>
            <input
              v-model.number="form.media_horas_extras"
              type="number"
              min="0"
              step="0.01"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
              placeholder="0.00"
            />
          </div>

          <!-- Adicionais -->
          <div class="col-span-2">
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Adicionais (Noturno, Insalubridade, Periculosidade)
            </label>
            <input
              v-model.number="form.adicionais"
              type="number"
              min="0"
              step="0.01"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
              placeholder="R$ 0,00"
            />
          </div>

          <!-- Faltas -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Faltas Injustificadas
            </label>
            <input
              v-model.number="form.faltas"
              type="number"
              min="0"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
              placeholder="0"
            />
          </div>

          <!-- Adiantamentos -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Adiantamentos a Descontar
            </label>
            <input
              v-model.number="form.adiantamentos"
              type="number"
              min="0"
              step="0.01"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
              placeholder="R$ 0,00"
            />
          </div>
        </div>

        <div class="flex justify-between gap-3 pt-4">
          <UIButton variant="secondary" @click="etapa = 1">
            Voltar
          </UIButton>
          <div class="flex gap-3">
            <UIButton variant="secondary" @click="fecharModal">
              Cancelar
            </UIButton>
            <UIButton
              variant="warning"
              :disabled="!validarFormulario()"
              :loading="calculando"
              @click="calcularRescisao"
            >
              Calcular Rescisão
            </UIButton>
          </div>
        </div>
      </div>

      <!-- Etapa 3: Resultado -->
      <div v-if="etapa === 3 && resultado" class="space-y-4">
        <!-- Cabeçalho do Resultado -->
        <div class="bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg p-4 border-2 border-amber-200">
          <div class="flex items-center justify-between mb-3">
            <h3 class="text-lg font-bold text-gray-900">Simulação de Rescisão</h3>
            <span class="px-3 py-1 bg-amber-600 text-white text-xs font-semibold rounded-full">
              {{ getTipoRescisaoLabel(form.tipo_rescisao) }}
            </span>
          </div>
          <div class="grid grid-cols-3 gap-4 text-sm">
            <div>
              <span class="text-gray-600">Colaborador:</span>
              <p class="font-semibold text-gray-900">{{ colaboradorSelecionado?.nome }}</p>
            </div>
            <div>
              <span class="text-gray-600">Data Desligamento:</span>
              <p class="font-semibold text-gray-900">{{ formatarData(form.data_desligamento) }}</p>
            </div>
            <div>
              <span class="text-gray-600">Tempo de Casa:</span>
              <p class="font-semibold text-gray-900">{{ resultado.tempo_casa }}</p>
            </div>
          </div>
        </div>

        <!-- Proventos -->
        <div class="bg-white rounded-lg border-2 border-green-200">
          <div class="bg-green-50 px-4 py-3 border-b border-green-200">
            <h4 class="font-bold text-green-900 flex items-center gap-2">
              <Icon name="heroicons:plus-circle" size="20" />
              Proventos (Valores a Receber)
            </h4>
          </div>
          <div class="p-4 space-y-2">
            <div v-for="item in resultado.proventos" :key="item.descricao" class="flex justify-between text-sm py-2 border-b border-gray-100">
              <span class="text-gray-700">{{ item.descricao }}</span>
              <span class="font-semibold text-green-700">{{ formatarMoeda(item.valor) }}</span>
            </div>
            <div class="flex justify-between text-base font-bold pt-2 border-t-2 border-green-300">
              <span class="text-gray-900">Total Proventos:</span>
              <span class="text-green-700">{{ formatarMoeda(resultado.total_proventos) }}</span>
            </div>
          </div>
        </div>

        <!-- Descontos -->
        <div class="bg-white rounded-lg border-2 border-red-200">
          <div class="bg-red-50 px-4 py-3 border-b border-red-200">
            <h4 class="font-bold text-red-900 flex items-center gap-2">
              <Icon name="heroicons:minus-circle" size="20" />
              Descontos
            </h4>
          </div>
          <div class="p-4 space-y-2">
            <div v-for="item in resultado.descontos" :key="item.descricao" class="flex justify-between text-sm py-2 border-b border-gray-100">
              <span class="text-gray-700">{{ item.descricao }}</span>
              <span class="font-semibold text-red-700">{{ formatarMoeda(item.valor) }}</span>
            </div>
            <div class="flex justify-between text-base font-bold pt-2 border-t-2 border-red-300">
              <span class="text-gray-900">Total Descontos:</span>
              <span class="text-red-700">{{ formatarMoeda(resultado.total_descontos) }}</span>
            </div>
          </div>
        </div>

        <!-- FGTS -->
        <div class="bg-white rounded-lg border-2 border-blue-200">
          <div class="bg-blue-50 px-4 py-3 border-b border-blue-200">
            <h4 class="font-bold text-blue-900 flex items-center gap-2">
              <Icon name="heroicons:building-library" size="20" />
              FGTS
            </h4>
          </div>
          <div class="p-4 space-y-2">
            <div v-for="item in resultado.fgts" :key="item.descricao" class="flex justify-between text-sm py-2 border-b border-gray-100">
              <span class="text-gray-700">{{ item.descricao }}</span>
              <span class="font-semibold text-blue-700">{{ formatarMoeda(item.valor) }}</span>
            </div>
            <div class="flex justify-between text-base font-bold pt-2 border-t-2 border-blue-300">
              <span class="text-gray-900">Total FGTS:</span>
              <span class="text-blue-700">{{ formatarMoeda(resultado.total_fgts) }}</span>
            </div>
          </div>
        </div>

        <!-- Valor Líquido -->
        <div class="bg-gradient-to-r from-amber-500 to-orange-500 rounded-lg p-6 text-white">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-amber-100 text-sm mb-1">Valor Líquido a Receber</p>
              <p class="text-3xl font-bold">{{ formatarMoeda(resultado.valor_liquido) }}</p>
            </div>
            <Icon name="heroicons:currency-dollar" size="48" class="text-amber-200" />
          </div>
        </div>

        <!-- Observações Legais -->
        <div class="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
          <h4 class="font-semibold text-blue-900 mb-2">Observações Legais</h4>
          <ul class="text-sm text-blue-800 space-y-1">
            <li v-for="obs in resultado.observacoes" :key="obs" class="flex items-start gap-2">
              <Icon name="heroicons:information-circle" size="16" class="mt-0.5 flex-shrink-0" />
              <span>{{ obs }}</span>
            </li>
          </ul>
        </div>

        <!-- Ações -->
        <div class="flex justify-between gap-3 pt-4">
          <UIButton variant="secondary" @click="etapa = 2">
            Voltar
          </UIButton>
          <div class="flex gap-3">
            <UIButton variant="secondary" @click="exportarPDF">
              <Icon name="heroicons:document-arrow-down" size="20" class="mr-2" />
              Exportar Simulação
            </UIButton>
            <UIButton variant="info" @click="visualizarTRCT">
              <Icon name="heroicons:eye" size="20" class="mr-2" />
              Visualizar TRCT
            </UIButton>
            <UIButton variant="primary" @click="gerarTRCT">
              <Icon name="heroicons:document-text" size="20" class="mr-2" />
              Gerar TRCT Oficial
            </UIButton>
            <UIButton variant="warning" @click="novaSimulacao">
              Nova Simulação
            </UIButton>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de Visualização do TRCT -->
    <ModalVisualizarTRCT
      :show="mostrarTRCT"
      :empresa="empresaData"
      :colaborador="colaboradorSelecionado"
      :dados-rescisao="form"
      :calculos="resultado"
      @close="mostrarTRCT = false"
    />
  </UIModal>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

const props = defineProps<{
  show: boolean
}>()

const emit = defineEmits<{
  close: []
}>()

// Estado
const etapa = ref(1)
const calculando = ref(false)
const colaboradores = ref<any[]>([])
const colaboradorSelecionado = ref<any>(null)
const resultado = ref<any>(null)
const mostrarTRCT = ref(false)
const empresaData = ref<any>(null)

// Formulário
const form = ref({
  colaborador_id: '',
  tipo_rescisao: '',
  data_desligamento: '',
  aviso_previo: 'indenizado',
  dias_trabalhados: 0,
  ferias_vencidas: false,
  media_horas_extras: 0,
  adicionais: 0,
  faltas: 0,
  adiantamentos: 0
})

// Carregar colaboradores
onMounted(async () => {
  try {
    const { data } = await useFetch('/api/colaboradores')
    if (data.value) {
      colaboradores.value = data.value
    }
  } catch (error) {
    console.error('Erro ao carregar colaboradores:', error)
  }
})

// Carregar dados do colaborador
const carregarDadosColaborador = async () => {
  if (!form.value.colaborador_id) return
  
  try {
    const { data } = await useFetch(`/api/colaboradores/${form.value.colaborador_id}`)
    if (data.value) {
      colaboradorSelecionado.value = data.value
      
      // Preencher dias trabalhados com base no mês atual
      const hoje = new Date()
      form.value.dias_trabalhados = hoje.getDate()
    }
  } catch (error) {
    console.error('Erro ao carregar colaborador:', error)
  }
}

// Validar formulário
const validarFormulario = () => {
  return form.value.tipo_rescisao && 
         form.value.data_desligamento && 
         form.value.dias_trabalhados > 0
}

// Calcular rescisão
const calcularRescisao = async () => {
  calculando.value = true
  
  try {
    const { data, error } = await useFetch('/api/rescisao/simular', {
      method: 'POST',
      body: {
        ...form.value,
        colaborador: colaboradorSelecionado.value
      }
    })
    
    if (error.value) {
      throw new Error(error.value.message)
    }
    
    resultado.value = data.value
    etapa.value = 3
  } catch (error: any) {
    console.error('Erro ao calcular rescisão:', error)
    alert('Erro ao calcular rescisão: ' + error.message)
  } finally {
    calculando.value = false
  }
}

// Exportar PDF da Simulação
const exportarPDF = async () => {
  try {
    const response = await $fetch('/api/rescisao/exportar-pdf', {
      method: 'POST',
      body: {
        form: form.value,
        colaborador: colaboradorSelecionado.value,
        resultado: resultado.value
      }
    })
    
    // Criar link para download
    const blob = new Blob([response as any], { type: 'application/pdf' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `simulacao_rescisao_${colaboradorSelecionado.value.nome}_${new Date().getTime()}.pdf`
    link.click()
    window.URL.revokeObjectURL(url)
  } catch (error) {
    console.error('Erro ao exportar simulação:', error)
    alert('Erro ao exportar simulação em PDF')
  }
}

// Visualizar TRCT
const visualizarTRCT = async () => {
  try {
    // Buscar dados da empresa se ainda não tiver
    if (!empresaData.value) {
      const { data: empresa } = await useFetch('/api/empresa')
      
      if (!empresa.value) {
        alert('Configure os dados da empresa antes de visualizar o TRCT')
        return
      }
      
      empresaData.value = empresa.value
    }
    
    mostrarTRCT.value = true
  } catch (error) {
    console.error('Erro ao carregar dados da empresa:', error)
    alert('Erro ao carregar dados da empresa')
  }
}

// Gerar TRCT Oficial
const gerarTRCT = async () => {
  try {
    // Buscar dados da empresa se ainda não tiver
    if (!empresaData.value) {
      const { data: empresa } = await useFetch('/api/empresa')
      
      if (!empresa.value) {
        alert('Configure os dados da empresa antes de gerar o TRCT')
        return
      }
      
      empresaData.value = empresa.value
    }

    const response = await $fetch('/api/rescisao/gerar-trct', {
      method: 'POST',
      body: {
        colaborador: colaboradorSelecionado.value,
        dadosRescisao: form.value,
        empresa: empresaData.value
      }
    })
    
    // Criar link para download do TRCT
    const blob = new Blob([response as any], { type: 'application/pdf' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `TRCT_${colaboradorSelecionado.value.nome.replace(/\s+/g, '_')}_${new Date().getTime()}.pdf`
    link.click()
    window.URL.revokeObjectURL(url)
    
    alert('TRCT gerado com sucesso! \n\nIMPORTANTE: Este documento possui validade legal e deve ser assinado pelas partes.')
  } catch (error) {
    console.error('Erro ao gerar TRCT:', error)
    alert('Erro ao gerar TRCT oficial')
  }
}

// Nova simulação
const novaSimulacao = () => {
  etapa.value = 1
  form.value = {
    colaborador_id: '',
    tipo_rescisao: '',
    data_desligamento: '',
    aviso_previo: 'indenizado',
    dias_trabalhados: 0,
    ferias_vencidas: false,
    media_horas_extras: 0,
    adicionais: 0,
    faltas: 0,
    adiantamentos: 0
  }
  colaboradorSelecionado.value = null
  resultado.value = null
}

// Fechar modal
const fecharModal = () => {
  novaSimulacao()
  emit('close')
}

// Helpers
const formatarMoeda = (valor: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(valor || 0)
}

const formatarData = (data: string) => {
  if (!data) return ''
  return new Date(data + 'T00:00:00').toLocaleDateString('pt-BR')
}

const getTipoRescisaoLabel = (tipo: string) => {
  const labels: Record<string, string> = {
    'dispensa_sem_justa_causa': 'Dispensa sem Justa Causa',
    'dispensa_com_justa_causa': 'Dispensa com Justa Causa',
    'pedido_demissao': 'Pedido de Demissão',
    'acordo_mutuo': 'Acordo Mútuo (Art. 484-A)',
    'termino_experiencia': 'Término de Experiência',
    'termino_determinado': 'Término de Contrato',
    'rescisao_indireta': 'Rescisão Indireta',
    'morte': 'Morte do Empregado',
    'aposentadoria': 'Aposentadoria'
  }
  return labels[tipo] || tipo
}
</script>
