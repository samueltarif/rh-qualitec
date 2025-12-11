<template>
  <div class="card overflow-hidden">
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-lg font-semibold text-gray-800">Detalhamento por Colaborador</h3>
      <UIButton 
        theme="admin" 
        variant="secondary" 
        icon-left="heroicons:arrow-down-tray"
        @click="exportarExcel"
      >
        Exportar Excel
      </UIButton>
    </div>
    
    <div class="overflow-x-auto">
      <table class="w-full">
        <thead class="bg-gray-50 border-b border-gray-200">
          <tr>
            <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Colaborador</th>
            <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">CPF</th>
            <th class="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Salário Bruto</th>
            <th class="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">INSS</th>
            <th class="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">IRRF</th>
            <th class="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Adiant. (Mês Ant.)</th>
            <th class="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">FGTS</th>
            <th class="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Total Descontos</th>
            <th class="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Salário Líquido</th>
            <th class="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Ações</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200">
          <tr v-for="item in folha" :key="item.colaborador_id" class="hover:bg-gray-50">
            <td class="px-4 py-3">
              <p class="font-medium text-gray-800">{{ item.nome }}</p>
            </td>
            <td class="px-4 py-3 text-sm text-gray-600">{{ formatCPF(item.cpf) }}</td>
            <td class="px-4 py-3 text-right font-medium text-gray-800" :title="`Salário Base + Proventos (inclui itens personalizados)`">{{ formatCurrency(item.salario_bruto) }}</td>
            <td class="px-4 py-3 text-right text-sm text-blue-700">{{ formatCurrency(item.inss) }}</td>
            <td class="px-4 py-3 text-right text-sm text-purple-700">{{ formatCurrency(item.irrf) }}</td>
            <td class="px-4 py-3 text-right text-sm" :class="item.adiantamento > 0 ? 'text-orange-700 font-semibold' : 'text-gray-400'" :title="item.adiantamento > 0 ? 'Adiantamento pago no mês anterior' : 'Sem adiantamento'">
              {{ formatCurrency(item.adiantamento || 0) }}
            </td>
            <td class="px-4 py-3 text-right text-sm text-green-700">{{ formatCurrency(item.fgts) }}</td>
            <td class="px-4 py-3 text-right text-sm text-red-700 font-semibold" :title="`INSS + IRRF + Outros Descontos (inclui itens personalizados)`">{{ formatCurrency(item.total_descontos) }}</td>
            <td class="px-4 py-3 text-right font-bold text-gray-800" :title="`Salário Bruto - Total Descontos = ${formatCurrency(item.salario_liquido)}`">{{ formatCurrency(item.salario_liquido) }}</td>
            <td class="px-4 py-3">
              <div class="flex items-center gap-2 justify-end">
                <UIButton 
                  theme="admin" 
                  variant="secondary" 
                  size="sm"
                  icon-left="heroicons:pencil"
                  @click="$emit('editar', item)"
                  title="Editar folha"
                >
                  Editar
                </UIButton>
                <UIButton 
                  theme="admin" 
                  variant="primary" 
                  size="sm"
                  icon-left="heroicons:document-text"
                  @click="$emit('gerar-holerite', item)"
                  :disabled="loadingAcoes[item.colaborador_id]"
                  title="Gerar holerite individual"
                >
                  {{ loadingAcoes[item.colaborador_id] ? 'Gerando...' : 'Gerar' }}
                </UIButton>
                <UIButton 
                  theme="admin" 
                  variant="success" 
                  size="sm"
                  icon-left="heroicons:envelope"
                  @click="$emit('enviar-email', item)"
                  :disabled="loadingEmails[item.colaborador_id]"
                  title="Enviar holerite por email"
                >
                  {{ loadingEmails[item.colaborador_id] ? 'Enviando...' : 'Email' }}
                </UIButton>
              </div>
            </td>
          </tr>
        </tbody>
        <tfoot class="bg-gray-100 border-t-2 border-gray-300">
          <tr class="font-bold">
            <td class="px-4 py-4" colspan="2">TOTAIS</td>
            <td class="px-4 py-4 text-right text-gray-800">{{ formatCurrency(totais.total_salario_bruto) }}</td>
            <td class="px-4 py-4 text-right text-blue-700">{{ formatCurrency(totais.total_inss) }}</td>
            <td class="px-4 py-4 text-right text-purple-700">{{ formatCurrency(totais.total_irrf) }}</td>
            <td class="px-4 py-4 text-right text-orange-700">{{ formatCurrency(totais.total_adiantamento || 0) }}</td>
            <td class="px-4 py-4 text-right text-green-700">{{ formatCurrency(totais.total_fgts) }}</td>
            <td class="px-4 py-4 text-right text-red-700">{{ formatCurrency(totais.total_descontos) }}</td>
            <td class="px-4 py-4 text-right text-gray-800">{{ formatCurrency(totais.total_salario_liquido) }}</td>
            <td class="px-4 py-4"></td>
          </tr>
        </tfoot>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
interface ColaboradorFolha {
  colaborador_id: number
  nome: string
  cpf: string
  salario_bruto: number
  inss: number
  irrf: number
  adiantamento?: number
  fgts: number
  total_descontos: number
  salario_liquido: number
}

