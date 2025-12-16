<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header Profissional Claro -->
    <header class="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2 sm:gap-4">
            <div class="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Icon name="heroicons:building-office-2" class="text-white" size="20" />
            </div>
            <div>
              <h1 class="text-base sm:text-xl font-bold text-gray-900">Dashboard Admin</h1>
              <p class="text-xs sm:text-sm text-gray-500 hidden sm:block">Sistema RH Qualitec</p>
            </div>
          </div>
          <div class="flex items-center gap-2 sm:gap-4">
            <UserProfileDropdown theme="light" />
          </div>
        </div>
      </div>
    </header>

    <!-- Content -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
      <!-- Saudação -->
      <div class="mb-4 sm:mb-6 lg:mb-8">
        <h2 class="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">Olá, {{ currentUser?.nome?.split(' ')[0] }} 👋</h2>
        <p class="text-gray-500 mt-1 text-sm sm:text-base">{{ saudacao }} • <span class="hidden sm:inline">{{ dataAtual }}</span><span class="sm:hidden">{{ dataAtualCurta }}</span></p>
      </div>

      <div v-if="loading" class="flex items-center justify-center py-20">
        <div class="text-center">
          <Icon name="heroicons:arrow-path" class="animate-spin text-blue-600 mx-auto mb-4" size="48" />
          <p class="text-gray-500">Carregando dashboard...</p>
        </div>
      </div>

      <template v-else>
        <!-- Alertas -->
        <div v-if="stats?.alertas?.length" class="mb-4 sm:mb-6 lg:mb-8 space-y-2 sm:space-y-3">
          <div v-for="(alerta, index) in stats.alertas" :key="index" class="p-3 sm:p-4 rounded-lg sm:rounded-xl border flex items-center gap-2 sm:gap-3" :class="alertaClass(alerta.tipo)">
            <Icon :name="alertaIcon(alerta.tipo)" class="flex-shrink-0" size="20" />
            <span class="text-sm sm:text-base">{{ alerta.mensagem }}</span>
          </div>
        </div>

        <!-- Cards Principais -->
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-5 mb-4 sm:mb-6 lg:mb-8">
          <div class="bg-white rounded-xl border border-gray-200 p-4 sm:p-5 shadow-sm hover:shadow-md transition-shadow">
            <div class="flex items-center gap-3 mb-3">
              <div class="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                <Icon name="heroicons:user-group" class="text-emerald-600" size="20" />
              </div>
              <span class="text-xs sm:text-sm font-medium text-gray-500">Ativos</span>
            </div>
            <p class="text-2xl sm:text-3xl font-bold text-gray-900">{{ stats?.colaboradoresAtivos || 0 }}</p>
            <p class="text-xs text-gray-400 mt-1">colaboradores</p>
          </div>

          <div class="bg-white rounded-xl border border-gray-200 p-4 sm:p-5 shadow-sm hover:shadow-md transition-shadow">
            <div class="flex items-center gap-3 mb-3">
              <div class="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                <Icon name="heroicons:pause-circle" class="text-amber-600" size="20" />
              </div>
              <span class="text-xs sm:text-sm font-medium text-gray-500">Afastados</span>
            </div>
            <p class="text-2xl sm:text-3xl font-bold text-gray-900">{{ stats?.colaboradoresAfastados || 0 }}</p>
            <p class="text-xs text-gray-400 mt-1">colaboradores</p>
          </div>

          <div class="bg-white rounded-xl border border-gray-200 p-4 sm:p-5 shadow-sm hover:shadow-md transition-shadow">
            <div class="flex items-center gap-3 mb-3">
              <div class="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Icon name="heroicons:arrow-path" class="text-purple-600" size="20" />
              </div>
              <span class="text-xs sm:text-sm font-medium text-gray-500">Rotatividade</span>
            </div>
            <p class="text-2xl sm:text-3xl font-bold text-gray-900">{{ stats?.taxaRotatividade || 0 }}%</p>
            <p class="text-xs text-gray-400 mt-1">últimos 12 meses</p>
          </div>

          <div class="bg-white rounded-xl border border-gray-200 p-4 sm:p-5 shadow-sm hover:shadow-md transition-shadow">
            <div class="flex items-center gap-3 mb-3">
              <div class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Icon name="heroicons:banknotes" class="text-blue-600" size="20" />
              </div>
              <span class="text-xs sm:text-sm font-medium text-gray-500">Folha Mensal</span>
            </div>
            <p class="text-2xl sm:text-3xl font-bold text-gray-900">{{ formatCurrency(stats?.custoFolhaMensal || 0) }}</p>
            <p class="text-xs text-gray-400 mt-1">custo total</p>
          </div>
        </div>

        <!-- Segunda linha de cards -->
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-5 mb-4 sm:mb-6 lg:mb-8">
          <div class="bg-white rounded-xl border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow">
            <div class="flex items-center gap-3">
              <div class="w-9 h-9 bg-sky-100 rounded-lg flex items-center justify-center">
                <Icon name="heroicons:users" class="text-sky-600" size="18" />
              </div>
              <div>
                <p class="text-xl font-bold text-gray-900">{{ stats?.totalUsuarios || 0 }}</p>
                <p class="text-xs text-gray-500">Usuários</p>
              </div>
            </div>
          </div>

          <div class="bg-white rounded-xl border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow">
            <div class="flex items-center gap-3">
              <div class="w-9 h-9 bg-cyan-100 rounded-lg flex items-center justify-center">
                <Icon name="heroicons:building-office" class="text-cyan-600" size="18" />
              </div>
              <div>
                <p class="text-xl font-bold text-gray-900">{{ stats?.totalDepartamentos || 0 }}</p>
                <p class="text-xs text-gray-500">Departamentos</p>
              </div>
            </div>
          </div>

          <div class="bg-white rounded-xl border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow">
            <div class="flex items-center gap-3">
              <div class="w-9 h-9 bg-pink-100 rounded-lg flex items-center justify-center">
                <Icon name="heroicons:briefcase" class="text-pink-600" size="18" />
              </div>
              <div>
                <p class="text-xl font-bold text-gray-900">{{ stats?.totalCargos || 0 }}</p>
                <p class="text-xs text-gray-500">Cargos</p>
              </div>
            </div>
          </div>

          <div class="bg-white rounded-xl border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow">
            <div class="flex items-center gap-3">
              <div class="w-9 h-9 bg-green-100 rounded-lg flex items-center justify-center">
                <Icon name="heroicons:user-plus" class="text-green-600" size="18" />
              </div>
              <div>
                <p class="text-xl font-bold text-gray-900">{{ stats?.novosNoMes || 0 }}</p>
                <p class="text-xs text-gray-500">Admissões</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Aniversariantes -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6 lg:mb-8">
          <!-- Aniversariantes do Mês -->
          <div class="bg-white rounded-xl border border-gray-200 p-4 sm:p-5 shadow-sm">
            <div class="flex items-center gap-2 mb-4">
              <div class="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                <Icon name="heroicons:cake" class="text-orange-500" size="18" />
              </div>
              <h3 class="font-semibold text-gray-900">Aniversariantes de {{ stats?.mesAtualNome || 'Dezembro' }}</h3>
            </div>
            <div v-if="stats?.aniversariantesMes?.length" class="space-y-2">
              <div v-for="pessoa in stats.aniversariantesMes.slice(0, 5)" :key="pessoa.id" class="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                <div class="flex items-center gap-2">
                  <div class="w-8 h-8 bg-gradient-to-br from-orange-400 to-pink-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                    {{ pessoa.nome?.charAt(0) }}
                  </div>
                  <span class="text-sm text-gray-700">{{ pessoa.nome }}</span>
                </div>
                <span class="text-xs text-gray-500 bg-white px-2 py-1 rounded">dia {{ pessoa.dia }}</span>
              </div>
            </div>
            <div v-else class="text-center py-6 text-gray-400">
              <Icon name="heroicons:cake" size="32" class="mx-auto mb-2 opacity-50" />
              <p class="text-sm">Nenhum aniversariante este mês</p>
            </div>
          </div>

          <!-- Próximo Mês -->
          <div class="bg-white rounded-xl border border-gray-200 p-4 sm:p-5 shadow-sm">
            <div class="flex items-center gap-2 mb-4">
              <div class="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <Icon name="heroicons:calendar" class="text-blue-500" size="18" />
              </div>
              <h3 class="font-semibold text-gray-900">Aniversariantes de {{ stats?.proximoMesNome || 'Janeiro' }}</h3>
            </div>
            <div v-if="stats?.aniversariantesProximoMes?.length" class="space-y-2">
              <div v-for="pessoa in stats.aniversariantesProximoMes.slice(0, 5)" :key="pessoa.id" class="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                <div class="flex items-center gap-2">
                  <div class="w-8 h-8 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                    {{ pessoa.nome?.charAt(0) }}
                  </div>
                  <span class="text-sm text-gray-700">{{ pessoa.nome }}</span>
                </div>
                <span class="text-xs text-gray-500 bg-white px-2 py-1 rounded">dia {{ pessoa.dia }}</span>
              </div>
            </div>
            <div v-else class="text-center py-6 text-gray-400">
              <Icon name="heroicons:calendar" size="32" class="mx-auto mb-2 opacity-50" />
              <p class="text-sm">Nenhum aniversariante</p>
            </div>
          </div>
        </div>

        <!-- Ações Rápidas -->
        <div class="bg-white rounded-xl border border-gray-200 p-4 sm:p-5 shadow-sm">
          <div class="flex items-center gap-2 mb-4">
            <div class="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
              <Icon name="heroicons:bolt" class="text-indigo-600" size="18" />
            </div>
            <h3 class="font-semibold text-gray-900">Ações Rápidas</h3>
          </div>
          <div class="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3">
            <NuxtLink to="/colaboradores" class="flex flex-col items-center gap-2 p-4 bg-gray-50 hover:bg-blue-50 rounded-xl transition-colors group">
              <div class="w-12 h-12 bg-blue-100 group-hover:bg-blue-200 rounded-xl flex items-center justify-center transition-colors">
                <Icon name="heroicons:user-group" class="text-blue-600" size="24" />
              </div>
              <span class="text-sm font-medium text-gray-700 group-hover:text-blue-700">Colaboradores</span>
            </NuxtLink>

            <NuxtLink to="/departamentos" class="flex flex-col items-center gap-2 p-4 bg-gray-50 hover:bg-emerald-50 rounded-xl transition-colors group">
              <div class="w-12 h-12 bg-emerald-100 group-hover:bg-emerald-200 rounded-xl flex items-center justify-center transition-colors">
                <Icon name="heroicons:building-office" class="text-emerald-600" size="24" />
              </div>
              <span class="text-sm font-medium text-gray-700 group-hover:text-emerald-700">Departamentos</span>
            </NuxtLink>

            <NuxtLink to="/cargos" class="flex flex-col items-center gap-2 p-4 bg-gray-50 hover:bg-purple-50 rounded-xl transition-colors group">
              <div class="w-12 h-12 bg-purple-100 group-hover:bg-purple-200 rounded-xl flex items-center justify-center transition-colors">
                <Icon name="heroicons:briefcase" class="text-purple-600" size="24" />
              </div>
              <span class="text-sm font-medium text-gray-700 group-hover:text-purple-700">Cargos</span>
            </NuxtLink>

            <NuxtLink to="/users" class="flex flex-col items-center gap-2 p-4 bg-gray-50 hover:bg-red-50 rounded-xl transition-colors group">
              <div class="w-12 h-12 bg-red-100 group-hover:bg-red-200 rounded-xl flex items-center justify-center transition-colors">
                <Icon name="heroicons:users" class="text-red-600" size="24" />
              </div>
              <span class="text-sm font-medium text-gray-700 group-hover:text-red-700">Usuários</span>
            </NuxtLink>

            <NuxtLink to="/solicitacoes" class="flex flex-col items-center gap-2 p-4 bg-gray-50 hover:bg-orange-50 rounded-xl transition-colors group">
              <div class="w-12 h-12 bg-orange-100 group-hover:bg-orange-200 rounded-xl flex items-center justify-center transition-colors">
                <Icon name="heroicons:document-text" class="text-orange-600" size="24" />
              </div>
              <span class="text-sm font-medium text-gray-700 group-hover:text-orange-700">Solicitações</span>
            </NuxtLink>

            <NuxtLink to="/ferias" class="flex flex-col items-center gap-2 p-4 bg-gray-50 hover:bg-yellow-50 rounded-xl transition-colors group">
              <div class="w-12 h-12 bg-yellow-100 group-hover:bg-yellow-200 rounded-xl flex items-center justify-center transition-colors">
                <Icon name="heroicons:sun" class="text-yellow-600" size="24" />
              </div>
              <span class="text-sm font-medium text-gray-700 group-hover:text-yellow-700">Férias</span>
            </NuxtLink>

            <NuxtLink to="/ponto" class="flex flex-col items-center gap-2 p-4 bg-gray-50 hover:bg-indigo-50 rounded-xl transition-colors group relative">
              <div class="w-12 h-12 bg-indigo-100 group-hover:bg-indigo-200 rounded-xl flex items-center justify-center transition-colors">
                <Icon name="heroicons:clock" class="text-indigo-600" size="24" />
              </div>
              <span class="text-sm font-medium text-gray-700 group-hover:text-indigo-700">Ponto</span>
              <div class="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
              <span class="text-xs text-gray-500 mt-1">{{ stats?.pontoAtual || '17:01:48' }}</span>
            </NuxtLink>

            <NuxtLink to="/folha-pagamento" class="flex flex-col items-center gap-2 p-4 bg-gray-50 hover:bg-teal-50 rounded-xl transition-colors group">
              <div class="w-12 h-12 bg-teal-100 group-hover:bg-teal-200 rounded-xl flex items-center justify-center transition-colors">
                <Icon name="heroicons:calculator" class="text-teal-600" size="24" />
              </div>
              <span class="text-sm font-medium text-gray-700 group-hover:text-teal-700">Folha Pagamento</span>
            </NuxtLink>

            <NuxtLink to="/documentos-rh" class="flex flex-col items-center gap-2 p-4 bg-gray-50 hover:bg-green-50 rounded-xl transition-colors group">
              <div class="w-12 h-12 bg-green-100 group-hover:bg-green-200 rounded-xl flex items-center justify-center transition-colors">
                <Icon name="heroicons:folder" class="text-green-600" size="24" />
              </div>
              <span class="text-sm font-medium text-gray-700 group-hover:text-green-700">Documentos RH</span>
            </NuxtLink>

            <NuxtLink to="/configuracoes" class="flex flex-col items-center gap-2 p-4 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors group">
              <div class="w-12 h-12 bg-gray-200 group-hover:bg-gray-300 rounded-xl flex items-center justify-center transition-colors">
                <Icon name="heroicons:cog-6-tooth" class="text-gray-600" size="24" />
              </div>
              <span class="text-sm font-medium text-gray-700">Configurações</span>
            </NuxtLink>

            <button @click="showAlteracoesDados = true" class="flex flex-col items-center gap-2 p-4 bg-gray-50 hover:bg-amber-50 rounded-xl transition-colors group">
              <div class="w-12 h-12 bg-amber-100 group-hover:bg-amber-200 rounded-xl flex items-center justify-center transition-colors relative">
                <Icon name="heroicons:credit-card" class="text-amber-600" size="24" />
                <div v-if="alteracoesPendentes > 0" class="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {{ alteracoesPendentes }}
                </div>
              </div>
              <span class="text-sm font-medium text-gray-700 group-hover:text-amber-700">Alterações Dados</span>
            </button>
          </div>
        </div>
      </template>
    </div>

    <!-- Modal Alterações de Dados -->
    <ModalAlteracoesDados v-model="showAlteracoesDados" @close="carregarAlteracoesPendentes" />
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: ['admin'], layout: false })

