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
              <h1 class="text-xl font-bold text-gray-800">Campos Customizados</h1>
              <p class="text-sm text-gray-500">Crie campos adicionais para colaboradores e outras entidades</p>
            </div>
          </div>
          <UserProfileDropdown theme="admin" />
        </div>
      </div>
    </header>

    <!-- Content -->
    <div class="max-w-7xl mx-auto p-8">
      <!-- Filtros e Ações -->
      <div class="card mb-6">
        <div class="flex flex-wrap gap-4 items-center justify-between">
          <div class="flex gap-4 items-center flex-1">
            <UISelect v-model="filtroEntidade" class="w-48">
              <option value="">Todas as Entidades</option>
              <option value="colaborador">Colaborador</option>
              <option value="empresa">Empresa</option>
              <option value="documento">Documento</option>
            </UISelect>
            <UIInput v-model="busca" placeholder="Buscar campos..." class="flex-1 max-w-md">
              <template #prefix>
                <Icon name="heroicons:magnifying-glass" class="text-gray-400" size="20" />
              </template>
            </UIInput>
          </div>
          <UIButton @click="abrirModal()" theme="admin">
            <Icon name="heroicons:plus" size="20" />
            Novo Campo
          </UIButton>
        </div>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="card text-center py-12">
        <Icon name="heroicons:arrow-path" class="animate-spin text-gray-400 mx-auto mb-4" size="48" />
        <p class="text-gray-600">Carregando campos...</p>
      </div>

      <!-- Lista de Campos -->
      <div v-else class="space-y-4">
        <div v-for="grupo in camposAgrupados" :key="grupo.nome" class="card">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold text-gray-800">
              {{ grupo.nome }}
              <span class="text-sm text-gray-500 font-normal ml-2">({{ grupo.campos.length }})</span>
            </h3>
          </div>

          <div class="space-y-2">
            <div 
              v-for="campo in grupo.campos" 
              :key="campo.id"
              class="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div class="flex-1">
                <div class="flex items-center gap-2 mb-1">
                  <h4 class="font-medium text-gray-800">{{ campo.label }}</h4>
                  <span class="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                    {{ campo.tipo_campo }}
                  </span>
                  <span v-if="campo.obrigatorio" class="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700">
                    Obrigatório
                  </span>
                  <span v-if="!campo.ativo" class="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">
                    Inativo
                  </span>
                </div>
                <p class="text-sm text-gray-600">{{ campo.descricao || 'Sem descrição' }}</p>
                <p class="text-xs text-gray-500 mt-1">
                  Nome do campo: <code class="bg-gray-200 px-1 rounded">{{ campo.nome }}</code>
                </p>
              </div>
              <div class="flex gap-2">
                <button 
                  @click="abrirModal(campo)"
                  class="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Editar"
                >
                  <Icon name="heroicons:pencil" size="20" />
                </button>
                <button 
                  @click="excluir(campo)"
                  class="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Excluir"
                >
                  <Icon name="heroicons:trash" size="20" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div v-if="camposAgrupados.length === 0" class="card text-center py-12">
          <Icon name="heroicons:inbox" class="text-gray-300 mx-auto mb-4" size="64" />
          <h3 class="text-lg font-semibold text-gray-800 mb-2">Nenhum campo encontrado</h3>
          <p class="text-gray-600 mb-4">Crie campos customizados para adicionar informações extras</p>
          <UIButton @click="abrirModal()" theme="admin">
            <Icon name="heroicons:plus" size="20" />
            Criar Primeiro Campo
          </UIButton>
        </div>
      </div>
    </div>

    <!-- Modal -->
    <ModalCampoCustomizado 
      v-if="modalAberto"
      :campo="campoSelecionado"
      @close="fecharModal"
      @saved="carregarCampos"
    />
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: ['admin'],
  layout: false,
})

const loading = ref(true)
const modalAberto = ref(false)
const campoSelecionado = ref(null)
const campos = ref([])
const filtroEntidade = ref('')
const busca = ref('')

// Carregar campos
const carregarCampos = async () => {
  loading.value = true
  try {
    const response = await $fetch('/api/campos-customizados')
    campos.value = response.data || []
  } catch (error) {
    console.error('Erro ao carregar campos:', error)
    alert('Erro ao carregar campos customizados')
  } finally {
    loading.value = false
  }
}

// Campos filtrados e agrupados
const camposAgrupados = computed(() => {
  let filtrados = campos.value

  // Filtrar por entidade
  if (filtroEntidade.value) {
    filtrados = filtrados.filter(c => c.entidade === filtroEntidade.value)
  }

  // Filtrar por busca
  if (busca.value) {
    const termo = busca.value.toLowerCase()
    filtrados = filtrados.filter(c => 
      c.label.toLowerCase().includes(termo) ||
      c.nome.toLowerCase().includes(termo) ||
      (c.descricao && c.descricao.toLowerCase().includes(termo))
    )
  }

  // Agrupar por entidade e grupo
  const grupos = {}
  filtrados.forEach(campo => {
    const chave = `${campo.entidade} - ${campo.grupo || 'Outros'}`
    if (!grupos[chave]) {
      grupos[chave] = {
        nome: chave,
        campos: []
      }
    }
    grupos[chave].campos.push(campo)
  })

  // Ordenar campos dentro de cada grupo
  Object.values(grupos).forEach(grupo => {
    grupo.campos.sort((a, b) => a.ordem - b.ordem)
  })

  return Object.values(grupos)
})

// Modal
const abrirModal = (campo = null) => {
  campoSelecionado.value = campo
  modalAberto.value = true
}

const fecharModal = () => {
  modalAberto.value = false
  campoSelecionado.value = null
}

// Excluir
const excluir = async (campo) => {
  if (!confirm(`Tem certeza que deseja excluir o campo "${campo.label}"?\n\nIsso também excluirá todos os valores associados.`)) {
    return
  }

  try {
    await $fetch(`/api/campos-customizados/${campo.id}`, { method: 'DELETE' })
    alert('✅ Campo excluído com sucesso!')
    carregarCampos()
  } catch (error) {
    console.error('Erro ao excluir:', error)
    alert('Erro ao excluir campo')
  }
}

onMounted(() => {
  carregarCampos()
})
</script>
