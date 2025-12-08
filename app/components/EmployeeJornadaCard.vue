<template>
  <div class="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
    <div v-if="!jornada" class="text-center py-8">
      <Icon name="heroicons:calemibold text-slate-800 flex items-center gap-2">
        <Icon name="heroicons:calendar-days" class="text-blue-600" size="24" />
        Minha Jornada de Trabalho
      </h3>
      <span v-if="jornada" :class="[
        'px-3 py-1 rounded-full text-sm font-medium',
        jornada.tipo === '5x2' ? 'bg-blue-100 text-blue-700' :
        jornada.tipo === '6x1' ? 'bg-purple-100 text-purple-700' :
        jornada.tipo === '12x36' ? 'bg-amber-100 text-amber-700' :
        'bg-gray-100 text-gray-700'
      ]">
        {{ jornada.tipo }}
      </span>
    </div>

    <div v-if="!jornada" class="text-center py-8">
      <Icon name="heroicons:calendar-days" class="mx-auto text-gray-300" size="48" />
      <p class="text-gray-500 mt-2">Nenhuma jornada configurada</p>
      <p class="text-sm text-gray-400 mt-1">Entre em contato com o RH</p>
    </div>

    <div v-else class="space-y-6">
      <!-- Resumo Principal -->
      <div class="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border-2 border-blue-200">
        <h4 class="text-lg font-bold text-blue-900 mb-4">Jornada Oficial: {{ jornada.nome }}</h4>
        
        <div class="space-y-2 text-slate-700">
          <!-- Carga Diária -->
          <div class="flex items-start gap-2">
            <span class="font-semibold">Carga diária:</span>
            <div class="flex-1">
              <div v-html="getResumoHorasDiariasFormatado()"></div>
            </div>
          </div>
          
          <!-- Carga Semanal -->
          <div class="flex items-start gap-2">
            <span class="font-semibold">Carga semanal:</span>
            <span class="font-bold text-blue-700">{{ formatarCargaSemanal() }}</span>
          </div>
          
          <!-- Regime -->
          <div class="flex items-start gap-2">
            <span class="font-semibold">Regime:</span>
            <span>{{ getRegime() }}</span>
          </div>
        </div>
      </div>

      <!-- Horários Detalhados -->
      <div class="grid grid-cols-2 gap-4">
        <div class="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <div class="flex items-center gap-2 mb-2">
            <Icon name="heroicons:arrow-right-on-rectangle" class="text-blue-600" size="20" />
            <span class="text-sm font-medium text-blue-900">Entrada</span>
          </div>
          <p class="text-2xl font-bold text-blue-700">{{ jornada.hora_entrada }}</p>
        </div>
        <div class="bg-red-50 rounded-lg p-4 border border-red-200">
          <div class="flex items-center gap-2 mb-2">
            <Icon name="heroicons:arrow-left-on-rectangle" class="text-red-600" size="20" />
            <span class="text-sm font-medium text-red-900">Saída</span>
          </div>
          <p class="text-2xl font-bold text-red-700">{{ jornada.hora_saida }}</p>
        </div>
      </div>

      <!-- Intervalo -->
      <div v-if="jornada.intervalo_minutos" class="bg-amber-50 rounded-lg p-4 border border-amber-200">
        <div class="flex items-center gap-2 mb-2">
          <Icon name="heroicons:pause" class="text-amber-600" size="20" />
          <span class="text-sm font-medium text-amber-900">Intervalo</span>
        </div>
        <p class="text-xl font-bold text-amber-700">{{ jornada.intervalo_minutos }} minutos</p>
      </div>

      <!-- Dias da Semana -->
      <div>
        <p class="text-sm font-medium text-slate-700 mb-3">Dias de Trabalho:</p>
        <div class="flex flex-wrap gap-2">
          <span
            v-for="dia in diasSemana"
            :key="dia.value"
            :class="[
              'px-3 py-2 rounded-lg text-sm font-medium transition-colors',
              isDiaTrabalho(dia.value)
                ? 'bg-green-100 text-green-700 border-2 border-green-300'
                : 'bg-gray-100 text-gray-400 border-2 border-gray-200'
            ]"
          >
            {{ dia.label }}
          </span>
        </div>
      </div>

      <!-- Carga Horária -->
      <div class="bg-slate-50 rounded-lg p-4 border border-slate-200">
        <div class="grid grid-cols-2 gap-4">
          <div>
            <p class="text-xs text-slate-600 mb-1">Horas por Dia</p>
            <p class="text-lg font-bold text-slate-800">{{ calcularHorasDia() }}h</p>
          </div>
          <div>
            <p class="text-xs text-slate-600 mb-1">Horas por Semana</p>
            <p class="text-lg font-bold text-slate-800">{{ jornada.carga_horaria_semanal || '--' }}h</p>
          </div>
        </div>
      </div>

      <!-- Observações -->
      <div v-if="jornada.observacoes" class="bg-blue-50 border-l-4 border-blue-400 p-4">
        <div class="flex items-start gap-2">
          <Icon name="heroicons:information-circle" class="text-blue-600 mt-0.5" size="20" />
          <div>
            <p class="text-sm font-medium text-blue-900 mb-1">Observações</p>
            <p class="text-sm text-blue-700">{{ jornada.observacoes }}</p>
          </div>
        </div>
      </div>

      <!-- Aviso -->
      <div class="bg-amber-50 border-l-4 border-amber-400 p-4">
        <div class="flex items-start gap-2">
          <Icon name="heroicons:exclamation-triangle" class="text-amber-600 mt-0.5" size="20" />
          <div>
            <p class="text-sm font-medium text-amber-900 mb-1">Importante</p>
            <p class="text-sm text-amber-700">
              Você deve registrar ponto apenas nos dias de trabalho da sua jornada. 
              Dias fora da escala não serão contabilizados como falta.
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Jornada {
  id: string
  nome: string
  tipo: string
  descricao?: string
  hora_entrada: string
  hora_saida: string
  intervalo_minutos?: number
  carga_horaria_semanal?: number
  dias_semana: string[]
  observacoes?: string
}

