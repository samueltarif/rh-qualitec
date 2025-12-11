<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
    <header class="bg-black/40 backdrop-blur-xl border-b border-white/10 sticky top-0 z-40">
      <div class="max-w-7xl mx-auto px-8 py-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 bg-gradient-to-br from-red-600 to-red-800 rounded-xl flex items-center justify-center shadow-lg shadow-red-500/30">
              <Icon name="heroicons:building-office-2" class="text-white" size="28" />
            </div>
            <div>
              <h1 class="text-xl font-bold text-white">Dashboard Admin</h1>
              <p class="text-sm text-gray-400">Sistema RH Qualitec</p>
            </div>
          </div>
          <div class="flex items-center gap-4">
            <UserProfileDropdown theme="admin" />
          </div>
        </div>
      </div>
    </header>

    <div class="max-w-7xl mx-auto p-8">
      <div class="mb-8">
        <h2 class="text-3xl font-bold text-white">Olá, {{ currentUser?.nome?.split(' ')[0] }} 👑</h2>
        <p class="text-gray-400 mt-1">{{ saudacao }} • {{ dataAtual }}</p>
      </div>

      <div v-if="loading" class="flex items-center justify-center py-20">
        <div class="text-center">
          <Icon name="heroicons:arrow-path" class="animate-spin text-red-500 mx-auto mb-4" size="48" />
          <p class="text-gray-400">Carregando dashboard...</p>
        </div>
      </div>

      <template v-else>
        <!-- Alertas -->
        <div v-if="stats?.alertas?.length" class="mb-8 space-y-3">
          <div v-for="(alerta, index) in stats.alertas" :key="index" class="p-4 rounded-xl backdrop-blur-xl border flex items-center gap-3" :class="alertaClass(alerta.tipo)">
            <Icon :name="alertaIcon(alerta.tipo)" size="24" />
            <span>{{ alerta.mensagem }}</span>
          </div>
        </div>

        <!-- Cards Principais -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <CardDashboardStat icon="heroicons:user-group" label="Ativos" :value="stats?.colaboradoresAtivos || 0" subtitle="colaboradores" color="emerald" />
          <CardDashboardStat icon="heroicons:pause-circle" label="Afastados" :value="stats?.colaboradoresAfastados || 0" subtitle="colaboradores" color="amber" />
          <CardDashboardStat icon="heroicons:arrow-path" label="Rotatividade" :value="stats?.taxaRotatividade || 0" subtitle="últimos 12 meses" color="purple" format="percent" />
          <CardDashboardStat icon="heroicons:banknotes" label="Folha Mensal" :value="stats?.custoFolhaMensal || 0" subtitle="custo total" color="red" format="currency" />
        </div>

        <!-- Segunda linha -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <CardDashboardStat icon="heroicons:users" label="Usuários" :value="stats?.totalUsuarios || 0" subtitle="Usuários do Sistema" color="blue" size="sm" />
          <CardDashboardStat icon="heroicons:building-office" label="Departamentos" :value="stats?.totalDepartamentos || 0" subtitle="Departamentos" color="cyan" size="sm" />
          <CardDashboardStat icon="heroicons:briefcase" label="Cargos" :value="stats?.totalCargos || 0" subtitle="Cargos Ativos" color="pink" size="sm" />
          <CardDashboardStat icon="heroicons:user-plus" label="Admissões" :value="stats?.novosNoMes || 0" subtitle="Admissões no Mês" color="green" size="sm" />
        </div>

        <!-- Aniversariantes -->
        <div class="grid md:grid-cols-2 gap-6 mb-8">
          <WidgetAniversariantes :aniversariantes="stats?.aniversariantesMes || []" :mesNome="stats?.mesAtualNome || ''" tipo="atual" />
          <WidgetAniversariantes :aniversariantes="stats?.aniversariantesProximoMes || []" :mesNome="stats?.proximoMesNome || ''" tipo="proximo" />
        </div>

        <WidgetUltimasAtividades />
        <WidgetAcoesRapidas />
      </template>
    </div>


  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: ['admin'], layout: false })

const { currentUser } = useAppAuth()
const loading = ref(true)
const stats = ref<any>(null)
const alteracoesPendentes = ref(0)

const saudacao = computed(() => {
  const hora = new Date().getHours()
  return hora < 12 ? 'Bom dia' : hora < 18 ? 'Boa tarde' : 'Boa noite'
})

const dataAtual = computed(() => new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }))

const alertaClass = (tipo: string) => ({
  'bg-yellow-500/10 border-yellow-500/30 text-yellow-300': tipo === 'warning',
  'bg-red-500/10 border-red-500/30 text-red-300': tipo === 'error',
  'bg-blue-500/10 border-blue-500/30 text-blue-300': tipo === 'info',
})

const alertaIcon = (tipo: string) => tipo === 'warning' ? 'heroicons:exclamation-triangle' : tipo === 'error' ? 'heroicons:x-circle' : 'heroicons:information-circle'



onMounted(async () => {
  try {
    const [dashResponse, alteracoesResponse] = await Promise.all([
      $fetch<{ success: boolean; data: any }>('/api/dashboard/stats'),
      $fetch<{ pendentes: number }>('/api/admin/alteracoes-dados/stats').catch(() => ({ pendentes: 0 }))
    ])
    if (dashResponse.success) stats.value = dashResponse.data
    alteracoesPendentes.value = alteracoesResponse.pendentes || 0
  } catch (e) { console.error(e) }
  finally { loading.value = false }
})
</script>