const { currentUser } = useAppAuth()
const loading = ref(true)
const stats = ref<any>(null)
const showAlteracoesDados = ref(false)
const alteracoesPendentes = ref(0)

const saudacao = computed(() => {
  const hora = new Date().getHours()
  return hora < 12 ? 'Bom dia' : hora < 18 ? 'Boa tarde' : 'Boa noite'
})

const dataAtual = computed(() => new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }))
const dataAtualCurta = computed(() => new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }))

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}

const alertaClass = (tipo: string) => ({
  'bg-yellow-50 border-yellow-200 text-yellow-800': tipo === 'warning',
  'bg-red-50 border-red-200 text-red-800': tipo === 'error',
  'bg-blue-50 border-blue-200 text-blue-800': tipo === 'info',
})

const alertaIcon = (tipo: string) => tipo === 'warning' ? 'heroicons:exclamation-triangle' : tipo === 'error' ? 'heroicons:x-circle' : 'heroicons:information-circle'

const carregarAlteracoesPendentes = async () => {
  try {
    const data = await $fetch('/api/admin/alteracoes-dados/stats')
    alteracoesPendentes.value = data.pendentes || 0
  } catch (e) {
    console.error('Erro ao carregar alterações pendentes:', e)
  }
}

onMounted(async () => {
  try {
    const dashResponse = await $fetch<{ success: boolean; data: any }>('/api/dashboard/stats')
    if (dashResponse.success) stats.value = dashResponse.data
    await carregarAlteracoesPendentes()
  } catch (e) { console.error(e) }
  finally { loading.value = false }
})
</script>
