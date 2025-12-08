<template>
  <div class="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-6 mb-8">
    <div class="flex items-center justify-between mb-4">
      <div class="flex items-center gap-3">
        <span class="text-2xl">⚡</span>
        <h3 class="text-lg font-semibold text-white">Últimas Atividades</h3>
      </div>
      <button @click="recarregar" class="text-gray-400 hover:text-white transition-colors" title="Recarregar">
        <Icon name="heroicons:arrow-path" size="20" :class="{ 'animate-spin': carregando }" />
      </button>
    </div>

    <div v-if="carregando && !atividades.length" class="text-center py-8">
      <Icon name="heroicons:arrow-path" class="mx-auto mb-2 animate-spin text-gray-400" size="32" />
      <p class="text-gray-500">Carregando atividades...</p>
    </div>

    <div v-else-if="atividades?.length" class="space-y-3 max-h-[500px] overflow-y-auto pr-2">
      <div 
        v-for="atividade in atividades" 
        :key="atividade.id" 
        class="flex items-start justify-between p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
      >
        <div class="flex items-start gap-4 flex-1">
          <div 
            class="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0"
            :class="getRoleColor(atividade.role)"
          >
            {{ getInitials(atividade.nome) }}
          </div>
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 mb-1">
              <p class="text-gray-200 font-medium truncate">{{ atividade.nome }}</p>
              <span :title="getRoleLabel(atividade.role)">{{ getRoleIcon(atividade.role) }}</span>
              <span 
                class="px-2 py-0.5 rounded-full text-xs font-medium"
                :class="getTipoAcaoClass(atividade.tipo_acao)"
              >
                {{ getTipoAcaoLabel(atividade.tipo_acao) }}
              </span>
            </div>
            <p class="text-gray-300 text-sm mb-1">{{ atividade.descricao }}</p>
            <div class="flex items-center gap-3 text-xs text-gray-500">
              <span class="flex items-center gap-1">
                <Icon :name="getModuloIcon(atividade.modulo)" size="14" />
                {{ getModuloLabel(atividade.modulo) }}
              </span>
              <span>•</span>
              <span>{{ formatRelativeTime(atividade.created_at) }}</span>
            </div>
          </div>
        </div>
        <div class="text-right flex-shrink-0 ml-4">
          <p class="text-gray-500 text-xs">{{ formatDateTime(atividade.created_at) }}</p>
        </div>
      </div>
    </div>

    <div v-else class="text-center py-8 text-gray-500">
      <Icon name="heroicons:clock" class="mx-auto mb-2 opacity-50" size="32" />
      <p>Nenhuma atividade recente</p>
    </div>
  </div>
</template>

<script setup lang="ts">
const { buscarAtividades } = useAtividades()

const atividades = ref<any[]>([])
const carregando = ref(false)

const carregar = async () => {
  carregando.value = true
  const result = await buscarAtividades(15)
  if (result.success) {
    atividades.value = result.data
  }
  carregando.value = false
}

const recarregar = () => {
  carregar()
}

onMounted(() => {
  carregar()
  // Recarregar a cada 30 segundos
  setInterval(carregar, 30000)
})

const getInitials = (nome: string) => {
  if (!nome) return '?'
  const names = nome.split(' ')
  return names.length === 1 ? names[0].substring(0, 2).toUpperCase() : (names[0][0] + names[names.length - 1][0]).toUpperCase()
}

const getRoleColor = (role: string) => {
  const colors: Record<string, string> = {
    admin: 'bg-red-600',
    gestor: 'bg-purple-600',
    funcionario: 'bg-blue-600'
  }
  return colors[role] || 'bg-gray-600'
}

const getRoleIcon = (role: string) => {
  const icons: Record<string, string> = {
    admin: '👑',
    gestor: '⭐',
    funcionario: '👤'
  }
  return icons[role] || '👤'
}

const getRoleLabel = (role: string) => {
  const labels: Record<string, string> = {
    admin: 'Administrador',
    gestor: 'Gestor',
    funcionario: 'Funcionário'
  }
  return labels[role] || role
}

const getTipoAcaoClass = (tipo: string) => {
  const classes: Record<string, string> = {
    login: 'bg-green-500/20 text-green-300',
    logout: 'bg-gray-500/20 text-gray-300',
    create: 'bg-blue-500/20 text-blue-300',
    update: 'bg-yellow-500/20 text-yellow-300',
    delete: 'bg-red-500/20 text-red-300',
    download: 'bg-purple-500/20 text-purple-300',
    upload: 'bg-indigo-500/20 text-indigo-300',
    approve: 'bg-emerald-500/20 text-emerald-300',
    reject: 'bg-orange-500/20 text-orange-300'
  }
  return classes[tipo] || 'bg-gray-500/20 text-gray-300'
}

const getTipoAcaoLabel = (tipo: string) => {
  const labels: Record<string, string> = {
    login: 'Login',
    logout: 'Logout',
    create: 'Criou',
    update: 'Alterou',
    delete: 'Excluiu',
    download: 'Download',
    upload: 'Upload',
    approve: 'Aprovou',
    reject: 'Rejeitou'
  }
  return labels[tipo] || tipo
}

const getModuloIcon = (modulo: string) => {
  const icons: Record<string, string> = {
    autenticacao: 'heroicons:lock-closed',
    colaboradores: 'heroicons:users',
    ferias: 'heroicons:calendar',
    documentos: 'heroicons:document-text',
    ponto: 'heroicons:clock',
    folha: 'heroicons:currency-dollar',
    solicitacoes: 'heroicons:inbox',
    comunicados: 'heroicons:megaphone',
    configuracoes: 'heroicons:cog-6-tooth',
    relatorios: 'heroicons:chart-bar',
    importacao: 'heroicons:arrow-down-tray',
    exportacao: 'heroicons:arrow-up-tray'
  }
  return icons[modulo] || 'heroicons:document'
}

const getModuloLabel = (modulo: string) => {
  const labels: Record<string, string> = {
    autenticacao: 'Autenticação',
    colaboradores: 'Colaboradores',
    ferias: 'Férias',
    documentos: 'Documentos',
    ponto: 'Ponto',
    folha: 'Folha de Pagamento',
    solicitacoes: 'Solicitações',
    comunicados: 'Comunicados',
    configuracoes: 'Configurações',
    relatorios: 'Relatórios',
    importacao: 'Importação',
    exportacao: 'Exportação'
  }
  return labels[modulo] || modulo
}

const formatRelativeTime = (dateStr: string) => {
  if (!dateStr) return ''
  const diffMs = Date.now() - new Date(dateStr).getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)
  if (diffMins < 1) return 'agora mesmo'
  if (diffMins < 60) return `há ${diffMins} min`
  if (diffHours < 24) return `há ${diffHours}h`
  if (diffDays === 1) return 'ontem'
  if (diffDays < 7) return `há ${diffDays} dias`
  return new Date(dateStr).toLocaleDateString('pt-BR')
}

const formatDateTime = (dateStr: string) => dateStr ? new Date(dateStr).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) : ''
</script>
