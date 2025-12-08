<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <header class="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div class="max-w-7xl mx-auto px-8 py-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-4">
            <NuxtLink to="/configuracoes" class="w-10 h-10 bg-red-700 rounded-lg flex items-center justify-center hover:bg-red-800 transition-colors">
              <Icon name="heroicons:arrow-left" class="text-white" size="20" />
            </NuxtLink>
            <div>
              <h1 class="text-xl font-bold text-gray-800">Backup e Segurança</h1>
              <p class="text-sm text-gray-500">Backups automáticos, logs de acesso e auditoria</p>
            </div>
          </div>
          <div class="flex items-center gap-3">
            <button @click="criarBackupManual" :disabled="criandoBackup" class="btn-secondary">
              <Icon :name="criandoBackup ? 'heroicons:arrow-path' : 'heroicons:arrow-down-tray'" :class="{ 'animate-spin': criandoBackup }" class="mr-2" />
              Backup Manual
            </button>
            <UserProfileDropdown theme="admin" />
          </div>
        </div>
      </div>
    </header>

    <!-- Content -->
    <div class="max-w-7xl mx-auto p-8">
      <!-- Stats Cards -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div class="card bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <div class="flex items-center gap-3">
            <Icon name="heroicons:server" size="32" class="opacity-80" />
            <div>
              <p class="text-2xl font-bold">{{ stats.backups.total }}</p>
              <p class="text-sm opacity-80">Backups</p>
            </div>
          </div>
        </div>
        <div class="card bg-gradient-to-br from-green-500 to-green-600 text-white">
          <div class="flex items-center gap-3">
            <Icon name="heroicons:user-group" size="32" class="opacity-80" />
            <div>
              <p class="text-2xl font-bold">{{ stats.sessoes.ativas }}</p>
              <p class="text-sm opacity-80">Sessões Ativas</p>
            </div>
          </div>
        </div>
        <div class="card bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <div class="flex items-center gap-3">
            <Icon name="heroicons:document-text" size="32" class="opacity-80" />
            <div>
              <p class="text-2xl font-bold">{{ stats.logs.total }}</p>
              <p class="text-sm opacity-80">Logs (30d)</p>
            </div>
          </div>
        </div>
        <div class="card bg-gradient-to-br from-amber-500 to-amber-600 text-white">
          <div class="flex items-center gap-3">
            <Icon name="heroicons:shield-check" size="32" class="opacity-80" />
            <div>
              <p class="text-2xl font-bold">{{ stats.auditoria.total }}</p>
              <p class="text-sm opacity-80">Auditorias (30d)</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Tabs -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
        <div class="flex border-b border-gray-200 overflow-x-auto">
          <button
            @click="abaAtiva = 'backup'"
            class="px-6 py-3 font-medium transition-colors whitespace-nowrap"
            :class="abaAtiva === 'backup' ? 'text-red-700 border-b-2 border-red-700' : 'text-gray-500 hover:text-gray-700'"
          >
            <Icon name="heroicons:server" class="inline mr-2" />
            Backup
          </button>
          <button
            @click="abaAtiva = 'politicas'"
            class="px-6 py-3 font-medium transition-colors whitespace-nowrap"
            :class="abaAtiva === 'politicas' ? 'text-red-700 border-b-2 border-red-700' : 'text-gray-500 hover:text-gray-700'"
          >
            <Icon name="heroicons:shield-check" class="inline mr-2" />
            Políticas de Segurança
          </button>
          <button
            @click="abaAtiva = 'logs'"
            class="px-6 py-3 font-medium transition-colors whitespace-nowrap"
            :class="abaAtiva === 'logs' ? 'text-red-700 border-b-2 border-red-700' : 'text-gray-500 hover:text-gray-700'"
          >
            <Icon name="heroicons:document-text" class="inline mr-2" />
            Logs de Acesso
          </button>
          <button
            @click="abaAtiva = 'auditoria'"
            class="px-6 py-3 font-medium transition-colors whitespace-nowrap"
            :class="abaAtiva === 'auditoria' ? 'text-red-700 border-b-2 border-red-700' : 'text-gray-500 hover:text-gray-700'"
          >
            <Icon name="heroicons:clipboard-document-list" class="inline mr-2" />
            Auditoria
          </button>
        </div>
      </div>

      <!-- Placeholder para conteúdo das abas -->
      <div class="text-center py-12 text-gray-500">
        Selecione uma aba acima
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: ['admin'],
  layout: false,
})

const abaAtiva = ref('backup')
const salvando = ref(false)
const criandoBackup = ref(false)

// Stats
const stats = ref({
  backups: { total: 0, sucesso: 0, erro: 0, ultimo: null },
  sessoes: { ativas: 0, total: 0 },
  logs: { total: 0, sucessos: 0, erros: 0, logins: 0 },
  auditoria: { total: 0, creates: 0, updates: 0, deletes: 0 },
  tentativas_login: { total: 0, sucesso: 0, falhas: 0 },
})

