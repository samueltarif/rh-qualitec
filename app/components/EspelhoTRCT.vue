<template>
  <div class="bg-white min-h-screen">
    <!-- Cabeçalho Oficial -->
    <div class="border-2 border-black p-4 mb-4">
      <div class="text-center mb-4">
        <h1 class="text-lg font-bold uppercase">TERMO DE RESCISÃO DO CONTRATO DE TRABALHO</h1>
        <p class="text-sm">(Artigo 477 da CLT e Lei nº 7.998/90)</p>
      </div>

      <!-- Identificação do Empregador e Empregado -->
      <div class="grid grid-cols-2 gap-4 mb-4">
        <div class="border border-black p-2">
          <h3 class="font-bold text-sm mb-2">EMPREGADOR</h3>
          <div class="space-y-1 text-xs">
            <p><strong>Razão Social:</strong> {{ empresa.razao_social || 'Não informado' }}</p>
            <p><strong>CNPJ:</strong> {{ formatarCNPJ(empresa.cnpj) }}</p>
            <p><strong>Endereço:</strong> {{ empresa.endereco || 'Não informado' }}</p>
            <p><strong>CEP:</strong> {{ empresa.cep || 'Não informado' }} - {{ empresa.cidade || 'Não informado' }}/{{ empresa.estado || 'Não informado' }}</p>
            <p><strong>CNAE:</strong> {{ empresa.cnae || 'Não informado' }}</p>
          </div>
        </div>

        <div class="border border-black p-2">
          <h3 class="font-bold text-sm mb-2">EMPREGADO</h3>
          <div class="space-y-1 text-xs">
            <p><strong>Nome:</strong> {{ colaborador.nome }}</p>
            <p><strong>CPF:</strong> {{ formatarCPF(colaborador.cpf) }}</p>
            <p><strong>PIS/PASEP:</strong> {{ colaborador.pis || 'Não informado' }}</p>
            <p><strong>Cargo:</strong> {{ colaborador.cargo?.nome || 'Não informado' }}</p>
            <p><strong>CBO:</strong> {{ colaborador.cbo || 'Não informado' }}</p>
            <p><strong>Matrícula:</strong> {{ colaborador.matricula || 'Não informado' }}</p>
          </div>
        </div>
      </div>

      <!-- Dados do Contrato -->
      <div class="border border-black p-2 mb-4">
        <h3 class="font-bold text-sm mb-2">DADOS DO CONTRATO</h3>
        <div class="grid grid-cols-4 gap-4 text-xs">
          <div>
            <p><strong>Data Admissão:</strong></p>
            <p>{{ formatarData(colaborador.data_admissao) }}</p>
          </div>
          <div>
            <p><strong>Data Desligamento:</strong></p>
            <p>{{ formatarData(dadosRescisao.data_desligamento) }}</p>
          </div>
          <div>
            <p><strong>Tipo de Rescisão:</strong></p>
            <p>{{ getTipoRescisaoDescricao(dadosRescisao.tipo_rescisao) }}</p>
          </div>
          <div>
            <p><strong>Tempo de Contrato:</strong></p>
            <p>{{ calculos.tempo_casa }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Quadro de Verbas Rescisórias -->
    <div class="border-2 border-black mb-4">
      <div class="bg-gray-100 p-2 border-b border-black">
        <h3 class="font-bold text-sm text-center">DISCRIMINAÇÃO DAS VERBAS RESCISÓRIAS</h3>
      </div>

      <!-- Cabeçalho da Tabela -->
      <div class="grid grid-cols-12 border-b border-black text-xs font-bold bg-gray-50">
        <div class="col-span-1 p-1 border-r border-black text-center">CÓD</div>
        <div class="col-span-5 p-1 border-r border-black text-center">DESCRIÇÃO DA VERBA</div>
        <div class="col-span-2 p-1 border-r border-black text-center">REFERÊNCIA</div>
        <div class="col-span-2 p-1 border-r border-black text-center">VENCIMENTOS</div>
        <div class="col-span-2 p-1 text-center">DESCONTOS</div>
      </div>

      <!-- Proventos -->
      <div v-for="(item, index) in calculos.proventos" :key="`provento-${index}`" 
           class="grid grid-cols-12 border-b border-gray-300 text-xs">
        <div class="col-span-1 p-1 border-r border-black text-center">{{ getCodigoVerba('provento', item.descricao) }}</div>
        <div class="col-span-5 p-1 border-r border-black">{{ item.descricao }}</div>
        <div class="col-span-2 p-1 border-r border-black text-center">{{ getReferencia(item) }}</div>
        <div class="col-span-2 p-1 border-r border-black text-right">{{ formatarMoeda(item.valor) }}</div>
        <div class="col-span-2 p-1 text-right">-</div>
      </div>

      <!-- Descontos -->
      <div v-for="(item, index) in calculos.descontos" :key="`desconto-${index}`" 
           class="grid grid-cols-12 border-b border-gray-300 text-xs">
        <div class="col-span-1 p-1 border-r border-black text-center">{{ getCodigoVerba('desconto', item.descricao) }}</div>
        <div class="col-span-5 p-1 border-r border-black">{{ item.descricao }}</div>
        <div class="col-span-2 p-1 border-r border-black text-center">{{ getReferencia(item) }}</div>
        <div class="col-span-2 p-1 border-r border-black text-right">-</div>
        <div class="col-span-2 p-1 text-right">{{ formatarMoeda(item.valor) }}</div>
      </div>

      <!-- Totais -->
      <div class="grid grid-cols-12 border-t-2 border-black text-xs font-bold bg-gray-100">
        <div class="col-span-7 p-2 border-r border-black text-right">TOTAIS:</div>
        <div class="col-span-2 p-2 border-r border-black text-right">{{ formatarMoeda(calculos.total_proventos) }}</div>
        <div class="col-span-2 p-2 border-r border-black text-right">{{ formatarMoeda(calculos.total_descontos) }}</div>
        <div class="col-span-1 p-2 text-right"></div>
      </div>

      <!-- Valor Líquido -->
      <div class="grid grid-cols-12 border-t border-black text-sm font-bold bg-yellow-50">
        <div class="col-span-9 p-2 border-r border-black text-right">VALOR LÍQUIDO A RECEBER:</div>
        <div class="col-span-3 p-2 text-right text-lg">{{ formatarMoeda(calculos.valor_liquido) }}</div>
      </div>
    </div>

    <!-- Quadro FGTS -->
    <div class="border-2 border-black mb-4">
      <div class="bg-blue-100 p-2 border-b border-black">
        <h3 class="font-bold text-sm text-center">FUNDO DE GARANTIA DO TEMPO DE SERVIÇO - FGTS</h3>
      </div>

      <div class="p-3 space-y-2 text-xs">
        <div v-for="(item, index) in calculos.fgts" :key="`fgts-${index}`" 
             class="flex justify-between border-b border-gray-200 pb-1">
          <span>{{ item.descricao }}</span>
          <span class="font-mono">{{ formatarMoeda(item.valor) }}</span>
        </div>
        
        <div class="flex justify-between font-bold text-sm border-t-2 border-black pt-2">
          <span>TOTAL FGTS + MULTA:</span>
          <span class="font-mono">{{ formatarMoeda(calculos.total_fgts) }}</span>
        </div>

        <div class="bg-yellow-50 p-2 border border-yellow-400 rounded mt-2">
          <p class="text-xs font-bold text-center">
            ⚠️ INFORMATIVO: O FGTS será liberado diretamente pela Caixa Econômica Federal
          </p>
          <p class="text-xs text-center mt-1">
            {{ getInformativoSaque(dadosRescisao.tipo_rescisao) }}
          </p>
        </div>
      </div>
    </div>

    <!-- Observações Legais -->
    <div class="border-2 border-black mb-4">
      <div class="bg-red-100 p-2 border-b border-black">
        <h3 class="font-bold text-sm text-center">OBSERVAÇÕES LEGAIS</h3>
      </div>
      
      <div class="p-3 space-y-2 text-xs">
        <div v-for="(obs, index) in calculos.observacoes" :key="index" class="flex items-start gap-2">
          <span class="font-bold">•</span>
          <span>{{ obs }}</span>
        </div>
        
        <div class="border-t border-gray-300 pt-2 mt-3">
          <p class="font-bold">PRAZO PARA PAGAMENTO:</p>
          <p>{{ getPrazoPagamento(dadosRescisao.tipo_rescisao) }}</p>
        </div>
      </div>
    </div>

    <!-- Base Legal -->
    <div class="border-2 border-black mb-4">
      <div class="bg-gray-100 p-2 border-b border-black">
        <h3 class="font-bold text-sm text-center">BASE LEGAL</h3>
      </div>
      
      <div class="p-3 text-xs space-y-1">
        <p><strong>CLT - Consolidação das Leis do Trabalho:</strong> Arts. 477, 478, 479, 487, 488</p>
        <p><strong>Lei nº 8.036/90:</strong> FGTS - Fundo de Garantia do Tempo de Serviço</p>
        <p><strong>Lei nº 7.998/90:</strong> Seguro-Desemprego</p>
        <p><strong>Lei nº 15.270/2025:</strong> Nova tabela do Imposto de Renda (vigente a partir de 01/01/2026)</p>
      </div>
    </div>

    <!-- Campos de Assinatura -->
    <div class="border-2 border-black">
      <div class="bg-gray-100 p-2 border-b border-black">
        <h3 class="font-bold text-sm text-center">ASSINATURAS</h3>
      </div>
      
      <div class="p-4">
        <div class="grid grid-cols-2 gap-8 text-xs">
          <!-- Empregado -->
          <div class="text-center">
            <div class="border-b border-black mb-2 pb-8"></div>
            <p class="font-bold">{{ colaborador.nome }}</p>
            <p>EMPREGADO</p>
            <p>CPF: {{ formatarCPF(colaborador.cpf) }}</p>
          </div>
          
          <!-- Empregador -->
          <div class="text-center">
            <div class="border-b border-black mb-2 pb-8"></div>
            <p class="font-bold">{{ empresa.representante_legal || 'REPRESENTANTE LEGAL' }}</p>
            <p>EMPREGADOR</p>
            <p>{{ empresa.razao_social }}</p>
          </div>
        </div>

        <!-- Homologação (quando aplicável) -->
        <div v-if="necessitaHomologacao()" class="mt-6 pt-4 border-t border-gray-400">
          <div class="text-center text-xs">
            <p class="font-bold mb-2">HOMOLOGAÇÃO SINDICAL</p>
            <p class="mb-4">(Obrigatória para contratos com mais de 1 ano - Art. 477 §1º CLT)</p>
            
            <div class="border-b border-black mb-2 pb-8 mx-20"></div>
            <p class="font-bold">REPRESENTANTE SINDICAL</p>
            <p>Data: ___/___/______</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Rodapé -->
    <div class="mt-4 text-xs text-center text-gray-600">
      <p>Documento gerado em {{ formatarDataHora(new Date()) }}</p>
      <p>Sistema de Gestão de RH - Conforme legislação trabalhista brasileira vigente</p>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  empresa: any
  colaborador: any
  dadosRescisao: any
  calculos: any
}

