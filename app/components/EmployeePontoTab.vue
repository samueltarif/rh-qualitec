<template>
  <div>
    <!-- Aviso de Limite de 30 Dias -->
    <div v-if="periodoExpirado" class="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
      <div class="flex items-start gap-3">
        <Icon name="heroicons:exclamation-triangle" class="text-amber-600 flex-shrink-0" size="20" />
        <div>
          <p class="text-sm font-medium text-amber-800">Período não disponível</p>
          <p class="text-sm text-amber-700 mt-1">
            Os registros de ponto ficam disponíveis por apenas 30 dias. Este período já expirou.
            {{ assinaturaMes ? 'Você pode fazer o download do arquivo assinado abaixo.' : '' }}
          </p>
        </div>
      </div>
    </div>

    <!-- Filtros -->
    <div class="flex flex-wrap items-center gap-4 mb-6">
      <div class="flex items-center gap-2">
        <label class="text-sm text-slate-600">Mês:</label>
        <select 
          v-model="mesSelecionado" 
          class="px-3 py-2 border border-slate-300 rounded-lg text-sm"
          :disabled="loading"
        >
          <option v-for="m in mesesDisponiveis" :key="m.value" :value="m.value">{{ m.label }}</option>
        </select>
      </div>
      <div class="flex items-center gap-2">
        <label class="text-sm text-slate-600">Ano:</label>
        <select 
          v-model="anoSelecionado" 
          class="px-3 py-2 border border-slate-300 rounded-lg text-sm"
          :disabled="loading"
        >
          <option v-for="a in anos" :key="a" :value="a">{{ a }}</option>
        </select>
      </div>
      <button 
        @click="buscar" 
        class="px-4 py-2 bg-slate-800 text-white rounded-lg text-sm hover:bg-slate-700 disabled:opacity-50"
        :disabled="loading"
      >
        <Icon name="heroicons:magnifying-glass" size="16" class="mr-1" />
        Buscar
      </button>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="text-center py-12">
      <Icon name="heroicons:arrow-path" class="animate-spin text-slate-400" size="40" />
      <p class="text-slate-500 mt-2">Carregando registros...</p>
    </div>

    <!-- Tabela de Registros -->
    <div v-else-if="registros.length > 0" class="overflow-x-auto">
      <table class="w-full">
        <thead>
          <tr class="bg-slate-100">
            <th class="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Data</th>
            <th class="px-4 py-3 text-center text-xs font-semibold text-slate-600 uppercase">Entrada</th>
            <th class="px-4 py-3 text-center text-xs font-semibold text-slate-600 uppercase">Intervalo Entrada</th>
            <th class="px-4 py-3 text-center text-xs font-semibold text-slate-600 uppercase">Intervalo Saída</th>
            <th class="px-4 py-3 text-center text-xs font-semibold text-slate-600 uppercase">Saída</th>
            <th class="px-4 py-3 text-center text-xs font-semibold text-slate-600 uppercase">Total</th>
            <th class="px-4 py-3 text-center text-xs font-semibold text-slate-600 uppercase">Status</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-200">
          <tr v-for="reg in registros" :key="reg.id" class="hover:bg-slate-50">
            <td class="px-4 py-3 text-sm font-medium text-slate-800">
              {{ formatarData(reg.data) }}
            </td>
            <td class="px-4 py-3 text-sm text-center text-slate-600">
              {{ formatarHora(reg.entrada_1) }}
            </td>
            <td class="px-4 py-3 text-sm text-center text-slate-600">
              {{ formatarHora(reg.saida_1) }}
            </td>
            <td class="px-4 py-3 text-sm text-center text-slate-600">
              {{ formatarHora(reg.entrada_2) }}
            </td>
            <td class="px-4 py-3 text-sm text-center text-slate-600">
              {{ formatarHora(reg.saida_2) }}
            </td>
            <td class="px-4 py-3 text-sm text-center">
              <div class="flex flex-col items-center gap-1">
                <span 
                  class="font-medium"
                  :class="{
                    'text-green-600 animate-pulse': estaEmAndamento(reg),
                    'text-slate-800': !estaEmAndamento(reg)
                  }"
                >
                  {{ calcularTotal(reg) }}
                </span>
                <div v-if="obterAvisos(reg).length > 0" class="flex flex-wrap gap-1 justify-center">
                  <span 
                    v-for="(aviso, idx) in obterAvisos(reg)" 
                    :key="idx"
                    class="text-xs px-2 py-0.5 rounded-full"
                    :class="{
                      'bg-green-100 text-green-700': aviso.includes('⏱️'),
                      'bg-amber-100 text-amber-700': aviso.includes('⚠️'),
                      'bg-blue-100 text-blue-700': aviso.includes('ℹ️'),
                      'bg-red-100 text-red-700': aviso.includes('❌')
                    }"
                    :title="obterDetalhes(reg)"
                  >
                    {{ aviso }}
                  </span>
                </div>
              </div>
            </td>
            <td class="px-4 py-3 text-center">
              <span :class="getStatusClass(reg.status)" class="px-2 py-1 text-xs font-medium rounded-full">
                {{ reg.status }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Empty State -->
    <div v-else class="text-center py-12">
      <Icon name="heroicons:clock" class="text-slate-300 mx-auto" size="48" />
      <p class="text-slate-500 mt-2">Nenhum registro de ponto encontrado</p>
    </div>

    <!-- Resumo do Mês -->
    <div v-if="registros.length > 0" class="mt-6 grid grid-cols-2 md:grid-cols-5 gap-4">
      <div class="bg-slate-100 rounded-lg p-4">
        <p class="text-xs text-slate-500">Dias Trabalhados</p>
        <p class="text-xl font-bold text-slate-800">{{ resumo.diasTrabalhados }}</p>
      </div>
      <div class="bg-green-100 rounded-lg p-4">
        <p class="text-xs text-green-600">Horas Trabalhadas</p>
        <p class="text-xl font-bold text-green-700">{{ resumo.horasTrabalhadas }}</p>
      </div>
      <div class="bg-amber-100 rounded-lg p-4">
        <p class="text-xs text-amber-600">Intervalo</p>
        <p class="text-xl font-bold text-amber-700">{{ resumo.horasIntervalo }}</p>
      </div>
      <div class="bg-blue-100 rounded-lg p-4">
        <p class="text-xs text-blue-600">Horas Extras</p>
        <p class="text-xl font-bold text-blue-700">{{ resumo.horasExtras }}</p>
      </div>
      <div class="bg-red-100 rounded-lg p-4">
        <p class="text-xs text-red-600">Faltas</p>
        <p class="text-xl font-bold text-red-700">{{ resumo.faltas }}</p>
      </div>
    </div>

    <!-- Alerta de Renovação -->
    <div v-if="precisaRenovarAssinatura" class="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
      <div class="flex items-center">
        <Icon name="heroicons:exclamation-triangle" class="w-5 h-5 text-amber-600 mr-2" />
        <div>
          <h4 class="text-amber-800 font-medium">Renovação de Assinatura Necessária</h4>
          <p class="text-amber-700 text-sm mt-1">É necessário renovar sua assinatura digital para este mês. Clique em "Assinar Ponto do Mês" abaixo.</p>
        </div>
      </div>
    </div>

    <!-- Seção de Assinatura do Ponto -->
    <div v-if="registros.length > 0 && !periodoExpirado" class="mt-6 p-6 bg-blue-50 border border-blue-200 rounded-lg">
      <div class="flex items-start justify-between gap-4">
        <div class="flex-1">
          <h3 class="text-lg font-semibold text-slate-800 mb-2">Assinatura do Ponto</h3>
          <p class="text-sm text-slate-600 mb-4">
            Ao assinar, você confirma que os registros de ponto estão corretos. 
            O arquivo CSV ficará disponível para download.
          </p>
          
          <div v-if="assinaturaMes" class="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
            <Icon name="heroicons:check-circle" class="text-green-600" size="24" />
            <div class="flex-1">
              <p class="text-sm font-medium text-green-800">Ponto assinado em {{ formatarDataAssinatura(assinaturaMes.data_assinatura) }}</p>
              <p class="text-xs text-green-700 mt-1">{{ assinaturaMes.total_dias }} dias trabalhados • {{ assinaturaMes.total_horas }}</p>
            </div>
            <div class="flex gap-2">
              <button 
                @click="baixarPDF"
                class="px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 flex items-center gap-2"
                :disabled="baixandoPDF"
              >
                <Icon name="heroicons:document-text" size="16" />
                {{ baixandoPDF ? 'Gerando...' : 'PDF (30 dias)' }}
              </button>
              
              <button 
                @click="baixarCSV"
                class="px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 flex items-center gap-2"
                :disabled="baixandoCSV"
              >
                <Icon name="heroicons:arrow-down-tray" size="16" />
                {{ baixandoCSV ? 'Baixando...' : 'Baixar CSV' }}
              </button>
            </div>
          </div>

          <div v-else class="flex items-center gap-3">
            <button 
              @click="assinarPonto"
              class="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
              :disabled="assinando"
            >
              <Icon name="heroicons:pencil-square" size="20" />
              {{ assinando ? 'Assinando...' : 'Assinar Ponto do Mês' }}
            </button>
            <p class="text-xs text-slate-500">
              Disponível até {{ dataLimiteVisualizacao }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Download de Assinatura Antiga -->
    <div v-if="periodoExpirado && assinaturaMes" class="mt-6 p-6 bg-slate-50 border border-slate-200 rounded-lg">
      <div class="flex items-center justify-between">
        <div>
          <h3 class="text-lg font-semibold text-slate-800 mb-1">Arquivo Assinado</h3>
          <p class="text-sm text-slate-600">
            Assinado em {{ formatarDataAssinatura(assinaturaMes.data_assinatura) }} • 
            {{ assinaturaMes.total_dias }} dias • {{ assinaturaMes.total_horas }}
          </p>
        </div>
        <div class="flex gap-2">
          <button 
            @click="baixarPDF"
            class="px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 flex items-center gap-2"
            :disabled="baixandoPDF"
          >
            <Icon name="heroicons:document-text" size="16" />
            {{ baixandoPDF ? 'Gerando...' : 'PDF (30 dias)' }}
          </button>
          
          <button 
            @click="baixarCSV"
            class="px-4 py-2 bg-slate-800 text-white rounded-lg text-sm hover:bg-slate-700 flex items-center gap-2"
            :disabled="baixandoCSV"
          >
            <Icon name="heroicons:arrow-down-tray" size="16" />
            {{ baixandoCSV ? 'Baixando...' : 'Baixar CSV' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Modal de Assinatura Digital -->
    <ModalAssinaturaDigital
      v-if="mostrarModalAssinatura"
      :mes="mesSelecionado"
      :ano="anoSelecionado"
      :total-dias="resumo.diasTrabalhados"
      :total-horas="resumo.horasTrabalhadas"
      @close="mostrarModalAssinatura = false"
      @assinado="onAssinado"
    />
  </div>
</template>

<script setup lang="ts">
import { calcularHorasTrabalhadas, calcularTotalRegistros, formatarHora, registroEmAndamento } from '~/utils/pontoCalculos'
import { usePontoTempoReal } from '~/composables/usePontoTempoReal'

const props = defineProps<{
  registros: any[]
  loading: boolean
}>()

const emit = defineEmits<{
  refresh: [mes: number, ano: number]
}>()

// Criar ref reativa para os registros
const registrosRef = computed(() => props.registros)

// Usar composable de tempo real
const { calcularHoras: calcularHorasComTempoReal, horaAtual, temRegistroEmAndamento } = usePontoTempoReal(registrosRef)

const hoje = new Date()
const mesSelecionado = ref(hoje.getMonth() + 1)
const anoSelecionado = ref(hoje.getFullYear())
const assinando = ref(false)
const baixandoCSV = ref(false)
const baixandoPDF = ref(false)
const assinaturaMes = ref<any>(null)
const precisaRenovarAssinatura = ref(false)

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
  return [anoAtual - 1, anoAtual, anoAtual + 1]
})

// Verificar se o período está dentro dos 30 dias
const periodoExpirado = computed(() => {
  const dataAtual = new Date()
  const ultimoDiaMes = new Date(anoSelecionado.value, mesSelecionado.value, 0)
  const diferencaDias = Math.floor((dataAtual.getTime() - ultimoDiaMes.getTime()) / (1000 * 60 * 60 * 24))
  return diferencaDias > 30
})

// Filtrar meses disponíveis (últimos 30 dias)
const mesesDisponiveis = computed(() => {
  const dataAtual = new Date()
  const mesAtual = dataAtual.getMonth() + 1
  const anoAtual = dataAtual.getFullYear()
  
  return meses.filter(m => {
    if (anoSelecionado.value < anoAtual) return false
    if (anoSelecionado.value > anoAtual) return false
    
    const ultimoDiaMes = new Date(anoAtual, m.value, 0)
    const diferencaDias = Math.floor((dataAtual.getTime() - ultimoDiaMes.getTime()) / (1000 * 60 * 60 * 24))
    return diferencaDias <= 30
  })
})

// Data limite para visualização
const dataLimiteVisualizacao = computed(() => {
  const ultimoDiaMes = new Date(anoSelecionado.value, mesSelecionado.value, 0)
  const dataLimite = new Date(ultimoDiaMes)
  dataLimite.setDate(dataLimite.getDate() + 30)
  return dataLimite.toLocaleDateString('pt-BR')
})

const resumo = computed(() => {
  const faltas = props.registros.filter(r => r.status === 'Falta').length
  
  // Calcular totais usando tempo real para registros em andamento
  let totalMinutos = 0
  let minutosIntervalo = 0
  let minutosExtras = 0
  let diasTrabalhados = 0
  
  props.registros.forEach(reg => {
    const resultado = calcularHorasComTempoReal(reg)
    
    if (resultado.totalMinutos > 0) {
      totalMinutos += resultado.totalMinutos
      diasTrabalhados++
    }
    
    minutosIntervalo += resultado.intervaloMinutos
    
    // Calcular horas extras (acima de 8h por dia)
    if (resultado.totalMinutos > 480) { // 480 min = 8h
      minutosExtras += resultado.totalMinutos - 480
    }
  })
  
  const horasTotal = Math.floor(totalMinutos / 60)
  const minutosTotal = totalMinutos % 60
  const horasIntervaloCalc = Math.floor(minutosIntervalo / 60)
  const minutosIntervaloCalc = minutosIntervalo % 60
  const horasExtrasCalc = Math.floor(minutosExtras / 60)
  const minutosExtrasCalc = minutosExtras % 60
  
  return {
    diasTrabalhados,
    horasTrabalhadas: `${horasTotal}h${minutosTotal.toString().padStart(2, '0')}`,
    horasIntervalo: minutosIntervalo > 0 ? `${horasIntervaloCalc}h${minutosIntervaloCalc.toString().padStart(2, '0')}` : '0h',
    horasExtras: minutosExtras > 0 ? `${horasExtrasCalc}h${minutosExtrasCalc.toString().padStart(2, '0')}` : '0h',
    faltas
  }
})

const buscar = () => {
  emit('refresh', mesSelecionado.value, anoSelecionado.value)
}

const formatarData = (data: string) => {
  if (!data) return '-'
  const d = new Date(data + 'T00:00:00')
  return d.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: '2-digit' })
}

