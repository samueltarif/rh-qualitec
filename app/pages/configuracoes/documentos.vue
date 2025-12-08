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
              <h1 class="text-xl font-bold text-gray-800">Tipos de Documentos</h1>
              <p class="text-sm text-gray-500">Gerencie categorias e tipos de documentos RH</p>
            </div>
          </div>
          <UserProfileDropdown theme="admin" />
        </div>
      </div>
    </header>

    <!-- Content -->
    <div class="max-w-7xl mx-auto p-8">
      <!-- Tabs -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
        <div class="flex border-b border-gray-200">
          <button
            @click="abaAtiva = 'categorias'"
            class="px-6 py-3 font-medium transition-colors"
            :class="abaAtiva === 'categorias' ? 'text-red-700 border-b-2 border-red-700' : 'text-gray-500 hover:text-gray-700'"
          >
            <Icon name="heroicons:folder" class="inline mr-2" />
            Categorias ({{ categorias.length }})
          </button>
          <button
            @click="abaAtiva = 'tipos'"
            class="px-6 py-3 font-medium transition-colors"
            :class="abaAtiva === 'tipos' ? 'text-red-700 border-b-2 border-red-700' : 'text-gray-500 hover:text-gray-700'"
          >
            <Icon name="heroicons:document-text" class="inline mr-2" />
            Tipos de Documentos ({{ tipos.length }})
          </button>
        </div>
      </div>

      <!-- Aba Categorias -->
      <div v-if="abaAtiva === 'categorias'">
        <div class="flex justify-between items-center mb-6">
          <p class="text-gray-600">Organize documentos em categorias</p>
          <button @click="abrirModalCategoria()" class="btn-primary">
            <Icon name="heroicons:plus" class="mr-2" />
            Nova Categoria
          </button>
        </div>

        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div
            v-for="categoria in categorias"
            :key="categoria.id"
            class="card hover:shadow-lg transition-shadow"
          >
            <div class="flex items-start gap-3">
              <div 
                class="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
                :style="{ backgroundColor: getCorFundo(categoria.cor) }"
              >
                <Icon :name="categoria.icone" :style="{ color: getCorIcone(categoria.cor) }" size="24" />
              </div>
              <div class="flex-1 min-w-0">
                <h3 class="font-semibold text-gray-800">{{ categoria.nome }}</h3>
                <p class="text-sm text-gray-600 mt-1">{{ categoria.descricao }}</p>
                <div class="flex items-center gap-2 mt-3">
                  <span 
                    class="text-xs px-2 py-1 rounded-full"
                    :class="categoria.ativo ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'"
                  >
                    {{ categoria.ativo ? 'Ativo' : 'Inativo' }}
                  </span>
                  <span class="text-xs text-gray-500">
                    {{ contarTiposPorCategoria(categoria.id) }} tipos
                  </span>
                </div>
              </div>
            </div>
            <div class="flex gap-2 mt-4 pt-4 border-t border-gray-100">
              <button @click="abrirModalCategoria(categoria)" class="btn-secondary flex-1 text-sm">
                <Icon name="heroicons:pencil" class="mr-1" size="16" />
                Editar
              </button>
              <button @click="excluirCategoria(categoria)" class="btn-danger flex-1 text-sm">
                <Icon name="heroicons:trash" class="mr-1" size="16" />
                Excluir
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Aba Tipos -->
      <div v-if="abaAtiva === 'tipos'">
        <div class="flex justify-between items-center mb-6">
          <div class="flex gap-4 items-center">
            <select v-model="filtroCategoria" class="input">
              <option value="">Todas as categorias</option>
              <option v-for="cat in categorias" :key="cat.id" :value="cat.id">
                {{ cat.nome }}
              </option>
            </select>
            <label class="flex items-center gap-2 text-sm text-gray-600">
              <input type="checkbox" v-model="apenasAtivos" class="rounded">
              Apenas ativos
            </label>
          </div>
          <button @click="abrirModalTipo()" class="btn-primary">
            <Icon name="heroicons:plus" class="mr-2" />
            Novo Tipo
          </button>
        </div>

        <div class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <table class="w-full">
            <thead class="bg-gray-50 border-b border-gray-200">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Categoria</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Configurações</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Ações</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              <tr v-for="tipo in tiposFiltrados" :key="tipo.id" class="hover:bg-gray-50">
                <td class="px-6 py-4">
                  <div>
                    <div class="font-medium text-gray-800">{{ tipo.nome }}</div>
                    <div class="text-sm text-gray-500">{{ tipo.descricao }}</div>
                  </div>
                </td>
                <td class="px-6 py-4">
                  <span 
                    v-if="tipo.categoria"
                    class="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs"
                    :style="{ 
                      backgroundColor: getCorFundo(tipo.categoria.cor),
                      color: getCorIcone(tipo.categoria.cor)
                    }"
                  >
                    <Icon :name="tipo.categoria.icone" size="14" />
                    {{ tipo.categoria.nome }}
                  </span>
                </td>
                <td class="px-6 py-4">
                  <div class="flex flex-wrap gap-1">
                    <span v-if="tipo.requer_periodo" class="badge-info">Período</span>
                    <span v-if="tipo.requer_horas" class="badge-info">Horas</span>
                    <span v-if="tipo.requer_aprovacao" class="badge-warning">Aprovação</span>
                    <span v-if="tipo.tem_validade" class="badge-success">Validade</span>
                    <span v-if="tipo.notificar_vencimento" class="badge-purple">Notifica</span>
                  </div>
                </td>
                <td class="px-6 py-4">
                  <span 
                    class="px-2 py-1 rounded-full text-xs"
                    :class="tipo.ativo ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'"
                  >
                    {{ tipo.ativo ? 'Ativo' : 'Inativo' }}
                  </span>
                </td>
                <td class="px-6 py-4 text-right">
                  <div class="flex gap-2 justify-end">
                    <button @click="abrirModalTipo(tipo)" class="btn-icon">
                      <Icon name="heroicons:pencil" size="16" />
                    </button>
                    <button @click="excluirTipo(tipo)" class="btn-icon text-red-600 hover:bg-red-50">
                      <Icon name="heroicons:trash" size="16" />
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Modal Categoria -->
    <ModalCategoriaDocumento
      v-if="modalCategoriaAberto"
      :categoria="categoriaEditando"
      @close="fecharModalCategoria"
      @save="salvarCategoria"
    />

    <!-- Modal Tipo -->
    <ModalTipoDocumento
      v-if="modalTipoAberto"
      :tipo="tipoEditando"
      :categorias="categorias"
      @close="fecharModalTipo"
      @save="salvarTipo"
    />
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: ['admin'],
  layout: false,
})

