<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <header class="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div class="max-w-7xl mx-auto px-8 py-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-4">
            <NuxtLink to="/admin" class="w-10 h-10 bg-red-700 rounded-lg flex items-center justify-center hover:bg-red-800 transition-colors">
              <Icon name="heroicons:arrow-left" class="text-white" size="20" />
            </NuxtLink>
            <div>
              <h1 class="text-xl font-bold text-gray-800">Comunicados</h1>
              <p class="text-sm text-gray-500">Publique comunicados para os funcionários</p>
            </div>
          </div>
          <div class="flex items-center gap-3">
            <UIButton theme="admin" variant="primary" @click="abrirModal()">
              <Icon name="heroicons:plus" size="20" class="mr-1" />
              Novo Comunicado
            </UIButton>
            <UserProfileDropdown theme="admin" />
          </div>
        </div>
      </div>
    </header>

    <!-- Content -->
    <div class="max-w-7xl mx-auto p-8">
      <!-- Lista -->
      <div v-if="loading" class="text-center py-12">
        <Icon name="heroicons:arrow-path" class="animate-spin text-gray-400" size="40" />
      </div>

      <div v-else-if="comunicados.length === 0">
        <UIEmptyState
          icon="heroicons:megaphone"
          title="Nenhum comunicado"
          description="Crie o primeiro comunicado para seus funcionários."
          color="amber"
        >
          <template #action>
            <UIButton theme="admin" variant="primary" @click="abrirModal()">
              Criar Comunicado
            </UIButton>
          </template>
        </UIEmptyState>
      </div>

      <div v-else class="space-y-4">
        <div
          v-for="com in comunicados"
          :key="com.id"
          class="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow"
        >
          <div class="flex items-start justify-between gap-4">
            <div class="flex-1">
              <div class="flex items-center gap-2 mb-2">
                <span :class="getTipoClass(com.tipo)" class="px-2 py-1 text-xs font-medium rounded-full">
                  {{ com.tipo }}
                </span>
                <span :class="com.ativo ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'" class="px-2 py-1 text-xs font-medium rounded-full">
                  {{ com.ativo ? 'Ativo' : 'Inativo' }}
                </span>
                <span class="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-600">
                  {{ getDestinoLabel(com.destino) }}
                </span>
              </div>
              <h4 class="font-semibold text-gray-800">{{ com.titulo }}</h4>
              <p class="text-sm text-gray-600 mt-1 line-clamp-2">{{ com.conteudo }}</p>
              <p class="text-xs text-gray-400 mt-2">
                Publicado por {{ com.publicado?.nome || 'Admin' }} em {{ formatDate(com.data_publicacao) }}
                <span v-if="com.data_expiracao"> • Expira em {{ formatDate(com.data_expiracao) }}</span>
              </p>
            </div>
            <div class="flex gap-2">
              <button @click="abrirModal(com)" class="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
                <Icon name="heroicons:pencil" size="18" />
              </button>
              <button @click="excluir(com)" class="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
                <Icon name="heroicons:trash" size="18" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal -->
    <UIModal v-model="showModal" :title="editando ? 'Editar Comunicado' : 'Novo Comunicado'" size="lg">
      <form @submit.prevent="salvar" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Título *</label>
          <input v-model="form.titulo" type="text" required class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Conteúdo *</label>
          <textarea v-model="form.conteudo" rows="6" required class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 resize-none"></textarea>
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
            <select v-model="form.tipo" class="w-full px-3 py-2 border border-gray-300 rounded-lg">
              <option value="Informativo">Informativo</option>
              <option value="Importante">Importante</option>
              <option value="Urgente">Urgente</option>
              <option value="Evento">Evento</option>
              <option value="Beneficio">Benefício</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Destino</label>
            <select v-model="form.destino" class="w-full px-3 py-2 border border-gray-300 rounded-lg">
              <option value="todos">Todos os funcionários</option>
              <option value="departamento">Por departamento</option>
              <option value="cargo">Por cargo</option>
            </select>
          </div>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Data de Expiração (opcional)</label>
          <input v-model="form.data_expiracao" type="date" class="w-full px-3 py-2 border border-gray-300 rounded-lg" />
        </div>
        <div v-if="editando" class="flex items-center gap-2">
          <input type="checkbox" v-model="form.ativo" id="ativo" class="rounded text-red-600" />
          <label for="ativo" class="text-sm text-gray-700">Comunicado ativo</label>
        </div>
      </form>
      <template #footer>
        <div class="flex gap-3">
          <button @click="showModal = false" class="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300">Cancelar</button>
          <button @click="salvar" class="px-4 py-2 bg-red-700 text-white font-medium rounded-lg hover:bg-red-800">
            {{ editando ? 'Salvar' : 'Publicar' }}
          </button>
        </div>
      </template>
    </UIModal>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: ['admin'],
  layout: false,
})

