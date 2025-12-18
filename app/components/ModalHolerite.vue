<template>
  <UIModal v-model="isOpen" size="xl">
    <template #header>
      <div class="flex items-center gap-3">
        <Icon name="heroicons:document-text" class="text-blue-600" size="24" />
        <div>
          <h3 class="text-lg font-semibold text-gray-800">Holerite</h3>
          <p class="text-sm text-gray-500">{{ nomeMes(holerite.mes) }}/{{ holerite.ano }}</p>
        </div>
      </div>
    </template>

    <div v-if="holerite" class="space-y-4 bg-white">
      <!-- Cabeçalho com Logo e Dados da Empresa -->
      <div class="border-b-2 border-gray-300 pb-4">
        <div class="flex items-start justify-between mb-3">
          <div class="flex items-center gap-4">
            <img src="/images/logo.png" alt="Qualitec" class="h-16 w-auto" />
            <div class="text-sm">
              <h2 class="text-lg font-bold text-gray-800 uppercase">{{ empresa?.nome || 'QUALITEC INSTRUMENTOS LTDA' }}</h2>
              <p class="text-gray-600">CNPJ: {{ formatCNPJ(empresa?.cnpj || '09.117.117/0001-24') }}</p>
              <p class="text-gray-600">{{ empresa?.endereco || 'R. Fazenda Monte Alegre, 367 - Vila Jaraguá, São Paulo - SP, 05160-060' }}</p>
              <p class="text-gray-600">Tel: {{ empresa?.telefone || '(11) 3908-7100' }}</p>
            </div>
          </div>
          <div class="text-right">
            <button @click="baixarPDF" class="text-sm text-blue-600 hover:text-blue-800 font-medium">
              Baixar PDF
            </button>
          </div>
        </div>
        
        <h3 class="text-center text-xl font-bold text-gray-700 uppercase mt-4">
          {{ holerite.tipo === 'decimo_terceiro' ? 'DEMONSTRATIVO DE PAGAMENTO' : 'DEMONSTRATIVO DE PAGAMENTO' }}
        </h3>
      </div>

      <!-- Dados do Colaborador -->
      <div class="grid grid-cols-2 gap-x-8 gap-y-2 text-sm border-b border-gray-200 pb-3">
        <div class="flex">
          <span class="font-semibold text-gray-700 w-40">Nome do Colaborador</span>
          <span class="text-gray-900 font-medium">{{ holerite.nome_colaborador }}</span>
        </div>
        <div class="flex">
          <span class="font-semibold text-gray-700 w-32">Cargo</span>
          <span class="text-gray-900">{{ holerite.cargo || '-' }}</span>
        </div>
        <div class="flex">
          <span class="font-semibold text-gray-700 w-40">CPF</span>
          <span class="text-gray-900">{{ formatCPF(holerite.cpf) }}</span>
        </div>
        <div class="flex">
          <span class="font-semibold text-gray-700 w-32">Competência</span>
          <span class="text-blue-600 font-semibold">{{ nomeMes(holerite.mes) }}/{{ holerite.ano }}</span>
        </div>
        <div v-if="holerite.tipo === 'decimo_terceiro' && holerite.meses_trabalhados" class="flex col-span-2">
          <span class="font-semibold text-gray-700 w-40">Data de Pagamento</span>
          <span class="text-gray-900">{{ formatDateBR(holerite.gerado_em) }}</span>
          <span class="font-semibold text-gray-700 w-32 ml-8">Dias Trabalhados</span>
          <span class="text-gray-900 font-semibold">{{ calcularDiasTrabalhados() }}</span>
        </div>
      </div>

      <!-- Tabela de Vencimentos e Descontos -->
      <div class="border border-gray-300">
        <table class="w-full text-sm">
          <thead>
            <tr class="bg-gray-100 border-b border-gray-300">
              <th class="text-left px-4 py-2 font-semibold text-gray-700 w-20">Cód.</th>
              <th class="text-left px-4 py-2 font-semibold text-gray-700">Descrição</th>
              <th class="text-right px-4 py-2 font-semibold text-gray-700 w-32">Vencimentos (R$)</th>
              <th class="text-right px-4 py-2 font-semibold text-gray-700 w-32">Descontos (R$)</th>
            </tr>
          </thead>
          <tbody>
            <!-- Proventos -->
            <tr class="border-b border-gray-200">
              <td class="px-4 py-2 text-gray-700">001</td>
              <td class="px-4 py-2 text-gray-700">Salário Base</td>
              <td class="px-4 py-2 text-right font-medium text-gray-900">{{ formatCurrencySimple(holerite.salario_base) }}</td>
              <td class="px-4 py-2"></td>
            </tr>
            
            <tr v-if="holerite.valor_horas_extras_50 > 0" class="border-b border-gray-200">
              <td class="px-4 py-2 text-gray-700">002</td>
              <td class="px-4 py-2 text-gray-700">Horas Extras 50%</td>
              <td class="px-4 py-2 text-right font-medium text-gray-900">{{ formatCurrencySimple(holerite.valor_horas_extras_50) }}</td>
              <td class="px-4 py-2"></td>
            </tr>
            
            <tr v-if="holerite.valor_horas_extras_100 > 0" class="border-b border-gray-200">
              <td class="px-4 py-2 text-gray-700">003</td>
              <td class="px-4 py-2 text-gray-700">Horas Extras 100%</td>
              <td class="px-4 py-2 text-right font-medium text-gray-900">{{ formatCurrencySimple(holerite.valor_horas_extras_100) }}</td>
              <td class="px-4 py-2"></td>
            </tr>
            
            <tr v-if="holerite.bonus > 0" class="border-b border-gray-200">
              <td class="px-4 py-2 text-gray-700">010</td>
              <td class="px-4 py-2 text-gray-700">Bônus / Gratificações</td>
              <td class="px-4 py-2 text-right font-medium text-gray-900">{{ formatCurrencySimple(holerite.bonus) }}</td>
              <td class="px-4 py-2"></td>
            </tr>
            
            <tr v-if="holerite.comissoes > 0" class="border-b border-gray-200">
              <td class="px-4 py-2 text-gray-700">011</td>
              <td class="px-4 py-2 text-gray-700">Comissões</td>
              <td class="px-4 py-2 text-right font-medium text-gray-900">{{ formatCurrencySimple(holerite.comissoes) }}</td>
              <td class="px-4 py-2"></td>
            </tr>
            
            <tr v-if="holerite.adicional_insalubridade > 0" class="border-b border-gray-200">
              <td class="px-4 py-2 text-gray-700">012</td>
              <td class="px-4 py-2 text-gray-700">Adicional Insalubridade</td>
              <td class="px-4 py-2 text-right font-medium text-gray-900">{{ formatCurrencySimple(holerite.adicional_insalubridade) }}</td>
              <td class="px-4 py-2"></td>
            </tr>
            
            <tr v-if="holerite.adicional_periculosidade > 0" class="border-b border-gray-200">
              <td class="px-4 py-2 text-gray-700">013</td>
              <td class="px-4 py-2 text-gray-700">Adicional Periculosidade</td>
              <td class="px-4 py-2 text-right font-medium text-gray-900">{{ formatCurrencySimple(holerite.adicional_periculosidade) }}</td>
              <td class="px-4 py-2"></td>
            </tr>
            
            <tr v-if="holerite.adicional_noturno > 0" class="border-b border-gray-200">
              <td class="px-4 py-2 text-gray-700">014</td>
              <td class="px-4 py-2 text-gray-700">Adicional Noturno</td>
              <td class="px-4 py-2 text-right font-medium text-gray-900">{{ formatCurrencySimple(holerite.adicional_noturno) }}</td>
              <td class="px-4 py-2"></td>
            </tr>
            
            <tr v-if="holerite.vale_transporte > 0" class="border-b border-gray-200">
              <td class="px-4 py-2 text-gray-700">002</td>
              <td class="px-4 py-2 text-gray-700">Benefício - Vale-Transporte (VT) <span class="text-purple-600 text-xs">(pago pela empresa)</span></td>
              <td class="px-4 py-2 text-right font-medium text-purple-600">{{ formatCurrencySimple(holerite.vale_transporte) }}</td>
              <td class="px-4 py-2"></td>
            </tr>
            
            <tr v-if="holerite.vale_refeicao > 0" class="border-b border-gray-200">
              <td class="px-4 py-2 text-gray-700">003</td>
              <td class="px-4 py-2 text-gray-700">Benefício - Vale-Alimentação (VA) <span class="text-purple-600 text-xs">(pago pela empresa)</span></td>
              <td class="px-4 py-2 text-right font-medium text-purple-600">{{ formatCurrencySimple(holerite.vale_refeicao) }}</td>
              <td class="px-4 py-2"></td>
            </tr>
            
            <tr v-if="holerite.outros_proventos > 0" class="border-b border-gray-200">
              <td class="px-4 py-2 text-gray-700">004</td>
              <td class="px-4 py-2 text-gray-700">{{ holerite.descricao_outros_proventos || 'Outros Proventos' }}</td>
              <td class="px-4 py-2 text-right font-medium text-gray-900">{{ formatCurrencySimple(holerite.outros_proventos) }}</td>
              <td class="px-4 py-2"></td>
            </tr>
            
            <!-- Itens Personalizados - Proventos -->
            <template v-if="holerite.itens_personalizados && holerite.itens_personalizados.length > 0">
              <tr v-for="(item, index) in holerite.itens_personalizados.filter((i: any) => i.tipo === 'provento')" 
                  :key="`provento-${index}`" 
                  class="border-b border-gray-200">
                <td class="px-4 py-2 text-gray-700">{{ item.codigo || '---' }}</td>
                <td class="px-4 py-2 text-gray-700">{{ item.descricao || 'Item Personalizado' }}</td>
                <td class="px-4 py-2 text-right font-medium text-gray-900">{{ formatCurrencySimple(item.valor || 0) }}</td>
                <td class="px-4 py-2"></td>
              </tr>
            </template>
            
            <!-- Total Proventos -->
            <tr class="bg-green-50 border-b-2 border-gray-300">
              <td colspan="2" class="px-4 py-2 font-bold text-green-800 uppercase">Total Proventos</td>
              <td class="px-4 py-2 text-right font-bold text-green-800">{{ formatCurrencySimple(calcularTotalProventos()) }}</td>
              <td class="px-4 py-2"></td>
            </tr>
            
            <!-- Descontos -->
            <tr v-if="holerite.inss > 0" class="border-b border-gray-200">
              <td class="px-4 py-2 text-gray-700">901</td>
              <td class="px-4 py-2 text-gray-700">INSS</td>
              <td class="px-4 py-2"></td>
              <td class="px-4 py-2 text-right font-medium text-red-600">{{ formatCurrencySimple(holerite.inss) }}</td>
            </tr>
            
            <tr v-if="holerite.irrf > 0" class="border-b border-gray-200">
              <td class="px-4 py-2 text-gray-700">902</td>
              <td class="px-4 py-2 text-gray-700">IRRF</td>
              <td class="px-4 py-2"></td>
              <td class="px-4 py-2 text-right font-medium text-red-600">{{ formatCurrencySimple(holerite.irrf) }}</td>
            </tr>
            
            <tr v-if="holerite.adiantamento > 0" class="border-b border-gray-200">
              <td class="px-4 py-2 text-gray-700">910</td>
              <td class="px-4 py-2 text-gray-700">Adiantamento Salarial</td>
              <td class="px-4 py-2"></td>
              <td class="px-4 py-2 text-right font-medium text-red-600">{{ formatCurrencySimple(holerite.adiantamento) }}</td>
            </tr>
            
            <tr v-if="holerite.emprestimos > 0" class="border-b border-gray-200">
              <td class="px-4 py-2 text-gray-700">911</td>
              <td class="px-4 py-2 text-gray-700">Empréstimos / Consignados</td>
              <td class="px-4 py-2"></td>
              <td class="px-4 py-2 text-right font-medium text-red-600">{{ formatCurrencySimple(holerite.emprestimos) }}</td>
            </tr>
            
            <tr v-if="holerite.faltas > 0" class="border-b border-gray-200">
              <td class="px-4 py-2 text-gray-700">903</td>
              <td class="px-4 py-2 text-gray-700">Faltas</td>
              <td class="px-4 py-2"></td>
              <td class="px-4 py-2 text-right font-medium text-red-600">{{ formatCurrencySimple(holerite.faltas) }}</td>
            </tr>
            
            <tr v-if="holerite.atrasos > 0" class="border-b border-gray-200">
              <td class="px-4 py-2 text-gray-700">904</td>
              <td class="px-4 py-2 text-gray-700">Atrasos</td>
              <td class="px-4 py-2"></td>
              <td class="px-4 py-2 text-right font-medium text-red-600">{{ formatCurrencySimple(holerite.atrasos) }}</td>
            </tr>
            
            <tr v-if="holerite.plano_saude > 0" class="border-b border-gray-200">
              <td class="px-4 py-2 text-gray-700">920</td>
              <td class="px-4 py-2 text-gray-700">Plano de Saúde</td>
              <td class="px-4 py-2"></td>
              <td class="px-4 py-2 text-right font-medium text-red-600">{{ formatCurrencySimple(holerite.plano_saude) }}</td>
            </tr>
            
            <tr v-if="holerite.plano_odontologico > 0" class="border-b border-gray-200">
              <td class="px-4 py-2 text-gray-700">921</td>
              <td class="px-4 py-2 text-gray-700">Plano Odontológico</td>
              <td class="px-4 py-2"></td>
              <td class="px-4 py-2 text-right font-medium text-red-600">{{ formatCurrencySimple(holerite.plano_odontologico) }}</td>
            </tr>
            
            <tr v-if="holerite.seguro_vida > 0" class="border-b border-gray-200">
              <td class="px-4 py-2 text-gray-700">922</td>
              <td class="px-4 py-2 text-gray-700">Seguro de Vida</td>
              <td class="px-4 py-2"></td>
              <td class="px-4 py-2 text-right font-medium text-red-600">{{ formatCurrencySimple(holerite.seguro_vida) }}</td>
            </tr>
            
            <tr v-if="holerite.auxilio_creche > 0" class="border-b border-gray-200">
              <td class="px-4 py-2 text-gray-700">923</td>
              <td class="px-4 py-2 text-gray-700">Auxílio Creche</td>
              <td class="px-4 py-2"></td>
              <td class="px-4 py-2 text-right font-medium text-red-600">{{ formatCurrencySimple(holerite.auxilio_creche) }}</td>
            </tr>
            
            <tr v-if="holerite.auxilio_educacao > 0" class="border-b border-gray-200">
              <td class="px-4 py-2 text-gray-700">924</td>
              <td class="px-4 py-2 text-gray-700">Auxílio Educação</td>
              <td class="px-4 py-2"></td>
              <td class="px-4 py-2 text-right font-medium text-red-600">{{ formatCurrencySimple(holerite.auxilio_educacao) }}</td>
            </tr>
            
            <tr v-if="holerite.auxilio_combustivel > 0" class="border-b border-gray-200">
              <td class="px-4 py-2 text-gray-700">925</td>
              <td class="px-4 py-2 text-gray-700">Auxílio Combustível</td>
              <td class="px-4 py-2"></td>
              <td class="px-4 py-2 text-right font-medium text-red-600">{{ formatCurrencySimple(holerite.auxilio_combustivel) }}</td>
            </tr>
            
            <tr v-if="holerite.outros_beneficios > 0" class="border-b border-gray-200">
              <td class="px-4 py-2 text-gray-700">926</td>
              <td class="px-4 py-2 text-gray-700">Outros Benefícios</td>
              <td class="px-4 py-2"></td>
              <td class="px-4 py-2 text-right font-medium text-red-600">{{ formatCurrencySimple(holerite.outros_beneficios) }}</td>
            </tr>
            
            <tr v-if="holerite.outros_descontos > 0" class="border-b border-gray-200">
              <td class="px-4 py-2 text-gray-700">905</td>
              <td class="px-4 py-2 text-gray-700">{{ holerite.descricao_outros_descontos || 'Outros Descontos' }}</td>
              <td class="px-4 py-2"></td>
              <td class="px-4 py-2 text-right font-medium text-red-600">{{ formatCurrencySimple(holerite.outros_descontos) }}</td>
            </tr>
            
            <!-- Itens Personalizados - Descontos -->
            <template v-if="holerite.itens_personalizados && holerite.itens_personalizados.length > 0">
              <tr v-for="(item, index) in holerite.itens_personalizados.filter((i: any) => i.tipo === 'desconto')" 
                  :key="`desconto-${index}`" 
                  class="border-b border-gray-200">
                <td class="px-4 py-2 text-gray-700">{{ item.codigo || '---' }}</td>
                <td class="px-4 py-2 text-gray-700">{{ item.descricao || 'Item Personalizado' }}</td>
                <td class="px-4 py-2"></td>
                <td class="px-4 py-2 text-right font-medium text-red-600">{{ formatCurrencySimple(item.valor || 0) }}</td>
              </tr>
            </template>
            
            <!-- Total Descontos -->
            <tr class="bg-red-50 border-b-2 border-gray-300">
              <td colspan="2" class="px-4 py-2 font-bold text-red-800 uppercase">Total Descontos</td>
              <td class="px-4 py-2"></td>
              <td class="px-4 py-2 text-right font-bold text-red-800">{{ formatCurrencySimple(calcularTotalDescontos()) }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Valor Líquido -->
      <div class="bg-gradient-to-r from-green-600 to-green-700 text-white p-6 rounded-lg">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-green-100 text-sm uppercase mb-1">Salário Líquido a Receber</p>
            <p class="text-5xl font-bold">{{ formatCurrency(calcularSalarioLiquido()) }}</p>
          </div>
          <Icon name="heroicons:banknotes" size="64" class="text-green-200 opacity-50" />
        </div>
      </div>

      <!-- Informações Adicionais -->
      <div class="grid grid-cols-2 gap-4 text-sm">
        <div class="bg-gray-50 p-3 rounded">
          <p class="text-gray-600">Base FGTS</p>
          <p class="font-semibold text-gray-900">{{ formatCurrency(holerite.salario_base) }}</p>
        </div>
        <div class="bg-gray-50 p-3 rounded">
          <p class="text-gray-600">FGTS do Mês (8%)</p>
          <p class="font-semibold text-gray-900">{{ formatCurrency(holerite.fgts || holerite.salario_base * 0.08) }}</p>
        </div>
        <div v-if="holerite.vale_transporte > 0 || holerite.vale_refeicao > 0" class="bg-gray-50 p-3 rounded">
          <p class="text-gray-600">Total Benefícios</p>
          <p class="font-semibold text-purple-700">{{ formatCurrency((holerite.vale_transporte || 0) + (holerite.vale_refeicao || 0)) }}</p>
        </div>
        <div class="bg-gray-50 p-3 rounded">
          <p class="text-gray-600">Tipo</p>
          <p class="font-semibold text-gray-900">{{ holerite.tipo === 'decimo_terceiro' ? '13º Salário' : 'Mensal' }}</p>
        </div>
      </div>

      <!-- Observações -->
      <div v-if="holerite.observacoes" class="bg-amber-50 border-l-4 border-amber-400 p-4 rounded">
        <p class="text-sm font-semibold text-amber-900 mb-1">Observações</p>
        <p class="text-sm text-amber-800 whitespace-pre-line">{{ holerite.observacoes }}</p>
      </div>

      <!-- Rodapé -->
      <div class="text-center text-xs text-gray-500 pt-4 border-t-2 border-gray-300">
        <p class="font-medium">Este documento é um demonstrativo de pagamento emitido pela {{ empresa?.nome || 'QUALITEC INSTRUMENTOS LTDA' }}</p>
        <p class="mt-1">Gerado em {{ formatDateTimeBR(holerite.gerado_em) }}</p>
      </div>
    </div>

    <template #footer>
      <div class="flex gap-3 justify-end">
        <UIButton variant="secondary" @click="isOpen = false">
          Fechar
        </UIButton>
        <UIButton variant="primary" icon-left="heroicons:printer" @click="imprimir">
          Imprimir
        </UIButton>
        <UIButton variant="primary" icon-left="heroicons:arrow-down-tray" @click="baixarPDF">
          Baixar PDF
        </UIButton>
      </div>
    </template>
  </UIModal>
</template>

<script setup lang="ts">
import { downloadHoleritePDF } from '~/utils/holeritePDF'

interface Props {
  show: boolean
  holerite: any
}

const props = defineProps<Props>()
const emit = defineEmits(['close'])

const isOpen = computed({
  get: () => props.show,
  set: (value) => {
    if (!value) emit('close')
  }
})

// Buscar dados da empresa
const empresa = ref<any>(null)

onMounted(async () => {
  try {
    const response = await $fetch<{ success: boolean; data: any }>('/api/empresa')
    if (response?.success) {
      empresa.value = response.data
    }
  } catch (error) {
    console.error('Erro ao carregar dados da empresa:', error)
  }
})

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value || 0)
}