interface TotaisFolha {
  total_colaboradores: number
  total_salario_bruto: number
  total_inss: number
  total_irrf: number
  total_adiantamento?: number
  total_fgts: number
  total_descontos: number
  total_salario_liquido: number
  custo_empresa: number
}

const props = defineProps<{
  folha: ColaboradorFolha[]
  totais: TotaisFolha
  mes: string
  ano: string
  loadingAcoes?: Record<number, boolean>
  loadingEmails?: Record<number, boolean>
}>()

const emit = defineEmits<{
  editar: [item: ColaboradorFolha]
  'gerar-holerite': [item: ColaboradorFolha]
  'enviar-email': [item: ColaboradorFolha]
}>()

// Funções auxiliares
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

const formatCPF = (cpf: string) => {
  if (!cpf) return '-'
  return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
}

const nomeMes = (mes: string) => {
  const meses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']
  return meses[parseInt(mes) - 1]
}

// Exportar para Excel
const exportarExcel = async () => {
  try {
    // Importar biblioteca XLSX dinamicamente
    const XLSX = await import('xlsx')

    // Criar workbook
    const wb = XLSX.utils.book_new()

    // Dados da planilha
    const wsData: any[][] = []

    // Cabeçalho principal
    wsData.push(['FOLHA DE PAGAMENTO - QUALITEC'])
    wsData.push([`Período: ${nomeMes(props.mes)}/${props.ano}`])
    wsData.push([`Data de Geração: ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}`])
    wsData.push([]) // Linha vazia

    // Cabeçalhos da tabela
    wsData.push(['Colaborador', 'CPF', 'Salário Bruto', 'INSS', 'IRRF', 'Adiantamento', 'FGTS', 'Total Descontos', 'Salário Líquido'])

    // Dados dos colaboradores
    props.folha.forEach((item: ColaboradorFolha) => {
      wsData.push([
        item.nome,
        formatCPF(item.cpf),
        item.salario_bruto,
        item.inss,
        item.irrf,
        item.adiantamento || 0,
        item.fgts,
        item.total_descontos,
        item.salario_liquido,
      ])
    })

    // Linha de totais
    wsData.push([
      'TOTAIS',
      '',
      props.totais.total_salario_bruto,
      props.totais.total_inss,
      props.totais.total_irrf,
      props.totais.total_adiantamento || 0,
      props.totais.total_fgts,
      props.totais.total_descontos,
      props.totais.total_salario_liquido,
    ])

    wsData.push([]) // Linha vazia

    // Resumo geral
    wsData.push(['RESUMO GERAL'])
    wsData.push(['Total de Colaboradores:', props.totais.total_colaboradores])
    wsData.push(['Total Salário Bruto:', props.totais.total_salario_bruto])
    wsData.push(['Total INSS:', props.totais.total_inss])
    wsData.push(['Total IRRF:', props.totais.total_irrf])
    wsData.push(['Total FGTS (Empresa):', props.totais.total_fgts])
    wsData.push(['Total Descontos:', props.totais.total_descontos])
    wsData.push(['Total Salário Líquido:', props.totais.total_salario_liquido])
    wsData.push(['CUSTO TOTAL EMPRESA:', props.totais.custo_empresa])

    wsData.push([]) // Linha vazia
    wsData.push(['Observações:'])
    wsData.push(['• Cálculos baseados nas tabelas de INSS e IRRF vigentes em 2024'])
    wsData.push(['• FGTS (8%) é pago pela empresa e não é descontado do salário'])
    wsData.push(['• Esta é uma simulação. Consulte um contador para cálculos oficiais'])

    // Criar worksheet
    const ws = XLSX.utils.aoa_to_sheet(wsData)

    // Definir larguras das colunas
    ws['!cols'] = [
      { wch: 30 }, // Colaborador
      { wch: 15 }, // CPF
      { wch: 15 }, // Salário Bruto
      { wch: 12 }, // INSS
      { wch: 12 }, // IRRF
      { wch: 15 }, // Adiantamento
      { wch: 12 }, // FGTS
      { wch: 15 }, // Total Descontos
      { wch: 15 }, // Salário Líquido
    ]

    // Formatar células de moeda (colunas C a I, a partir da linha 6)
    const range = XLSX.utils.decode_range(ws['!ref'] || 'A1')
    for (let R = 5; R <= range.e.r; R++) {
      for (let C = 2; C <= 8; C++) {
        const cellAddress = XLSX.utils.encode_cell({ r: R, c: C })
        if (!ws[cellAddress]) continue
        
        // Aplicar formato de moeda brasileira
        if (typeof ws[cellAddress].v === 'number') {
          ws[cellAddress].z = 'R$ #,##0.00'
        }
      }
    }

    // Adicionar worksheet ao workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Folha de Pagamento')

    // Gerar arquivo e fazer download
    XLSX.writeFile(wb, `Folha_Pagamento_${nomeMes(props.mes)}_${props.ano}.xlsx`)
  } catch (error) {
    console.error('Erro ao exportar Excel:', error)
    alert('Erro ao exportar para Excel. Tente novamente.')
  }
}
</script>