const comunicados = ref<any[]>([])
const loading = ref(false)
const showModal = ref(false)
const editando = ref(false)
const comunicadoId = ref<string | null>(null)

const form = ref({
  titulo: '',
  conteudo: '',
  tipo: 'Informativo',
  destino: 'todos',
  destino_ids: [] as string[],
  data_expiracao: '',
  ativo: true
})

const fetchComunicados = async () => {
  loading.value = true
  try {
    const data = await $fetch<any[]>('/api/admin/comunicados')
    comunicados.value = data
  } catch (e) {
    console.error('Erro:', e)
  } finally {
    loading.value = false
  }
}

const abrirModal = (com?: any) => {
  if (com) {
    editando.value = true
    comunicadoId.value = com.id
    form.value = {
      titulo: com.titulo,
      conteudo: com.conteudo,
      tipo: com.tipo,
      destino: com.destino,
      destino_ids: com.destino_ids || [],
      data_expiracao: com.data_expiracao?.split('T')[0] || '',
      ativo: com.ativo
    }
  } else {
    editando.value = false
    comunicadoId.value = null
    form.value = { titulo: '', conteudo: '', tipo: 'Informativo', destino: 'todos', destino_ids: [], data_expiracao: '', ativo: true }
  }
  showModal.value = true
}

const salvar = async () => {
  try {
    if (editando.value && comunicadoId.value) {
      await $fetch(`/api/admin/comunicados/${comunicadoId.value}`, { method: 'PUT', body: form.value })
    } else {
      await $fetch('/api/admin/comunicados', { method: 'POST', body: form.value })
    }
    showModal.value = false
    await fetchComunicados()
    alert('Comunicado salvo com sucesso!')
  } catch (e: any) {
    alert(e.message || 'Erro ao salvar')
  }
}

const excluir = async (com: any) => {
  if (!confirm(`Excluir comunicado "${com.titulo}"?`)) return
  try {
    await $fetch(`/api/admin/comunicados/${com.id}`, { method: 'DELETE' })
    await fetchComunicados()
  } catch (e: any) {
    alert(e.message || 'Erro ao excluir')
  }
}

const getTipoClass = (tipo: string) => {
  const classes: Record<string, string> = {
    'Informativo': 'bg-blue-100 text-blue-700',
    'Importante': 'bg-amber-100 text-amber-700',
    'Urgente': 'bg-red-100 text-red-700',
    'Evento': 'bg-purple-100 text-purple-700',
    'Beneficio': 'bg-green-100 text-green-700'
  }
  return classes[tipo] || 'bg-gray-100 text-gray-700'
}

const getDestinoLabel = (destino: string) => {
  const labels: Record<string, string> = {
    'todos': 'Todos',
    'departamento': 'Por Departamento',
    'cargo': 'Por Cargo',
    'individual': 'Individual'
  }
  return labels[destino] || destino
}

const formatDate = (date: string) => {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('pt-BR')
}

onMounted(() => fetchComunicados())
</script>