const abaAtiva = ref('categorias')
const categorias = ref([])
const tipos = ref([])
const filtroCategoria = ref('')
const apenasAtivos = ref(false)

const modalCategoriaAberto = ref(false)
const categoriaEditando = ref(null)

const modalTipoAberto = ref(false)
const tipoEditando = ref(null)

// Computed
const tiposFiltrados = computed(() => {
  let resultado = tipos.value

  if (filtroCategoria.value) {
    resultado = resultado.filter(t => t.categoria_id === filtroCategoria.value)
  }

  if (apenasAtivos.value) {
    resultado = resultado.filter(t => t.ativo)
  }

  return resultado
})

// Funções de cores
const coresMap: Record<string, { fundo: string, icone: string }> = {
  blue: { fundo: '#DBEAFE', icone: '#2563EB' },
  green: { fundo: '#D1FAE5', icone: '#059669' },
  purple: { fundo: '#E9D5FF', icone: '#9333EA' },
  amber: { fundo: '#FEF3C7', icone: '#D97706' },
  red: { fundo: '#FEE2E2', icone: '#DC2626' },
  indigo: { fundo: '#E0E7FF', icone: '#4F46E5' },
  cyan: { fundo: '#CFFAFE', icone: '#0891B2' },
  pink: { fundo: '#FCE7F3', icone: '#DB2777' },
  emerald: { fundo: '#D1FAE5', icone: '#10B981' },
  orange: { fundo: '#FFEDD5', icone: '#EA580C' },
  slate: { fundo: '#F1F5F9', icone: '#475569' },
  teal: { fundo: '#CCFBF1', icone: '#0D9488' },
}

