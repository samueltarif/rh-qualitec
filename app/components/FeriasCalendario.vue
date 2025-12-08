<template>
  <UICard title="Calendário de Férias" icon="heroicons:calendar-days" icon-color="amber">
    <template #actions>
      <div class="flex items-center gap-2">
        <UIButton theme="admin" variant="ghost" size="sm" @click="mesAnterior">
          <Icon name="heroicons:chevron-left" size="20" />
        </UIButton>
        <span class="text-sm font-semibold text-gray-700 min-w-[140px] text-center">
          {{ mesNome }} {{ ano }}
        </span>
        <UIButton theme="admin" variant="ghost" size="sm" @click="proximoMes">
          <Icon name="heroicons:chevron-right" size="20" />
        </UIButton>
      </div>
    </template>

    <div class="mt-4">
      <!-- Dias da semana -->
      <div class="grid grid-cols-7 gap-1 mb-2">
        <div v-for="dia in diasSemana" :key="dia" class="text-center text-xs font-semibold text-gray-500 py-2">
          {{ dia }}
        </div>
      </div>

      <!-- Dias do mês -->
      <div class="grid grid-cols-7 gap-1">
        <div
          v-for="(dia, index) in diasCalendario"
          :key="index"
          :class="[
            'min-h-[60px] p-1 rounded-lg text-sm border transition-colors',
            dia.mesAtual ? 'bg-white border-gray-200' : 'bg-gray-50 border-transparent',
            dia.hoje && 'ring-2 ring-red-500',
            dia.ferias && 'bg-amber-50 border-amber-200',
          ]"
        >
          <div class="flex items-center justify-between">
            <span :class="[
              'text-xs font-medium',
              dia.mesAtual ? 'text-gray-700' : 'text-gray-400',
              dia.hoje && 'text-red-600 font-bold',
            ]">
              {{ dia.numero }}
            </span>
          </div>
          <div v-if="dia.ferias" class="mt-1">
            <div
              v-for="ferias in dia.ferias.slice(0, 2)"
              :key="ferias.id"
              class="text-xs truncate px-1 py-0.5 rounded mb-0.5"
              :class="getStatusClass(ferias.status)"
              :title="ferias.colaborador"
            >
              {{ ferias.colaborador.split(' ')[0] }}
            </div>
            <div v-if="dia.ferias.length > 2" class="text-xs text-gray-500 px-1">
              +{{ dia.ferias.length - 2 }} mais
            </div>
          </div>
        </div>
      </div>

      <!-- Legenda -->
      <div class="flex flex-wrap gap-4 mt-4 pt-4 border-t border-gray-200">
        <div class="flex items-center gap-2">
          <div class="w-3 h-3 rounded bg-amber-200"></div>
          <span class="text-xs text-gray-600">Pendente</span>
        </div>
        <div class="flex items-center gap-2">
          <div class="w-3 h-3 rounded bg-green-200"></div>
          <span class="text-xs text-gray-600">Aprovada</span>
        </div>
        <div class="flex items-center gap-2">
          <div class="w-3 h-3 rounded bg-blue-200"></div>
          <span class="text-xs text-gray-600">Em Gozo</span>
        </div>
      </div>
    </div>
  </UICard>
</template>

<script setup lang="ts">
interface Ferias {
  id: string
  colaborador: string
  status: string
}

interface Props {
  ferias?: Array<{
    id: string
    colaborador: string
    data_inicio: string
    data_fim: string
    status: string
  }>
}

const props = withDefaults(defineProps<Props>(), {
  ferias: () => [],
})

const mesAtual = ref(new Date().getMonth())
const ano = ref(new Date().getFullYear())

const diasSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

const meses = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
]

const mesNome = computed(() => meses[mesAtual.value])

const diasCalendario = computed(() => {
  const primeiroDia = new Date(ano.value, mesAtual.value, 1)
  const ultimoDia = new Date(ano.value, mesAtual.value + 1, 0)
  const diasNoMes = ultimoDia.getDate()
  const diaSemanaInicio = primeiroDia.getDay()
  
  const dias: Array<{
    numero: number
    mesAtual: boolean
    hoje: boolean
    ferias: Ferias[] | null
  }> = []
  
  // Dias do mês anterior
  const mesAnteriorUltimoDia = new Date(ano.value, mesAtual.value, 0).getDate()
  for (let i = diaSemanaInicio - 1; i >= 0; i--) {
    dias.push({
      numero: mesAnteriorUltimoDia - i,
      mesAtual: false,
      hoje: false,
      ferias: null,
    })
  }
  
  // Dias do mês atual
  const hoje = new Date()
  for (let i = 1; i <= diasNoMes; i++) {
    const dataAtual = new Date(ano.value, mesAtual.value, i)
    const feriasNoDia = props.ferias.filter(f => {
      const inicio = new Date(f.data_inicio)
      const fim = new Date(f.data_fim)
      return dataAtual >= inicio && dataAtual <= fim
    }).map(f => ({
      id: f.id,
      colaborador: f.colaborador,
      status: f.status,
    }))
    
    dias.push({
      numero: i,
      mesAtual: true,
      hoje: hoje.getDate() === i && hoje.getMonth() === mesAtual.value && hoje.getFullYear() === ano.value,
      ferias: feriasNoDia.length > 0 ? feriasNoDia : null,
    })
  }
  
  // Dias do próximo mês
  const diasRestantes = 42 - dias.length
  for (let i = 1; i <= diasRestantes; i++) {
    dias.push({
      numero: i,
      mesAtual: false,
      hoje: false,
      ferias: null,
    })
  }
  
  return dias
})

const mesAnterior = () => {
  if (mesAtual.value === 0) {
    mesAtual.value = 11
    ano.value--
  } else {
    mesAtual.value--
  }
}

const proximoMes = () => {
  if (mesAtual.value === 11) {
    mesAtual.value = 0
    ano.value++
  } else {
    mesAtual.value++
  }
}

const getStatusClass = (status: string) => {
  const classes: Record<string, string> = {
    pendente: 'bg-amber-200 text-amber-800',
    aprovada: 'bg-green-200 text-green-800',
    em_gozo: 'bg-blue-200 text-blue-800',
    concluida: 'bg-gray-200 text-gray-800',
    rejeitada: 'bg-red-200 text-red-800',
  }
  return classes[status] || classes.pendente
}
</script>