// Configurações de backup
const configBackup = ref({
  backup_automatico: true,
  frequencia: 'diario',
  horario_backup: '02:00:00',
  dia_semana: 1,
  dia_mes: 1,
  manter_backups_dias: 30,
  manter_backups_quantidade: 10,
  incluir_colaboradores: true,
  incluir_documentos: true,
  incluir_folha: true,
  incluir_ponto: true,
  incluir_ferias: true,
  incluir_configuracoes: true,
  notificar_backup_sucesso: false,
  notificar_backup_erro: true,
  emails_notificacao: [],
  criptografar_backup: true,
})

// Políticas de segurança
const politicas = ref({
  senha_minimo_caracteres: 8,
  senha_requer_maiuscula: true,
  senha_requer_minuscula: true,
  senha_requer_numero: true,
  senha_requer_especial: true,
  senha_expira_dias: 90,
  senha_historico: 5,
  max_tentativas_login: 5,
  bloqueio_temporario_minutos: 30,
  sessao_expira_horas: 8,
  logout_automatico_inatividade: true,
  inatividade_minutos: 30,
  requer_2fa: false,
  permitir_multiplas_sessoes: true,
  registrar_todos_acessos: true,
  registrar_mudancas_dados: true,
  manter_logs_dias: 90,
  termo_uso_obrigatorio: true,
})

// Dados
const backups = ref<any[]>([])
const logsAcesso = ref<any[]>([])
const auditorias = ref<any[]>([])

// Carregar dados
const carregarStats = async () => {
  try {
    const data = await $fetch('/api/seguranca/stats')
    stats.value = data as typeof stats.value
  } catch (error) {
    console.error('Erro ao carregar stats:', error)
  }
}

const carregarConfigBackup = async () => {
  try {
    const data = await $fetch('/api/seguranca/config-backup')
    if (data) {
      configBackup.value = { ...configBackup.value, ...data }
    }
  } catch (error) {
    console.error('Erro ao carregar config backup:', error)
  }
}

const carregarPoliticas = async () => {
  try {
    const data = await $fetch('/api/seguranca/politicas')
    if (data) {
      politicas.value = { ...politicas.value, ...data }
    }
  } catch (error) {
    console.error('Erro ao carregar políticas:', error)
  }
}

const carregarBackups = async () => {
  try {
    const data = await $fetch('/api/seguranca/backups')
    backups.value = data as any[]
  } catch (error) {
    console.error('Erro ao carregar backups:', error)
    backups.value = []
  }
}

const carregarLogsAcesso = async () => {
  try {
    const data = await $fetch('/api/seguranca/logs-acesso', {
      params: { limit: 100 },
    })
    logsAcesso.value = data as any[]
  } catch (error) {
    console.error('Erro ao carregar logs:', error)
    logsAcesso.value = []
  }
}

const carregarAuditorias = async () => {
  try {
    const data = await $fetch('/api/seguranca/auditoria', {
      params: { limit: 100 },
    })
    auditorias.value = data as any[]
  } catch (error) {
    console.error('Erro ao carregar auditorias:', error)
    auditorias.value = []
  }
}

// Salvar configurações
const salvarConfigBackup = async () => {
  salvando.value = true
  try {
    await $fetch('/api/seguranca/config-backup', {
      method: 'PUT',
      body: configBackup.value,
    })
    alert('Configurações de backup salvas!')
  } catch (error) {
    alert('Erro ao salvar configurações')
  } finally {
    salvando.value = false
  }
}

const salvarPoliticas = async () => {
  salvando.value = true
  try {
    await $fetch('/api/seguranca/politicas', {
      method: 'PUT',
      body: politicas.value,
    })
    alert('Políticas de segurança salvas!')
  } catch (error) {
    alert('Erro ao salvar políticas')
  } finally {
    salvando.value = false
  }
}

// Criar backup manual
const criarBackupManual = async () => {
  if (!confirm('Criar backup manual agora?')) return

  criandoBackup.value = true
  try {
    await $fetch('/api/seguranca/backup-manual', { method: 'POST' })
    alert('Backup iniciado com sucesso!')
    await carregarBackups()
    await carregarStats()
  } catch (error) {
    alert('Erro ao criar backup')
  } finally {
    criandoBackup.value = false
  }
}

// Formatar data
const formatarData = (data: string) => {
  return new Date(data).toLocaleString('pt-BR')
}

// Formatar tamanho
const formatarTamanho = (bytes: number) => {
  if (!bytes) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}

// Carregar ao montar
onMounted(() => {
  carregarStats()
  carregarConfigBackup()
  carregarPoliticas()
  carregarBackups()
})

// Carregar dados quando mudar de aba
watch(abaAtiva, (nova) => {
  if (nova === 'logs') carregarLogsAcesso()
  if (nova === 'auditoria') carregarAuditorias()
})
</script>