const getCorFundo = (cor: string) => coresMap[cor]?.fundo || coresMap.blue.fundo
const getCorIcone = (cor: string) => coresMap[cor]?.icone || coresMap.blue.icone

// Funções
const carregarCategorias = async () => {
  try {
    const data = await $fetch('/api/categorias-documentos')
    categorias.value = data || []
  } catch (error) {
    console.error('Erro ao carregar categorias:', error)
    categorias.value = []
  }
}

const carregarTipos = async () => {
  try {
    const data = await $fetch('/api/tipos-documentos')
    tipos.value = data || []
  } catch (error) {
    console.error('Erro ao carregar tipos:', error)
    tipos.value = []
  }
}

const contarTiposPorCategoria = (categoriaId: string) => {
  return tipos.value.filter(t => t.categoria_id === categoriaId).length
}

const abrirModalCategoria = (categoria = null) => {
  categoriaEditando.value = categoria
  modalCategoriaAberto.value = true
}

const fecharModalCategoria = () => {
  modalCategoriaAberto.value = false
  categoriaEditando.value = null
}

const salvarCategoria = async (dados: any) => {
  try {
    if (categoriaEditando.value) {
      await $fetch(`/api/categorias-documentos/${categoriaEditando.value.id}`, {
        method: 'PUT',
        body: dados,
      })
    } else {
      await $fetch('/api/categorias-documentos', {
        method: 'POST',
        body: dados,
      })
    }
    await carregarCategorias()
    fecharModalCategoria()
  } catch (error) {
    alert('Erro ao salvar categoria')
  }
}

const excluirCategoria = async (categoria: any) => {
  const temTipos = contarTiposPorCategoria(categoria.id) > 0
  
  if (temTipos) {
    alert('Não é possível excluir uma categoria que possui tipos de documentos vinculados.')
    return
  }

  if (!confirm(`Excluir categoria "${categoria.nome}"?`)) return

  try {
    await $fetch(`/api/categorias-documentos/${categoria.id}`, { method: 'DELETE' })
    await carregarCategorias()
  } catch (error) {
    alert('Erro ao excluir categoria')
  }
}

const abrirModalTipo = (tipo = null) => {
  tipoEditando.value = tipo
  modalTipoAberto.value = true
}

const fecharModalTipo = () => {
  modalTipoAberto.value = false
  tipoEditando.value = null
}

const salvarTipo = async (dados: any) => {
  try {
    if (tipoEditando.value) {
      await $fetch(`/api/tipos-documentos/${tipoEditando.value.id}`, {
        method: 'PUT',
        body: dados,
      })
    } else {
      await $fetch('/api/tipos-documentos', {
        method: 'POST',
        body: dados,
      })
    }
    await carregarTipos()
    fecharModalTipo()
  } catch (error) {
    alert('Erro ao salvar tipo')
  }
}

const excluirTipo = async (tipo: any) => {
  if (!confirm(`Excluir tipo "${tipo.nome}"?`)) return

  try {
    await $fetch(`/api/tipos-documentos/${tipo.id}`, { method: 'DELETE' })
    await carregarTipos()
  } catch (error) {
    alert('Erro ao excluir tipo')
  }
}

// Carregar dados
onMounted(() => {
  carregarCategorias()
  carregarTipos()
})
</script>

<style scoped>
.badge-info {
  @apply px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs;
}
.badge-warning {
  @apply px-2 py-0.5 bg-amber-100 text-amber-700 rounded text-xs;
}
.badge-success {
  @apply px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs;
}
.badge-purple {
  @apply px-2 py-0.5 bg-purple-100 text-purple-700 rounded text-xs;
}
</style>