const formatCurrencySimple = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value || 0)
}

const formatCPF = (cpf: string) => {
  if (!cpf) return '-'
  return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
}

const formatCNPJ = (cnpj: string) => {
  if (!cnpj) return '-'
  return cnpj.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5')
}

const formatDateBR = (date: string) => {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('pt-BR')
}

const formatDateTimeBR = (date: string) => {
  if (!date) return '-'
  return new Date(date).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const nomeMes = (mes: number) => {
  const meses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']
  return meses[mes - 1]
}

const calcularDiasTrabalhados = () => {
  // Para holerites mensais, sempre 30 dias
  if (props.holerite.tipo !== 'decimo_terceiro') {
    return 30
  }

  // Para 13º salário, calcular baseado nos meses trabalhados
  const mesesTrabalhados = props.holerite.meses_trabalhados || 12
  
  // Se trabalhou o ano completo (12 meses), considera 365 dias
  // Senão, calcula proporcionalmente
  if (mesesTrabalhados >= 12) {
    return 365
  }
  
  // Cálculo proporcional: (meses trabalhados / 12) * 365
  return Math.round((mesesTrabalhados / 12) * 365)
}

const imprimir = () => {
  window.print()
}

const calcularTotalProventos = () => {
  // Usar o valor já calculado do banco de dados
  return props.holerite.total_proventos || 0
}

const calcularTotalDescontos = () => {
  // Usar o valor já calculado do banco de dados
  return props.holerite.total_descontos || 0
}

const calcularSalarioLiquido = () => {
  // Usar o valor já calculado do banco de dados
  return props.holerite.salario_liquido || 0
}

const baixarPDF = async () => {
  try {
    // Verificar se os dados necessários estão presentes
    if (!props.holerite.tipo) {
      console.warn('Tipo do holerite não definido no modal')
    }
    
    const empresaData = empresa.value ? {
      nome: empresa.value.nome || 'QUALITEC INSTRUMENTOS LTDA',
      cnpj: empresa.value.cnpj || '09.117.117/0001-24',
      endereco: empresa.value.endereco || 'R. Fazenda Monte Alegre, 367 - Vila Jaraguá',
      cidade: empresa.value.cidade || 'São Paulo',
      estado: empresa.value.estado || 'SP',
      telefone: empresa.value.telefone || '(11) 3908-7100',
    } : undefined

    downloadHoleritePDF(props.holerite, empresaData)
  } catch (error) {
    console.error('Erro ao gerar PDF:', error)
    alert('Erro ao gerar PDF. Tente novamente.')
  }
}
</script>

<style scoped>
@media print {
  /* Ocultar elementos desnecessários na impressão */
  button {
    display: none !important;
  }
  
  /* Ajustar layout para impressão */
  .space-y-4 {
    page-break-inside: avoid;
  }
  
  /* Garantir que a tabela não quebre no meio */
  table {
    page-break-inside: avoid;
  }
  
  /* Melhorar contraste para impressão */
  .bg-gradient-to-r {
    background: #16a34a !important;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
}
</style>