interface Props {
  jornada?: Jornada | null
}

const props = defineProps<Props>()

const diasSemana = [
  { value: 'segunda', label: 'Seg' },
  { value: 'terca', label: 'Ter' },
  { value: 'quarta', label: 'Qua' },
  { value: 'quinta', label: 'Qui' },
  { value: 'sexta', label: 'Sex' },
  { value: 'sabado', label: 'Sáb' },
  { value: 'domingo', label: 'Dom' }
]

const isDiaTrabalho = (dia: string) => {
  return props.jornada?.dias_semana?.includes(dia) || false
}

const calcularHorasDia = () => {
  if (!props.jornada) return 0
  
  const entrada = props.jornada.hora_entrada.split(':')
  const saida = props.jornada.hora_saida.split(':')
  
  const entradaMinutos = parseInt(entrada[0]) * 60 + parseInt(entrada[1])
  const saidaMinutos = parseInt(saida[0]) * 60 + parseInt(saida[1])
  
  let totalMinutos = saidaMinutos - entradaMinutos
  
  if (props.jornada.intervalo_minutos) {
    totalMinutos -= props.jornada.intervalo_minutos
  }
  
  return (totalMinutos / 60).toFixed(1)
}

const getResumoHorasDiariasFormatado = () => {
  if (!props.jornada) return ''
  
  const diasTrabalhados = props.jornada.dias_semana || []
  const horasPorDia = calcularHorasDia()
  
  const diasUteis = ['segunda', 'terca', 'quarta', 'quinta', 'sexta']
  
  // Padrão Qualitec (seg-qui 8h45, sex 7h45) - 44h semanais
  if (props.jornada.nome?.toLowerCase().includes('qualitec') || 
      (props.jornada.carga_horaria_semanal === 44 && props.jornada.nome?.toLowerCase().includes('padrão'))) {
    return '• Seg–Qui: 8h45<br>• Sexta: 7h45'
  }
  
  // CLT Padrão 44h (seg-sex 8h48)
  if (props.jornada.carga_horaria_semanal === 44 && diasTrabalhados.length === 5) {
    return '• Seg–Sex: 8h48'
  }
  
  // CLT Padrão 40h (seg-sex 8h)
  if (props.jornada.carga_horaria_semanal === 40 && diasTrabalhados.length === 5) {
    return '• Seg–Sex: 8h'
  }
  
  // Se for 5x2 padrão (seg-sex) com mesma carga
  if (diasTrabalhados.length === 5 && diasUteis.every(d => diasTrabalhados.includes(d))) {
    return `• Seg–Sex: ${horasPorDia}h`
  }
  
  // Se for 6x1 (seg-sab)
  if (diasTrabalhados.length === 6 && diasTrabalhados.includes('sabado')) {
    return `• Seg–Sáb: ${horasPorDia}h`
  }
  
  // Se for 12x36 ou escala alternada
  if (props.jornada.tipo === '12x36') {
    return `• Escala 12x36: ${horasPorDia}h por plantão`
  }
  
  // Meio período
  if (props.jornada.tipo?.toLowerCase().includes('parcial') || props.jornada.tipo?.toLowerCase().includes('meio')) {
    return `• Meio período: ${horasPorDia}h por dia`
  }
  
  // Noturno
  if (props.jornada.tipo?.toLowerCase().includes('noturno')) {
    return `• Turno noturno: ${horasPorDia}h por dia`
  }
  
  // Genérico
  return `• ${horasPorDia}h por dia`
}

const formatarCargaSemanal = () => {
  if (!props.jornada) return '0h'
  
  // Se já tem carga semanal definida
  if (props.jornada.carga_horaria_semanal) {
    const horas = props.jornada.carga_horaria_semanal
    // Formatar como 42h45 se tiver minutos
    if (horas % 1 !== 0) {
      const horasInteiras = Math.floor(horas)
      const minutos = Math.round((horas % 1) * 60)
      return `${horasInteiras}h${minutos.toString().padStart(2, '0')}`
    }
    return `${horas}h`
  }
  
  // Calcular baseado nos dias
  const diasTrabalhados = props.jornada.dias_semana?.length || 0
  const horasPorDia = parseFloat(calcularHorasDia())
  const totalHoras = diasTrabalhados * horasPorDia
  
  // Formatar
  const horasInteiras = Math.floor(totalHoras)
  const minutos = Math.round((totalHoras % 1) * 60)
  
  if (minutos > 0) {
    return `${horasInteiras}h${minutos.toString().padStart(2, '0')}`
  }
  return `${horasInteiras}h`
}

const getRegime = () => {
  if (!props.jornada) return 'CLT'
  
  const tipo = props.jornada.tipo?.toLowerCase() || ''
  
  if (tipo.includes('clt') || tipo.includes('padrao') || tipo === '5x2') {
    return 'CLT'
  }
  
  if (tipo === '12x36') {
    return 'CLT - Escala 12x36'
  }
  
  if (tipo === '6x1') {
    return 'CLT - 6x1'
  }
  
  if (tipo.includes('parcial') || tipo.includes('meio')) {
    return 'CLT - Meio Período'
  }
  
  if (tipo.includes('noturno')) {
    return 'CLT - Noturno'
  }
  
  return 'CLT'
}
</script>