// formatarHora já importado do utils

const calcularTotal = (reg: any) => {
  const resultado = calcularHorasComTempoReal(reg)
  return resultado.horasFormatadas
}

const obterAvisos = (reg: any) => {
  const resultado = calcularHorasComTempoReal(reg)
  return resultado.avisos
}

const obterDetalhes = (reg: any) => {
  const resultado = calcularHorasComTempoReal(reg)
  return resultado.detalhes
}

const estaEmAndamento = (reg: any) => {
  return registroEmAndamento(reg)
}

const getStatusClass = (status: string) => {
  const classes: Record<string, string> = {
    'Normal': 'bg-green-100 text-green-700',
    'Falta': 'bg-red-100 text-red-700',
    'Atestado': 'bg-blue-100 text-blue-700',
    'Ferias': 'bg-amber-100 text-amber-700',
    'Folga': 'bg-slate-100 text-slate-700',
    'Feriado': 'bg-purple-100 text-purple-700',
    'Ajustado': 'bg-orange-100 text-orange-700',
  }
  return classes[status] || 'bg-slate-100 text-slate-700'
}

// Definir função antes do watch
const carregarAssinatura = async () => {
  try {
    const { data } = await useFetch('/api/funcionario/ponto/assinatura', {
      params: {
        mes: mesSelecionado.value,
        ano: anoSelecionado.value
      }
    })
    assinaturaMes.value = data.value
    
    // Verificar se precisa renovar assinatura (apenas para mês atual)
    const hoje = new Date()
    if (mesSelecionado.value === hoje.getMonth() + 1 && anoSelecionado.value === hoje.getFullYear()) {
      await verificarRenovacaoAssinatura()
    }
  } catch (error) {
    console.error('Erro ao carregar assinatura:', error)
  }
}

