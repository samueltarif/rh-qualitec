<template>
  <div class="space-y-6">
    <!-- Informações do Funcionário -->
    <div class="bg-gray-50 rounded-xl p-4">
      <h3 class="font-semibold text-gray-900 mb-2">{{ holerite.funcionario.nome_completo }}</h3>
      <div v-if="carregandoDados" class="text-sm text-gray-500">
        ⏳ Carregando informações...
      </div>
      <div v-else class="grid grid-cols-2 gap-2 text-sm">
        <div>
          <span class="text-gray-600">Cargo:</span>
          <span class="ml-2 font-medium">{{ holerite.funcionario.cargo }}</span>
        </div>
        <div>
          <span class="text-gray-600">Empresa:</span>
          <span class="ml-2 font-medium">
            {{ empresaInfo ? (empresaInfo.nome_fantasia || empresaInfo.nome || 'Não definida') : 'Não encontrada' }}
          </span>
        </div>
        <div v-if="empresaInfo?.cnpj" class="col-span-2">
          <span class="text-gray-600">CNPJ:</span>
          <span class="ml-2 font-medium">{{ formatarCNPJ(empresaInfo.cnpj) }}</span>
        </div>
        <div v-if="horasPadrao > 0" class="col-span-2">
          <span class="text-gray-600">Horas Padrão do Mês:</span>
          <span class="ml-2 font-medium">{{ horasPadrao }}h</span>
        </div>
      </div>
    </div>

    <!-- Abas -->
    <div class="border-b border-gray-200">
      <nav class="-mb-px flex space-x-8">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          @click="abaAtiva = tab.id"
          :class="[
            'py-2 px-1 border-b-2 font-medium text-sm transition-colors',
            abaAtiva === tab.id
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          ]"
        >
          {{ tab.icon }} {{ tab.label }}
        </button>
      </nav>
    </div>

    <!-- Aba: Dados Básicos -->
    <div v-if="abaAtiva === 'basicos'" class="space-y-4">
      <div class="grid grid-cols-2 gap-4">
        <UiInput 
          v-model="form.salario_base" 
          type="number" 
          label="Salário Base"
          placeholder="0.00"
          step="0.01"
        />
        
        <UiInput 
          v-model="form.horas_trabalhadas" 
          type="number" 
          label="Horas Trabalhadas no Mês"
          :placeholder="`Padrão: ${horasPadrao}h`"
          step="0.01"
        />
      </div>

      <div class="grid grid-cols-2 gap-4">
        <UiInput 
          v-model="form.data_pagamento" 
          type="date" 
          label="Data de Pagamento"
        />
        
        <UiInput 
          v-model="form.observacoes" 
          label="Observações"
          placeholder="Observações sobre este holerite"
        />
      </div>
    </div>

    <!-- Aba: Proventos -->
    <div v-if="abaAtiva === 'proventos'" class="space-y-4">
      <div class="grid grid-cols-2 gap-4">
        <UiInput 
          v-model="form.bonus" 
          type="number" 
          label="Bônus"
          placeholder="0.00"
          step="0.01"
        />
        
        <UiInput 
          v-model="form.horas_extras" 
          type="number" 
          label="Horas Extras"
          placeholder="0.00"
          step="0.01"
        />
      </div>

      <div class="grid grid-cols-2 gap-4">
        <UiInput 
          v-model="form.adicional_noturno" 
          type="number" 
          label="Adicional Noturno"
          placeholder="0.00"
          step="0.01"
        />
        
        <UiInput 
          v-model="form.adicional_periculosidade" 
          type="number" 
          label="Adicional de Periculosidade"
          placeholder="0.00"
          step="0.01"
        />
      </div>

      <div class="grid grid-cols-2 gap-4">
        <UiInput 
          v-model="form.adicional_insalubridade" 
          type="number" 
          label="Adicional de Insalubridade"
          placeholder="0.00"
          step="0.01"
        />
        
        <UiInput 
          v-model="form.comissoes" 
          type="number" 
          label="Comissões"
          placeholder="0.00"
          step="0.01"
        />
      </div>

      <!-- Total de Proventos -->
      <div class="bg-green-50 p-4 rounded-lg">
        <div class="flex justify-between items-center">
          <span class="font-semibold text-green-700">Total de Proventos:</span>
          <span class="text-xl font-bold text-green-700">{{ formatarMoeda(calcularTotalProventos()) }}</span>
        </div>
      </div>
    </div>

    <!-- Aba: Descontos -->
    <div v-if="abaAtiva === 'descontos'" class="space-y-4">
      <div class="grid grid-cols-2 gap-4">
        <UiInput 
          v-model="form.inss" 
          type="number" 
          label="INSS"
          placeholder="0.00"
          step="0.01"
        />
        
        <UiInput 
          v-model="form.irrf" 
          type="number" 
          label="IRRF"
          placeholder="0.00"
          step="0.01"
        />
      </div>

      <div class="grid grid-cols-2 gap-4">
        <UiInput 
          v-model="form.vale_transporte" 
          type="number" 
          label="Vale Transporte"
          placeholder="0.00"
          step="0.01"
        />
        
        <UiInput 
          v-model="form.vale_refeicao_desconto" 
          type="number" 
          label="Vale Refeição"
          placeholder="0.00"
          step="0.01"
        />
      </div>

      <div class="grid grid-cols-2 gap-4">
        <UiInput 
          v-model="form.plano_saude" 
          type="number" 
          label="Plano de Saúde"
          placeholder="0.00"
          step="0.01"
        />
        
        <UiInput 
          v-model="form.plano_odontologico" 
          type="number" 
          label="Plano Odontológico"
          placeholder="0.00"
          step="0.01"
        />
      </div>

      <div class="grid grid-cols-2 gap-4">
        <UiInput 
          v-model="form.adiantamento" 
          type="number" 
          label="Adiantamento"
          placeholder="0.00"
          step="0.01"
        />
        
        <UiInput 
          v-model="form.faltas" 
          type="number" 
          label="Faltas"
          placeholder="0.00"
          step="0.01"
        />
      </div>

      <!-- Total de Descontos -->
      <div class="bg-red-50 p-4 rounded-lg">
        <div class="flex justify-between items-center">
          <span class="font-semibold text-red-700">Total de Descontos:</span>
          <span class="text-xl font-bold text-red-700">{{ formatarMoeda(calcularTotalDescontos()) }}</span>
        </div>
      </div>
    </div>

    <!-- Resumo -->
    <div class="bg-blue-50 p-4 rounded-lg border-2 border-blue-200">
      <div class="space-y-2">
        <div class="flex justify-between text-sm">
          <span class="text-gray-700">Total Proventos:</span>
          <span class="font-semibold text-green-600">{{ formatarMoeda(calcularTotalProventos()) }}</span>
        </div>
        <div class="flex justify-between text-sm">
          <span class="text-gray-700">Total Descontos:</span>
          <span class="font-semibold text-red-600">- {{ formatarMoeda(calcularTotalDescontos()) }}</span>
        </div>
        <div class="border-t border-blue-300 pt-2 flex justify-between">
          <span class="font-bold text-blue-900">Salário Líquido:</span>
          <span class="text-2xl font-bold text-blue-900">{{ formatarMoeda(calcularSalarioLiquido()) }}</span>
        </div>
      </div>
    </div>

    <!-- Botões -->
    <div class="flex justify-end gap-3 pt-4 border-t">
      <UiButton variant="secondary" @click="$emit('cancel')">
        Cancelar
      </UiButton>
      <UiButton @click="salvar">
        💾 Salvar Alterações
      </UiButton>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  holerite: any
}>()