const props = defineProps<Props>()

// Códigos oficiais das verbas rescisórias conforme Ministério do Trabalho
const codigosVerbas = {
  // Proventos
  'Saldo de Salário': '001',
  'Aviso Prévio Indenizado': '002', 
  'Aviso Prévio Trabalhado': '003',
  '13º Salário Proporcional': '004',
  'Férias Proporcionais': '005',
  'Férias Vencidas': '006',
  '1/3 Constitucional Férias': '007',
  'Horas Extras': '008',
  'Adicional Noturno': '009',
  'Adicional Insalubridade': '010',
  'Adicional Periculosidade': '011',
  'Comissões': '012',
  'Gratificações': '013',
  
  // Descontos
  'INSS': '101',
  'IRRF': '102',
  'Faltas Injustificadas': '103',
  'Adiantamento Salarial': '104',
  'Vale Transporte': '105',
  'Vale Refeição': '106',
  'Pensão Alimentícia': '107',
  'Empréstimo Consignado': '108'
}

const getCodigoVerba = (tipo: string, descricao: string): string => {
  return codigosVerbas[descricao as keyof typeof codigosVerbas] || '999'
}

const getReferencia = (item: any): string => {
  if (item.descricao.includes('Saldo')) return 'Dias trabalhados'
  if (item.descricao.includes('13º')) return 'Meses/avos'
  if (item.descricao.includes('Férias')) return 'Período aquisitivo'
  if (item.descricao.includes('Aviso')) return '30 dias'
  if (item.descricao.includes('Horas')) return 'Horas extras'
  return '-'
}

