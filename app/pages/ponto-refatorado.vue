<template>
  <div class="min-h-screen bg-gray-50 p-6">
    <div class="max-w-7xl mx-auto space-y-6">
      <!-- Header com Horas Trabalhadas -->
      <CardHorasTrabalhadasHeader
        :horas="horasTrabalhadas.horas"
        :minutos="horasTrabalhadas.minutos"
        :entrada="registroAtual.entrada"
        :intervalo="registroAtual.intervalo"
        :tempo-real="true"
      />

      <!-- Card de Registro de Ponto -->
      <CardRegistroPonto
        titulo="Registro de Ponto"
        :subtitulo="dataAtualFormatada"
        texto-botao="Bater Ponto"
        @bater-ponto="handleBaterPonto"
      />

      <!-- Navegação por Abas -->
      <TabNavigation
        :tabs="tabs"
        :model-value="abaAtiva"
        @change="abaAtiva = $event"
      />

      <!-- Conteúdo da Aba Ativa -->
      <div v-if="abaAtiva === 'meu-ponto'">
        <!-- Filtros -->
        <FilterBar
          v-model:mes="filtros.mes"
          v-model:ano="filtros.ano"
          @buscar="buscarRegistros"
        />

        <!-- Tabela de Registros -->
        <div class="mt-6">
          <TablePonto :registros="registros" />
        </div>

        <!-- Cards de Resumo -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
          <CardResumo
            titulo="Dias Trabalhados"
            :valor="resumo.diasTrabalhados"
            variant="blue"
          />
          <CardResumo
            titulo="Horas Trabalhadas"
            :valor="resumo.horasTrabalhadas"
            variant="green"
          />
          <CardResumo
            titulo="Intervalo"
            :valor="resumo.intervalo"
            variant="yellow"
          />
          <CardResumo
            titulo="Faltas"
            :valor="resumo.faltas"
            variant="red"
          />
        </div>
      </div>

      <!-- Outras abas -->
      <div v-else-if="abaAtiva === 'solicitacoes'">
        <div class="bg-white rounded-lg shadow-sm p-8 text-center">
          <IconDocument class="mx-auto text-gray-400 w-12 h-12" />
          <p class="mt-4 text-gray-500">Conteúdo de Solicitações</p>
        </div>
      </div>

      <div v-else-if="abaAtiva === 'documentos'">
        <div class="bg-white rounded-lg shadow-sm p-8 text-center">
          <IconDocument class="mx-auto text-gray-400 w-12 h-12" />
          <p class="mt-4 text-gray-500">Conteúdo de Documentos</p>
        </div>
      </div>

      <div v-else-if="abaAtiva === 'comunicados'">
        <div class="bg-white rounded-lg shadow-sm p-8 text-center">
          <IconBell class="mx-auto text-gray-400 w-12 h-12" />
          <p class="mt-4 text-gray-500">Conteúdo de Comunicados</p>
        </div>
      </div>

      <div v-else-if="abaAtiva === 'perfil'">
        <div class="bg-white rounded-lg shadow-sm p-8 text-center">
          <IconUser class="mx-auto text-gray-400 w-12 h-12" />
          <p class="mt-4 text-gray-500">Conteúdo de Perfil</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Composables
const { format } = useDateFormat()

// Estado
const abaAtiva = ref('meu-ponto')
const filtros = ref({
  mes: '12',
  ano: '2025'
})

const horasTrabalhadas = ref({
  horas: 5,
  minutos: 38
})

const registroAtual = ref({
  entrada: '07:30:00',
  intervalo: '12:00:00 - 13:15:00'
})

const resumo = ref({
  diasTrabalhados: '1',
  horasTrabalhadas: '5h38',
  intervalo: '1h15',
  faltas: '0'
})

const registros = ref([
  {
    data: 'sex., 05/12',
    entrada: '07:30',
    intervaloEntrada: '12:00',
    intervaloSaida: '13:15',
    saida: '--:--',
    total: '5h38',
    status: 'normal' as const,
    statusMensagem: 'Contagem em tempo real'
  }
])

// Tabs
const tabs = [
  { id: 'meu-ponto', label: 'Meu Ponto', icon: IconFingerprint },
  { id: 'solicitacoes', label: 'Solicitações', icon: IconDocument },
  { id: 'documentos', label: 'Documentos', icon: IconDocument },
  { id: 'comunicados', label: 'Comunicados', icon: IconBell },
  { id: 'perfil', label: 'Meu Perfil', icon: IconUser }
]

// Computed
const dataAtualFormatada = computed(() => {
  const now = new Date()
  const dias = ['domingo', 'segunda-feira', 'terça-feira', 'quarta-feira', 'quinta-feira', 'sexta-feira', 'sábado']
  const meses = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro']
  
  return `${dias[now.getDay()]}, ${now.getDate()} de ${meses[now.getMonth()]} de ${now.getFullYear()} às ${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`
})

// Métodos
const handleBaterPonto = () => {
  console.log('Bater ponto clicado')
  // Lógica de registro de ponto
}

const buscarRegistros = () => {
  console.log('Buscar registros:', filtros.value)
  // Lógica de busca
}

// Composable auxiliar para formatação de data
function useDateFormat() {
  const format = (date: Date, formatStr: string) => {
    // Implementação simples de formatação
    return date.toLocaleDateString('pt-BR')
  }
  
  return { format }
}
</script>