const emit = defineEmits<{
  save: [data: any]
  cancel: []
}>()

// Estados
const abaAtiva = ref('basicos')
const empresaInfo = ref<any>(null)
const horasPadrao = ref<number>(0)
const carregandoDados = ref(true)

const tabs = [
  { id: 'basicos', label: 'Dados Básicos', icon: '📋' },
  { id: 'proventos', label: 'Proventos', icon: '💰' },
  { id: 'descontos', label: 'Descontos', icon: '📉' }
]

// Formulário
const form = ref({
  salario_base: props.holerite.salario_base || 0,
  horas_trabalhadas: props.holerite.horas_trabalhadas || 0,
  data_pagamento: props.holerite.data_pagamento || '',
  observacoes: props.holerite.observacoes || '',
  bonus: props.holerite.bonus || 0,
  horas_extras: props.holerite.horas_extras || 0,
  adicional_noturno: props.holerite.adicional_noturno || 0,
  adicional_periculosidade: props.holerite.adicional_periculosidade || 0,
  adicional_insalubridade: props.holerite.adicional_insalubridade || 0,
  comissoes: props.holerite.comissoes || 0,
  inss: props.holerite.inss || 0,
  irrf: props.holerite.irrf || 0,
  vale_transporte: props.holerite.vale_transporte || 0,
  vale_refeicao_desconto: props.holerite.vale_refeicao_desconto || 0,
  plano_saude: props.holerite.plano_saude || 0,
  plano_odontologico: props.holerite.plano_odontologico || 0,
  adiantamento: props.holerite.adiantamento || 0,
  faltas: props.holerite.faltas || 0
})