// Carregar assinatura do mês ao mudar período
watch([mesSelecionado, anoSelecionado], async () => {
  await carregarAssinatura()
}, { immediate: true })

// Estados para modal de assinatura
const mostrarModalAssinatura = ref(false)

const assinarPonto = () => {
  mostrarModalAssinatura.value = true
}

const onAssinado = (response: any) => {
  console.log('Resposta da assinatura:', response)
  
  // A API retorna { success: true, assinatura: {...} }
  if (response && response.assinatura) {
    assinaturaMes.value = response.assinatura
  } else if (response && response.success) {
    // Se não tem assinatura mas foi sucesso, recarregar dados
    carregarAssinaturaMes()
  }
  
  alert('Ponto assinado com sucesso! Você pode fazer o download do arquivo CSV.')
}

const formatarDataAssinatura = (data: string) => {
  if (!data) return '-'
  return new Date(data).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const baixarCSV = async () => {
  if (baixandoCSV.value || !assinaturaMes.value) return
  
  baixandoCSV.value = true
  
  try {
    // Primeiro buscar o ID do colaborador atual
    const { data: funcionario } = await useFetch('/api/funcionario/perfil')
    
    if (!funcionario.value?.appUser?.colaborador_id) {
      throw new Error('Colaborador não encontrado')
    }
    
    const response = await fetch(`/api/funcionario/ponto/download-csv?mes=${mesSelecionado.value}&ano=${anoSelecionado.value}`)
    
    if (!response.ok) {
      throw new Error('Erro ao baixar arquivo')
    }
    
    const blob = await response.blob()
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `ponto_${mesSelecionado.value.toString().padStart(2, '0')}_${anoSelecionado.value}.csv`
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)
  } catch (error) {
    console.error('Erro ao baixar CSV:', error)
    alert('Erro ao baixar arquivo. Tente novamente.')
  } finally {
    baixandoCSV.value = false
  }
}