const getTipoRescisaoDescricao = (tipo: string): string => {
  const tipos = {
    'dispensa_sem_justa_causa': 'Dispensa sem Justa Causa',
    'dispensa_com_justa_causa': 'Dispensa com Justa Causa',
    'pedido_demissao': 'Pedido de Demissão',
    'acordo_mutuo': 'Rescisão por Acordo Mútuo (Art. 484-A CLT)',
    'termino_experiencia': 'Término de Contrato de Experiência',
    'termino_determinado': 'Término de Contrato por Prazo Determinado',
    'rescisao_indireta': 'Rescisão Indireta',
    'morte': 'Morte do Empregado',
    'aposentadoria': 'Aposentadoria'
  }
  return tipos[tipo as keyof typeof tipos] || tipo
}

const getInformativoSaque = (tipo: string): string => {
  switch (tipo) {
    case 'dispensa_sem_justa_causa':
    case 'rescisao_indireta':
      return 'Saque autorizado com código 01 - Dispensa sem justa causa'
    case 'acordo_mutuo':
      return 'Saque de 80% autorizado com código 03 - Acordo mútuo'
    case 'pedido_demissao':
      return 'Saque não autorizado - Permanece bloqueado na conta FGTS'
    case 'aposentadoria':
      return 'Saque autorizado com código 05 - Aposentadoria'
    case 'termino_determinado':
      return 'Saque autorizado com código 04 - Término de contrato determinado'
    default:
      return 'Consulte as regras de saque na Caixa Econômica Federal'
  }
}

