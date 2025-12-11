<template>
  <div class="bg-white rounded-xl border-2 border-gray-200 hover:border-blue-400 transition-all group">
    <div class="p-6">
      <!-- Header -->
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

      <!-- Colaborador -->
      <div class="mb-4">
        <p class="text-sm text-gray-500">Colaborador</p>
        <p class="font-semibold text-gray-800">{{ holerite.nome_colaborador }}</p>
      </div>

      <!-- Valores -->
      <div class="space-y-2 mb-4">
        <div class="flex justify-between text-sm">
          <span class="text-gray-600">Salário Bruto</span>
          <span class="font-semibold text-gray-800">{{ formatCurrency(calcularSalarioBruto()) }}</span>
        </div>
        <div class="flex justify-between text-sm">
          <span class="text-gray-600">Descontos</span>
          <span class="font-semibold text-red-600">-{{ formatCurrency(calcularTotalDescontos()) }}</span>
        </div>
        <div class="flex justify-between pt-2 border-t">
          <span class="font-bold text-gray-800">Líquido</span>
          <span class="font-bold text-green-600">{{ formatCurrency(calcularSalarioLiquido()) }}</span>
        </div>
      </div>

      <!-- Tipo -->
      <div v-if="holerite.tipo === 'decimo_terceiro'" class="mb-4">
        <UIBadge color="purple">
          13º Salário - {{ holerite.parcela_13 }}ª Parcela
        </UIBadge>
      </div>

      <!-- Ações -->
      <div class="flex gap-2">
        <UIButton
          variant="secondary"
          size="sm"
          icon-left="heroicons:eye"
          @click="$emit('visualizar', holerite)"
          class="flex-1"
        >
          Visualizar
        </UIButton>
        
        <UIButton
          v-if="showDelete && holerite.status === 'gerado'"
          variant="danger"
          size="sm"
          icon-left="heroicons:trash"
          @click="$emit('excluir', holerite)"
        >
          Excluir
        </UIButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Holerite {
  id: string
  mes: number
  ano: number
  nome_colaborador: string
  salario_base: number
  salario_bruto: number
  total_descontos: number
  salario_liquido: number
  status: string
  tipo?: string
  parcela_13?: string
  // Proventos
  valor_horas_extras_50?: number
  valor_horas_extras_100?: number
  bonus?: number
  comissoes?: number
  adicional_insalubridade?: number
  adicional_periculosidade?: number
  adicional_noturno?: number
  outros_proventos?: number
  // Descontos
  inss?: number
  irrf?: number
  adiantamento?: number
  emprestimos?: number
  faltas?: number
  atrasos?: number
  plano_saude?: number
  plano_odontologico?: number
  seguro_vida?: number
  auxilio_creche?: number
  auxilio_educacao?: number
  auxilio_combustivel?: number
  outros_beneficios?: number
  outros_descontos?: number
  // Itens personalizados
  itens_personalizados?: Array<{
    tipo: 'provento' | 'desconto'
    valor: number
  }>
}

interface Props {
  holerite: Holerite
  showDelete?: boolean
}

const props = defineProps<Props>()
defineEmits(['visualizar', 'excluir'])

const nomeMes = (mes: number) => {
  const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
  return meses[mes - 1]
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value || 0)
}

const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    gerado: 'blue',
    enviado: 'green',
    pago: 'purple',
    cancelado: 'red'
  }
  return colors[status] || 'gray'
}

const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    gerado: 'Gerado',
    enviado: 'Enviado',
    pago: 'Pago',
    cancelado: 'Cancelado'
  }
  return labels[status] || status
}

const calcularSalarioBruto = () => {
  let total = props.holerite.salario_base || 0
  total += props.holerite.valor_horas_extras_50 || 0
  total += props.holerite.valor_horas_extras_100 || 0
  total += props.holerite.bonus || 0
  total += props.holerite.comissoes || 0
  total += props.holerite.adicional_insalubridade || 0
  total += props.holerite.adicional_periculosidade || 0
  total += props.holerite.adicional_noturno || 0
  total += props.holerite.outros_proventos || 0
  
  // Itens personalizados - proventos
  const itensPersonalizados = props.holerite.itens_personalizados || []
  itensPersonalizados
    .filter((item: any) => item.tipo === 'provento')
    .forEach((item: any) => {
      total += item.valor || 0
    })
  
  return total
}

const calcularTotalDescontos = () => {
  let total = 0
  total += props.holerite.inss || 0
  total += props.holerite.irrf || 0
  total += props.holerite.adiantamento || 0
  total += props.holerite.emprestimos || 0
  total += props.holerite.faltas || 0
  total += props.holerite.atrasos || 0
  total += props.holerite.plano_saude || 0
  total += props.holerite.plano_odontologico || 0
  total += props.holerite.seguro_vida || 0
  total += props.holerite.auxilio_creche || 0
  total += props.holerite.auxilio_educacao || 0
  total += props.holerite.auxilio_combustivel || 0
  total += props.holerite.outros_beneficios || 0
  total += props.holerite.outros_descontos || 0
  
  // Itens personalizados - descontos
  const itensPersonalizados = props.holerite.itens_personalizados || []
  itensPersonalizados
    .filter((item: any) => item.tipo === 'desconto')
    .forEach((item: any) => {
      total += item.valor || 0
    })
  
  return total
}

const calcularSalarioLiquido = () => {
  return calcularSalarioBruto() - calcularTotalDescontos()
}
</script>