const baixarPDF = async () => {
  if (baixandoPDF.value) return
  
  baixandoPDF.value = true
  
  try {
    // Primeiro buscar o ID do colaborador atual
    const { data: funcionario } = await useFetch('/api/funcionario/perfil')
    
    if (!funcionario.value?.appUser?.colaborador_id) {
      throw new Error('Colaborador não encontrado')
    }
    
    // Usar API pública que funciona para todos os colaboradores
    const url = `/api/public/ponto/download-html?colaborador_id=${funcionario.value.appUser.colaborador_id}&mes=${mesSelecionado.value}&ano=${anoSelecionado.value}`
    window.open(url, '_blank')
    
  } catch (error) {
    console.error('Erro ao abrir relatório:', error)
    alert('Erro ao gerar relatório. Tente novamente.')
  } finally {
    baixandoPDF.value = false
  }
}

const verificarRenovacaoAssinatura = async () => {
  try {
    const response = await $fetch('/api/funcionario/ponto/renovar-assinatura', {
      method: 'POST'
    })
    
    if (response.precisaAssinar) {
      precisaRenovarAssinatura.value = true
      // Mostrar notificação para o usuário
      console.log('É necessário renovar sua assinatura digital para este mês.')
    }
  } catch (error) {
    console.error('Erro ao verificar renovação:', error)
  }
}
</script>