const getPrazoPagamento = (tipo: string): string => {
  switch (tipo) {
    case 'dispensa_sem_justa_causa':
    case 'dispensa_com_justa_causa':
    case 'rescisao_indireta':
      return 'Até o 1º dia útil imediato ao término do contrato (Art. 477 §6º CLT)'
    case 'pedido_demissao':
    case 'acordo_mutuo':
      return 'Até o 10º dia corrido, contado da data da notificação da demissão (Art. 477 §6º CLT)'
    default:
      return 'Conforme Art. 477 §6º da CLT'
  }
}

const necessitaHomologacao = (): boolean => {
  // Homologação obrigatória para contratos com mais de 1 ano
  const dataAdmissao = new Date(props.colaborador.data_admissao)
  const dataDesligamento = new Date(props.dadosRescisao.data_desligamento)
  const diffTime = Math.abs(dataDesligamento.getTime() - dataAdmissao.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays > 365
}

const formatarMoeda = (valor: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(valor || 0)
}

const formatarData = (data: string): string => {
  if (!data) return ''
  return new Date(data + 'T00:00:00').toLocaleDateString('pt-BR')
}

const formatarDataHora = (data: Date): string => {
  return data.toLocaleString('pt-BR')
}

const formatarCPF = (cpf: string): string => {
  if (!cpf) return ''
  return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
}

const formatarCNPJ = (cnpj: string): string => {
  if (!cnpj) return ''
  return cnpj.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5')
}
</script>

<style scoped>
@media print {
  .bg-gray-100 {
    background-color: #f3f4f6 !important;
    -webkit-print-color-adjust: exact;
  }
  
  .bg-blue-100 {
    background-color: #dbeafe !important;
    -webkit-print-color-adjust: exact;
  }
  
  .bg-red-100 {
    background-color: #fee2e2 !important;
    -webkit-print-color-adjust: exact;
  }
  
  .bg-yellow-50 {
    background-color: #fefce8 !important;
    -webkit-print-color-adjust: exact;
  }
}
</style>