<template>
  <div>
    <!-- Filtros -->
    <div class="flex flex-wrap items-center gap-4 mb-6">
      <div class="flex items-center gap-2">
        <label class="text-sm text-slate-600">Mês:</label>
        <select v-model="mesSelecionado" class="px-3 py-2 border border-slate-300 rounded-lg text-sm">
          <option v-for="m in meses" :key="m.value" :value="m.value">{{ m.label }}</option>
        </select>
      </div>
      <div class="flex items-center gap-2">
        <label class="text-sm text-slate-600">Ano:</label>
        <select v-model="anoSelecionado" class="px-3 py-2 border border-slate-300 rounded-lg text-sm">
          <option v-for="a in anos" :key="a" :value="a">{{ a }}</option>
        </select>
      </div>
      <button @click="buscar" class="px-4 py-2 bg-slate-800 text-white rounded-lg text-sm hover:bg-slate-700">
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
</script>
