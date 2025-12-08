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
              <h1 class="text-xl font-bold text-gray-800">Relatórios Personalizados</h1>
              <p class="text-sm text-gray-500">Crie, agende e gere relatórios customizados</p>
            </div>
          </div>
          <UserProfileDropdown theme="admin" />
        </div>
      </div>
    </header>

    <!-- Tabs -->
    <div class="bg-white border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-8">
        <div class="flex gap-6">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            @click="abaAtiva = tab.id"
            class="px-4 py-3 font-medium text-sm border-b-2 transition-colors"
            :class="abaAtiva === tab.id 
              ? 'border-red-600 text-red-600' 
              : 'border-transparent text-gray-600 hover:text-gray-800'"
          >
            <Icon :name="tab.icon" size="18" class="inline mr-2" />
            {{ tab.label }}
          </button>
        </div>
      </div>
    </div>

    <!-- Content -->
    <div class="max-w-7xl mx-auto p-8">
      <!-- Aba: Templates -->
      <div v-if="abaAtiva === 'templates'">
        <!-- Filtros e Ações -->
        <div class="card mb-6">
          <div class="flex flex-wrap gap-4 items-center justify-between">
            <div class="flex gap-4 items-center flex-1">
              <UISelect v-model="filtroCategoria" class="w-48">
                <option value="">Todas as Categorias</option>
                <option value="colaboradores">Colaboradores</option>
                <option value="folha">Folha de Pagamento</option>
                <option value="ponto">Ponto</option>
                <option value="ferias">Férias</option>
                <option value="documentos">Documentos</option>
                <option value="geral">Geral</option>
              </UISelect>
              <UIInput v-model="busca" placeholder="Buscar relatórios..." class="flex-1 max-w-md">
                <template #prefix>
                  <Icon name="heroicons:magnifying-glass" class="text-gray-400" size="20" />
                </template>
              </UIInput>
            </div>
            <UIButton @click="abrirModalTemplate()" theme="admin">
              <Icon name="heroicons:plus" size="20" />
              Novo Relatório
            </UIButton>
          </div>
        </div>

        <!-- Loading -->
        <div v-if="loading" class="card text-center py-12">
          <Icon name="heroicons:arrow-path" class="animate-spin text-gray-400 mx-auto mb-4" size="48" />
          <p class="text-gray-600">Carregando relatórios...</p>
        </div>

        <!-- Lista de Templates -->
        <div v-else class="grid md:grid-cols-2 gap-4">
          <div 
            v-for="template in templatesFiltrados" 
            :key="template.id"
            class="card hover:shadow-lg transition-shadow"
          >
            <div class="flex items-start justify-between mb-3">
              <div class="flex-1">
                <div class="flex items-center gap-2 mb-1">
                  <h3 class="font-semibold text-gray-800">{{ template.nome }}</h3>
                  <Icon 
                    v-if="template.favorito" 
                    name="heroicons:star-solid" 
                    class="text-yellow-500" 
                    size="16" 
                  />
                </div>
                <p class="text-sm text-gray-600 mb-2">{{ template.descricao }}</p>
                <div class="flex gap-2 flex-wrap">
                  <span class="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700">
                    {{ template.categoria }}
                  </span>
                  <span class="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700">
                    {{ template.formato_padrao?.toUpperCase() }}
                  </span>
                  <span v-if="template.total_execucoes > 0" class="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700">
                    {{ template.total_execucoes }} execuções
                  </span>
                </div>
              </div>
            </div>

            <div class="flex gap-2">
              <UIButton @click="gerarRelatorio(template)" theme="admin" variant="primary" size="sm" class="flex-1">
                <Icon name="heroicons:play" size="16" />
                Gerar
              </UIButton>
              <button 
                @click="toggleFavorito(template)"
                class="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                :title="template.favorito ? 'Remover dos favoritos' : 'Adicionar aos favoritos'"
              >
                <Icon :name="template.favorito ? 'heroicons:star-solid' : 'heroicons:star'" size="18" />
              </button>
              <button 
                @click="abrirModalTemplate(template)"
                class="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                title="Editar"
              >
                <Icon name="heroicons:pencil" size="18" />
              </button>
              <button 
                @click="excluirTemplate(template)"
                class="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Excluir"
              >
                <Icon name="heroicons:trash" size="18" />
              </button>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div v-if="!loading && templatesFiltrados.length === 0" class="card text-center py-12">
          <Icon name="heroicons:document-chart-bar" class="text-gray-300 mx-auto mb-4" size="64" />
          <h3 class="text-lg font-semibold text-gray-800 mb-2">Nenhum relatório encontrado</h3>
          <p class="text-gray-600 mb-4">Crie relatórios personalizados para suas necessidades</p>
          <UIButton @click="abrirModalTemplate()" theme="admin">
            <Icon name="heroicons:plus" size="20" />
            Criar Primeiro Relatório
          </UIButton>
        </div>
      </div>

      <!-- Aba: Agendamentos -->
      <div v-if="abaAtiva === 'agendamentos'">
        <div class="card">
          <p class="text-gray-600 text-center py-8">
            🚧 Agendamentos de relatórios em desenvolvimento
          </p>
        </div>
      </div>

      <!-- Aba: Histórico -->
      <div v-if="abaAtiva === 'historico'">
        <div class="card">
          <p class="text-gray-600 text-center py-8">
            🚧 Histórico de execuções em desenvolvimento
          </p>
        </div>
      </div>
    </div>

    <!-- Modal Template -->
    <ModalRelatorioTemplate 
      v-if="modalTemplateAberto"
      :template="templateSelecionado"
      @close="fecharModalTemplate"
      @saved="carregarTemplates"
    />
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: ['admin'],
  layout: false,
})