// Buscar informações da empresa e jornada do funcionário
const carregarDadosAdicionais = async () => {
  carregandoDados.value = true
  try {
    // O holerite pode ter funcionario_id ou funcionario.id
    const funcId = props.holerite.funcionario_id || props.holerite.funcionario?.id
    
    if (!funcId) {
      console.error('ID do funcionário não encontrado no holerite')
      carregandoDados.value = false
      return
    }
    
    console.log('Buscando dados do funcionário:', funcId)
    
    // Buscar dados do funcionário completo
    const funcionario: any = await $fetch(`/api/funcionarios/${funcId}`)
    console.log('Funcionário carregado:', funcionario)
    
    // Buscar empresa
    if (funcionario.empresa_id) {
      console.log('Buscando empresa:', funcionario.empresa_id)
      const response: any = await $fetch(`/api/empresas/${funcionario.empresa_id}`)
      empresaInfo.value = response.data || response
      console.log('Empresa carregada:', empresaInfo.value)
    }
    
    // Buscar jornada para calcular horas do mês
    const jornadaId = funcionario.jornada_id || funcionario.jornada_trabalho_id
    if (jornadaId) {
      console.log('Buscando jornada:', jornadaId)
      const jornada: any = await $fetch(`/api/jornadas/${jornadaId}`)
      console.log('Jornada carregada:', jornada)
      
      // Calcular horas do mês (4.33 semanas em média por mês)
      const horasSemanais = jornada.horas_semanais || 0
      horasPadrao.value = Math.round(horasSemanais * 4.33)
      
      console.log('Horas semanais:', horasSemanais, 'Horas do mês:', horasPadrao.value)
      
      // Se não tiver horas trabalhadas definidas, usar o padrão do mês
      if (!form.value.horas_trabalhadas || form.value.horas_trabalhadas === 0) {
        form.value.horas_trabalhadas = horasPadrao.value
      }
    }
  } catch (error) {
    console.error('Erro ao carregar dados adicionais:', error)
  } finally {
    carregandoDados.value = false
  }
}

// Cálculos
const calcularTotalProventos = () => {
  return (
    Number(form.value.salario_base) +
    Number(form.value.bonus) +
    Number(form.value.horas_extras) +
    Number(form.value.adicional_noturno) +
    Number(form.value.adicional_periculosidade) +
    Number(form.value.adicional_insalubridade) +
    Number(form.value.comissoes)
  )
}

const calcularTotalDescontos = () => {
  return (
    Number(form.value.inss) +
    Number(form.value.irrf) +
    Number(form.value.vale_transporte) +
    Number(form.value.vale_refeicao_desconto) +
    Number(form.value.plano_saude) +
    Number(form.value.plano_odontologico) +
    Number(form.value.adiantamento) +
    Number(form.value.faltas)
  )
}

const calcularSalarioLiquido = () => {
  return calcularTotalProventos() - calcularTotalDescontos()
}

// Formatação
const formatarMoeda = (valor: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(valor)
}

const formatarCNPJ = (cnpj: string) => {
  const numeros = cnpj.replace(/\D/g, '')
  return numeros.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5')
}

// Salvar
const salvar = () => {
  emit('save', form.value)
}

// Carregar dados ao montar
onMounted(() => {
  carregarDadosAdicionais()
})
</script>
