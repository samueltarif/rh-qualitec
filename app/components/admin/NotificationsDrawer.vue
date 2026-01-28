<template>
  <!-- Drawer de Notificações Simplificado -->
  <div v-if="isOpen" class="fixed inset-0 z-[9999]">
    <!-- Overlay -->
    <div 
      class="absolute inset-0 bg-black bg-opacity-50" 
      @click="closeDrawer"
    ></div>
    
    <!-- Drawer Panel -->
    <div class="absolute right-0 top-0 h-full w-96 bg-white shadow-xl flex flex-col">
      <!-- Header -->
      <div class="p-4 border-b border-gray-200 bg-white">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <span class="text-blue-600 text-lg">🔔</span>
            </div>
            <div>
              <h3 class="text-lg font-semibold text-gray-900">Notificações</h3>
              <p class="text-sm text-gray-500">
                {{ totalNotificacoes }} notificação{{ totalNotificacoes !== 1 ? 'ões' : '' }}
                {{ totalNaoLidas > 0 ? `(${totalNaoLidas} não lida${totalNaoLidas !== 1 ? 's' : ''})` : '' }}
              </p>
            </div>
          </div>
          <button 
            @click="closeDrawer"
            class="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>
        
        <!-- Filtros e Ações -->
        <div class="mt-4 flex flex-wrap items-center gap-3">
          <select 
            v-model="filtroTipo" 
            @change="aplicarFiltros"
            class="text-sm border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
          >
            <option value="">Todos os tipos</option>
            <option value="info">Informações</option>
            <option value="success">Sucessos</option>
            <option value="warning">Avisos</option>
            <option value="error">Erros</option>
          </select>
          
          <select 
            v-model="filtroOrigem" 
            @change="aplicarFiltros"
            class="text-sm border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
          >
            <option value="">Todas as origens</option>
            <option value="login">Login</option>
            <option value="alteracao_dados">Alteração de Dados</option>
            <option value="geracao_holerites">Holerites</option>
            <option value="visualizacao_holerite">Visualização</option>
            <option value="download_holerite">Downloads</option>
            <option value="novo_funcionario">Novos Funcionários</option>
          </select>
          
          <button 
            v-if="totalNaoLidas > 0"
            @click="marcarTodasComoLidas"
            :disabled="isMarkingAllRead"
            class="text-sm bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            {{ isMarkingAllRead ? 'Marcando...' : 'Marcar todas como lidas' }}
          </button>
        </div>
      </div>
      
      <!-- Content - Scrollável -->
      <div class="flex-1 overflow-y-auto overscroll-contain">
        <!-- Loading State -->
        <div v-if="isLoading" class="p-8 text-center">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p class="text-sm text-gray-500 mt-3">Carregando notificações...</p>
        </div>
        
        <!-- Empty State -->
        <div v-else-if="!notificacoesFiltradas || notificacoesFiltradas.length === 0" class="p-8 text-center">
          <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span class="text-gray-400 text-2xl">🔔</span>
          </div>
          <h3 class="text-lg font-medium text-gray-900 mb-2">
            {{ filtroTipo || filtroOrigem ? 'Nenhuma notificação encontrada' : 'Nenhuma notificação' }}
          </h3>
          <p class="text-sm text-gray-500">
            {{ filtroTipo || filtroOrigem ? 'Tente ajustar os filtros acima' : 'Não há notificações no momento' }}
          </p>
        </div>
        
        <!-- Notificações -->
        <div v-else class="divide-y divide-gray-100">
          <div 
            v-for="notificacao in notificacoesFiltradas" 
            :key="notificacao.id"
            class="p-4 hover:bg-gray-50 transition-colors cursor-pointer group"
            :class="{ 'bg-blue-50': !notificacao.lida }"
            @click="marcarComoLida(notificacao)"
          >
            <div class="flex items-start gap-3">
              <!-- Ícone -->
              <div 
                class="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                :class="getNotificationStyle(notificacao.tipo).bg"
              >
                <span :class="getNotificationStyle(notificacao.tipo).text" class="text-base">
                  {{ getNotificationIcon(notificacao.tipo) }}
                </span>
              </div>
              
              <!-- Conteúdo -->
              <div class="flex-1 min-w-0">
                <div class="flex items-start justify-between gap-3">
                  <div class="flex-1">
                    <h4 class="text-sm font-semibold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
                      {{ notificacao.titulo }}
                    </h4>
                    <p class="text-xs text-gray-700 mb-2 leading-relaxed line-clamp-3">
                      {{ notificacao.mensagem }}
                    </p>
                    
                    <!-- Detalhes das alterações (se disponível) -->
                    <div v-if="notificacao.dados?.alteracoes_detalhadas && notificacao.dados.alteracoes_detalhadas.length > 0" class="mt-2 p-2 bg-gray-50 rounded-lg">
                      <h5 class="text-xs font-semibold text-gray-700 mb-1">Alterações:</h5>
                      <ul class="text-xs text-gray-600 space-y-0.5">
                        <li v-for="(alteracao, index) in notificacao.dados.alteracoes_detalhadas.slice(0, 3)" :key="index" class="flex items-start gap-1">
                          <span class="text-blue-500 mt-0.5 text-xs">•</span>
                          <span class="line-clamp-1">{{ alteracao }}</span>
                        </li>
                        <li v-if="notificacao.dados.alteracoes_detalhadas.length > 3" class="text-xs text-gray-500 italic">
                          +{{ notificacao.dados.alteracoes_detalhadas.length - 3 }} mais...
                        </li>
                      </ul>
                    </div>
                    
                    <!-- Metadados -->
                    <div class="flex items-center gap-3 text-xs text-gray-500 mt-2">
                      <span class="flex items-center gap-1">
                        <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                        </svg>
                        {{ formatarDataCompleta(notificacao.created_at) }}
                      </span>
                      
                      <span v-if="notificacao.origem" class="flex items-center gap-1">
                        <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"/>
                        </svg>
                        {{ formatarOrigem(notificacao.origem) }}
                      </span>
                      
                      <span v-if="notificacao.importante" class="flex items-center gap-1 text-red-600">
                        <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"/>
                        </svg>
                        Importante
                      </span>
                    </div>
                  </div>
                  
                  <!-- Status e Ações -->
                  <div class="flex items-center gap-2 flex-shrink-0">
                    <div v-if="!notificacao.lida" 
                         class="w-2 h-2 rounded-full"
                         :class="getNotificationStyle(notificacao.tipo).dot">
                    </div>
                    
                    <button 
                      v-if="notificacao.acao_url"
                      @click.stop="navegarPara(notificacao.acao_url)"
                      class="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full hover:bg-blue-200 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      Ver
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Footer - Fixo no fundo -->
      <div class="flex-shrink-0 p-4 border-t border-gray-200 bg-gray-50">
        <div class="flex items-center justify-between text-sm text-gray-500">
          <span>
            {{ notificacoesFiltradas?.length || 0 }} de {{ totalNotificacoes }} notificações
          </span>
          <button 
            @click="refreshNotifications"
            :disabled="isLoading"
            class="text-blue-600 hover:text-blue-700 disabled:opacity-50 focus:outline-none focus:underline"
          >
            {{ isLoading ? 'Carregando...' : 'Atualizar' }}
          </button>
        </div>
      </div>
    </div>
  </div>
        <!-- Header - Fixo no topo -->
        <div class="flex-shrink-0 p-6 border-b border-gray-200 bg-white">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <span class="text-blue-600 text-lg">🔔</span>
              </div>
              <div>
                <h2 :id="headerId" class="text-xl font-bold text-gray-900">
                  Notificações do Sistema
                </h2>
                <p class="text-sm text-gray-500">
                  {{ totalNotificacoes }} notificação{{ totalNotificacoes !== 1 ? 'ões' : '' }}
                  {{ totalNaoLidas > 0 ? `(${totalNaoLidas} não lida${totalNaoLidas !== 1 ? 's' : ''})` : '' }}
                </p>
              </div>
            </div>
            
            <button 
              @click="closeDrawer"
              class="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Fechar painel de notificações"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>
          
          <!-- Filtros e Ações -->
          <div class="mt-4 flex flex-wrap items-center gap-3">
            <select 
              v-model="filtroTipo" 
              @change="aplicarFiltros"
              class="text-sm border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
            >
              <option value="">Todos os tipos</option>
              <option value="info">Informações</option>
              <option value="success">Sucessos</option>
              <option value="warning">Avisos</option>
              <option value="error">Erros</option>
            </select>
            
            <select 
              v-model="filtroOrigem" 
              @change="aplicarFiltros"
              class="text-sm border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
            >
              <option value="">Todas as origens</option>
              <option value="login">Login</option>
              <option value="alteracao_dados">Alteração de Dados</option>
              <option value="geracao_holerites">Holerites</option>
              <option value="visualizacao_holerite">Visualização</option>
              <option value="download_holerite">Downloads</option>
              <option value="novo_funcionario">Novos Funcionários</option>
            </select>
            
            <button 
              v-if="totalNaoLidas > 0"
              @click="marcarTodasComoLidas"
              :disabled="isMarkingAllRead"
              class="text-sm bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              {{ isMarkingAllRead ? 'Marcando...' : 'Marcar todas como lidas' }}
            </button>
          </div>
        </div>
        
        <!-- Content - Scrollável -->
        <div class="flex-1 overflow-y-auto overscroll-contain">
          <!-- Loading State -->
          <div v-if="isLoading" class="p-8 text-center">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p class="text-sm text-gray-500 mt-3">Carregando notificações...</p>
          </div>
          
          <!-- Empty State -->
          <div v-else-if="!notificacoesFiltradas || notificacoesFiltradas.length === 0" class="p-8 text-center">
            <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span class="text-gray-400 text-2xl">🔔</span>
            </div>
            <h3 class="text-lg font-medium text-gray-900 mb-2">
              {{ filtroTipo || filtroOrigem ? 'Nenhuma notificação encontrada' : 'Nenhuma notificação' }}
            </h3>
            <p class="text-sm text-gray-500">
              {{ filtroTipo || filtroOrigem ? 'Tente ajustar os filtros acima' : 'Não há notificações no momento' }}
            </p>
          </div>
          
          <!-- Notificações -->
          <div v-else class="divide-y divide-gray-100">
            <div 
              v-for="notificacao in notificacoesFiltradas" 
              :key="notificacao.id"
              class="p-4 hover:bg-gray-50 transition-colors cursor-pointer group"
              :class="{ 'bg-blue-50': !notificacao.lida }"
              @click="marcarComoLida(notificacao)"
            >
              <div class="flex items-start gap-3">
                <!-- Ícone -->
                <div 
                  class="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                  :class="getNotificationStyle(notificacao.tipo).bg"
                >
                  <span :class="getNotificationStyle(notificacao.tipo).text" class="text-base">
                    {{ getNotificationIcon(notificacao.tipo) }}
                  </span>
                </div>
                
                <!-- Conteúdo -->
                <div class="flex-1 min-w-0">
                  <div class="flex items-start justify-between gap-3">
                    <div class="flex-1">
                      <h4 class="text-sm font-semibold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
                        {{ notificacao.titulo }}
                      </h4>
                      <p class="text-xs text-gray-700 mb-2 leading-relaxed line-clamp-3">
                        {{ notificacao.mensagem }}
                      </p>
                      
                      <!-- Detalhes das alterações (se disponível) -->
                      <div v-if="notificacao.dados?.alteracoes_detalhadas && notificacao.dados.alteracoes_detalhadas.length > 0" class="mt-2 p-2 bg-gray-50 rounded-lg">
                        <h5 class="text-xs font-semibold text-gray-700 mb-1">Alterações:</h5>
                        <ul class="text-xs text-gray-600 space-y-0.5">
                          <li v-for="(alteracao, index) in notificacao.dados.alteracoes_detalhadas.slice(0, 3)" :key="index" class="flex items-start gap-1">
                            <span class="text-blue-500 mt-0.5 text-xs">•</span>
                            <span class="line-clamp-1">{{ alteracao }}</span>
                          </li>
                          <li v-if="notificacao.dados.alteracoes_detalhadas.length > 3" class="text-xs text-gray-500 italic">
                            +{{ notificacao.dados.alteracoes_detalhadas.length - 3 }} mais...
                          </li>
                        </ul>
                      </div>
                      
                      <!-- Metadados -->
                      <div class="flex items-center gap-3 text-xs text-gray-500 mt-2">
                        <span class="flex items-center gap-1">
                          <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                          </svg>
                          {{ formatarDataCompleta(notificacao.created_at) }}
                        </span>
                        
                        <span v-if="notificacao.origem" class="flex items-center gap-1">
                          <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"/>
                          </svg>
                          {{ formatarOrigem(notificacao.origem) }}
                        </span>
                        
                        <span v-if="notificacao.importante" class="flex items-center gap-1 text-red-600">
                          <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"/>
                          </svg>
                          Importante
                        </span>
                      </div>
                    </div>
                    
                    <!-- Status e Ações -->
                    <div class="flex items-center gap-2 flex-shrink-0">
                      <div v-if="!notificacao.lida" 
                           class="w-2 h-2 rounded-full"
                           :class="getNotificationStyle(notificacao.tipo).dot">
                      </div>
                      
                      <button 
                        v-if="notificacao.acao_url"
                        @click.stop="navegarPara(notificacao.acao_url)"
                        class="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full hover:bg-blue-200 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        Ver
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Footer - Fixo no fundo -->
        <div class="flex-shrink-0 p-4 border-t border-gray-200 bg-gray-50">
          <div class="flex items-center justify-between text-sm text-gray-500">
            <span>
              {{ notificacoesFiltradas?.length || 0 }} de {{ totalNotificacoes }} notificações
            </span>
            <button 
              @click="refreshNotifications"
              :disabled="isLoading"
              class="text-blue-600 hover:text-blue-700 disabled:opacity-50 focus:outline-none focus:underline"
            >
              {{ isLoading ? 'Carregando...' : 'Atualizar' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </ClientOnly> -->
</template>

<script setup lang="ts">
interface Props {
  isOpen: boolean
}

interface Emits {
  (e: 'close'): void
  (e: 'notification-read', notificationId: string): void
  (e: 'all-notifications-read'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// Estados
const filtroTipo = ref('')
const filtroOrigem = ref('')
const todasNotificacoes = ref<any[]>([])
const notificacoesFiltradas = ref<any[]>([])
const isLoading = ref(false)
const isMarkingAllRead = ref(false)

// IDs únicos para acessibilidade
const headerId = `notifications-header-${Math.random().toString(36).substring(2, 9)}`

// Integração com o sistema de contagem
const { refresh: refreshCount, decrementCount } = useNotificationCount()

// Buscar notificações
const { data: response, pending: loadingNotifications, refresh } = await useLazyFetch('/api/notificacoes', {
  query: { limite: 100 },
  default: () => ({ notificacoes: [], success: false }),
  server: false
})

// Computeds
const totalNotificacoes = computed(() => todasNotificacoes.value.length)
const totalNaoLidas = computed(() => todasNotificacoes.value.filter((n: any) => !n.lida).length)

// Watchers
watch(() => props.isOpen, (isOpen, oldValue) => {
  console.log('🔔 [DRAWER] === PROPS WATCHER ===')
  console.log('🔔 [DRAWER] Props isOpen mudou:', oldValue, '->', isOpen)
  console.trace('🔔 [DRAWER] Stack trace da mudança de props')
  
  if (isOpen) {
    console.log('🔔 [DRAWER] Abrindo drawer...')
    carregarNotificacoes()
    // Prevenir scroll do body
    document.body.style.overflow = 'hidden'
    // Focus trap simples
    nextTick(() => {
      const firstFocusable = document.querySelector('.notifications-drawer-container button')
      if (firstFocusable) {
        (firstFocusable as HTMLElement).focus()
      }
    })
  } else {
    console.log('🔔 [DRAWER] Fechando drawer...')
    // Restaurar scroll do body
    document.body.style.overflow = ''
  }
})

watch(response, (newResponse) => {
  if (newResponse?.success) {
    todasNotificacoes.value = newResponse.notificacoes || []
    aplicarFiltros()
  }
}, { immediate: true })

watch(loadingNotifications, (loading) => {
  isLoading.value = loading
})

// Métodos
const carregarNotificacoes = async () => {
  await refresh()
}

const refreshNotifications = async () => {
  await carregarNotificacoes()
  await refreshCount()
}

const aplicarFiltros = () => {
  let filtradas = [...todasNotificacoes.value]
  
  if (filtroTipo.value) {
    filtradas = filtradas.filter((n: any) => n.tipo === filtroTipo.value)
  }
  
  if (filtroOrigem.value) {
    filtradas = filtradas.filter((n: any) => n.origem === filtroOrigem.value)
  }
  
  notificacoesFiltradas.value = filtradas
}

const marcarComoLida = async (notificacao: any) => {
  if (notificacao.lida) return
  
  try {
    await $fetch(`/api/notificacoes/${notificacao.id}/marcar-lida`, {
      method: 'PATCH'
    })
    
    // Atualizar localmente
    notificacao.lida = true
    notificacao.data_leitura = new Date().toISOString()
    
    // Decrementar contagem global
    decrementCount(1)
    
    // Emitir evento
    emit('notification-read', notificacao.id)
    
  } catch (error) {
    console.error('Erro ao marcar notificação como lida:', error)
  }
}

const marcarTodasComoLidas = async () => {
  const naoLidas = notificacoesFiltradas.value.filter((n: any) => !n.lida)
  
  if (naoLidas.length === 0) return
  
  try {
    isMarkingAllRead.value = true
    
    // Marcar todas as não lidas
    await Promise.all(
      naoLidas.map((notificacao: any) => 
        $fetch(`/api/notificacoes/${notificacao.id}/marcar-lida`, {
          method: 'PATCH'
        })
      )
    )
    
    // Atualizar localmente
    naoLidas.forEach((notificacao: any) => {
      notificacao.lida = true
      notificacao.data_leitura = new Date().toISOString()
    })
    
    // Decrementar contagem global
    decrementCount(naoLidas.length)
    
    // Emitir evento
    emit('all-notifications-read')
    
  } catch (error) {
    console.error('Erro ao marcar todas como lidas:', error)
  } finally {
    isMarkingAllRead.value = false
  }
}

const navegarPara = (url: string) => {
  closeDrawer()
  navigateTo(url)
}

const closeDrawer = () => {
  emit('close')
}

// Funções auxiliares
const getNotificationIcon = (tipo: string) => {
  const icons = {
    info: 'ℹ️',
    success: '✅',
    warning: '⚠️',
    error: '🚨',
    sistema: '⚙️',
    login: '🔐',
    alteracao_dados: '✏️',
    novo_funcionario: '👤',
    geracao_holerites: '💰',
    envio_email: '📧',
    login_falhado: '🚨',
    erro_sistema: '💥',
    visualizacao_holerite: '👁️',
    download_holerite: '📥'
  }
  return icons[tipo as keyof typeof icons] || 'ℹ️'
}

const getNotificationStyle = (tipo: string) => {
  const styles = {
    info: { bg: 'bg-blue-100', text: 'text-blue-600', dot: 'bg-blue-500' },
    success: { bg: 'bg-green-100', text: 'text-green-600', dot: 'bg-green-500' },
    warning: { bg: 'bg-yellow-100', text: 'text-yellow-600', dot: 'bg-yellow-500' },
    error: { bg: 'bg-red-100', text: 'text-red-600', dot: 'bg-red-500' },
    sistema: { bg: 'bg-gray-100', text: 'text-gray-600', dot: 'bg-gray-500' },
    login: { bg: 'bg-blue-100', text: 'text-blue-600', dot: 'bg-blue-500' },
    alteracao_dados: { bg: 'bg-yellow-100', text: 'text-yellow-600', dot: 'bg-yellow-500' },
    novo_funcionario: { bg: 'bg-green-100', text: 'text-green-600', dot: 'bg-green-500' },
    geracao_holerites: { bg: 'bg-green-100', text: 'text-green-600', dot: 'bg-green-500' },
    envio_email: { bg: 'bg-blue-100', text: 'text-blue-600', dot: 'bg-blue-500' },
    login_falhado: { bg: 'bg-red-100', text: 'text-red-600', dot: 'bg-red-500' },
    erro_sistema: { bg: 'bg-red-100', text: 'text-red-600', dot: 'bg-red-500' },
    visualizacao_holerite: { bg: 'bg-purple-100', text: 'text-purple-600', dot: 'bg-purple-500' },
    download_holerite: { bg: 'bg-indigo-100', text: 'text-indigo-600', dot: 'bg-indigo-500' }
  }
  return styles[tipo as keyof typeof styles] || styles.info
}

const formatarDataCompleta = (data: string) => {
  const dataObj = new Date(data)
  return dataObj.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const formatarOrigem = (origem: string) => {
  const origens = {
    login: 'Login',
    alteracao_dados: 'Alteração de Dados',
    novo_funcionario: 'Novo Funcionário',
    geracao_holerites: 'Geração de Holerites',
    envio_email: 'Envio de Email',
    login_falhado: 'Login Falhado',
    erro_sistema: 'Erro do Sistema',
    sistema: 'Sistema',
    visualizacao_holerite: 'Visualização de Holerite',
    download_holerite: 'Download de Holerite'
  }
  return origens[origem as keyof typeof origens] || origem
}

// Acessibilidade - Fechar com ESC
const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Escape' && props.isOpen) {
    closeDrawer()
  }
}

onMounted(() => {
  console.log('🔔 [DRAWER] Componente montado')
  console.log('🔔 [DRAWER] Props isOpen inicial:', props.isOpen)
  
  const teleportContainer = document.getElementById('teleports')
  console.log('🔔 [DRAWER] Container teleports encontrado:', !!teleportContainer)
  if (teleportContainer) {
    console.log('🔔 [DRAWER] Container teleports:', teleportContainer)
  } else {
    console.error('❌ [DRAWER] Container teleports NÃO encontrado!')
  }
  
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
  // Garantir que o scroll seja restaurado
  document.body.style.overflow = ''
})
</script>

<style scoped>
.notifications-drawer-container {
  /* Garantir que o container tenha o contexto correto */
  position: relative;
  z-index: 1000;
}

/* Melhorar o scroll no mobile */
@media (max-width: 640px) {
  .notifications-drawer-container .overscroll-contain {
    overscroll-behavior: contain;
    -webkit-overflow-scrolling: touch;
  }
}

/* Line clamp utility para textos longos */
.line-clamp-1 {
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>