const loading = ref(true)
const abaAtiva = ref('templates')
const modalTemplateAberto = ref(false)
const templateSelecionado = ref(null)
const templates = ref([])
const filtroCategoria = ref('')
const busca = ref('')

const tabs = [
  { id: 'templates', label: 'Templates', icon: 'heroicons:document-text' },
  { id: 'agendamentos', label: 'Agendamentos', icon: 'heroicons:clock' },
  { id: 'historico', label: 'Histórico', icon: 'heroicons:archive-box' },
]

// Carregar templates
const carregarTemplates = async () => {
  loading.value = true
  try {
    const response = await $fetch('/api/relatorios/templates')
    templates.value = response.data || []
  } catch (error) {
    console.error('Erro ao carregar templates:', error)
    alert('Erro ao carregar relatórios')
  } finally {
    loading.value = false
  }
}

// Templates filtrados
const templatesFiltrados = computed(() => {
  let filtrados = templates.value

  if (filtroCategoria.value) {
    filtrados = filtrados.filter(t => t.categoria === filtroCategoria.value)
  }

  if (busca.value) {
    const termo = busca.value.toLowerCase()
    filtrados = filtrados.filter(t => 
      t.nome.toLowerCase().includes(termo) ||
      (t.descricao && t.descricao.toLowerCase().includes(termo))
    )
  }

  return filtrados.sort((a, b) => {
    if (a.favorito && !b.favorito) return -1
    if (!a.favorito && b.favorito) return 1
    return a.nome.localeCompare(b.nome)
  })
})

// Modal
const abrirModalTemplate = (template = null) => {
  templateSelecionado.value = template
  modalTemplateAberto.value = true
}

const fecharModalTemplate = () => {
  modalTemplateAberto.value = false
  templateSelecionado.value = null
}

// Gerar relatório
const gerarRelatorio = async (template) => {
  if (!confirm(`Gerar relatório "${template.nome}"?`)) return

  try {
    const response = await $fetch('/api/relatorios/gerar', {
      method: 'POST',
      body: { template_id: template.id }
    })

    if (response.success) {
      alert('✅ Relatório gerado com sucesso!\n\nO arquivo será baixado em instantes.')
      // TODO: Implementar download do arquivo
    }
  } catch (error) {
    console.error('Erro ao gerar relatório:', error)
    alert('Erro ao gerar relatório')
  }
}

// Toggle favorito
const toggleFavorito = async (template) => {
  try {
    await $fetch(`/api/relatorios/templates/${template.id}`, {
      method: 'PUT',
      body: { favorito: !template.favorito }
    })
    template.favorito = !template.favorito
  } catch (error) {
    console.error('Erro ao atualizar favorito:', error)
  }
}

// Excluir
const excluirTemplate = async (template) => {
  if (!confirm(`Tem certeza que deseja excluir o relatório "${template.nome}"?`)) return

  try {
    await $fetch(`/api/relatorios/templates/${template.id}`, { method: 'DELETE' })
    alert('✅ Relatório excluído com sucesso!')
    carregarTemplates()
  } catch (error) {
    console.error('Erro ao excluir:', error)
    alert('Erro ao excluir relatório')
  }
}

onMounted(() => {
  carregarTemplates()
})
</script>
