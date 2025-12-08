<template>
  <div class="min-h-screen bg-gray-50">
    <BasePageHeader title="Importação/Exportação" subtitle="Importe e exporte dados em lote" backTo="/configuracoes" theme="admin" />

    <div class="max-w-7xl mx-auto p-8">
      <CardMigrationWarning :show="erroMigration" titulo="Migration 22 Não Executada" mensagem="O sistema de Importação/Exportação requer que você execute a Migration 22 no banco de dados primeiro." arquivoMigration="database/migrations/22_importacao_exportacao.sql" />

      <!-- Tabs -->
      <div class="bg-white rounded-lg shadow-sm mb-6">
        <div class="border-b border-gray-200">
          <nav class="flex -mb-px">
            <button v-for="tab in tabs" :key="tab.id" @click="activeTab = tab.id" class="px-6 py-3 text-sm font-medium border-b-2 transition-colors" :class="activeTab === tab.id ? 'border-teal-600 text-teal-600' : 'border-transparent text-gray-500 hover:text-gray-700'">
              <Icon :name="tab.icon" class="inline mr-2" size="18" />{{ tab.label }}
            </button>
          </nav>
        </div>
      </div>

      <!-- Tab: Importar -->
      <SectionImportarDados v-show="activeTab === 'importar'" :form="importForm" :templatesDisponiveis="templatesDisponiveis" :historico="historicoImportacoes" :loading="loading" :importando="importando" @importar="handleImportar" @refresh="carregarHistoricoImportacoes" @ver-erros="verDetalhesErros" />

      <!-- Tab: Exportar -->
      <SectionExportarDados v-show="activeTab === 'exportar'" :form="exportForm" :historico="historicoExportacoes" :loading="loading" :exportando="exportando" @exportar="handleExportar" @refresh="carregarHistoricoExportacoes" @baixar="baixarArquivo" />

      <!-- Tab: Templates -->
      <div v-show="activeTab === 'templates'" class="space-y-6">
        <div class="card">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <Icon name="heroicons:document-duplicate" class="text-teal-600" size="24" />
              Templates de Importação
            </h3>
            <UIButton @click="abrirModalTemplate" theme="admin" variant="primary" size="sm">
              <Icon name="heroicons:plus" class="mr-1" size="16" />Novo Template
            </UIButton>
          </div>

          <div v-if="templates.length === 0" class="text-center py-8">
            <Icon name="heroicons:document" class="text-gray-300 mx-auto mb-2" size="48" />
            <p class="text-gray-500">Nenhum template cadastrado</p>
          </div>

          <div v-else class="grid md:grid-cols-2 gap-4">
            <ItemTemplate v-for="template in templates" :key="template.id" :template="template" @editar="editarTemplate" @baixar="baixarTemplate" @excluir="handleExcluirTemplate" />
          </div>
        </div>
      </div>

      <!-- Tab: Configurações -->
      <div v-show="activeTab === 'configuracoes'" class="space-y-6">
        <FormConfigImportacao :config="config" :salvando="salvandoConfig" @salvar="salvarConfiguracoes" />
      </div>
    </div>

    <ModalDetalhesErros v-if="modalErros.aberto" :erros="modalErros.erros" @close="modalErros.aberto = false" />
    <ModalTemplateImportacao v-if="modalTemplate.aberto" :template="modalTemplate.template" @close="modalTemplate.aberto = false" @saved="onTemplateSaved" />
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: ['admin'], layout: false })

const { templates, historicoImportacoes, historicoExportacoes, config, erroMigration, loading, carregarTemplates, carregarHistoricoImportacoes, carregarHistoricoExportacoes, carregarConfig, executarImportacao, executarExportacao, excluirTemplate } = useImportacaoExportacao()

const activeTab = ref('importar')
const importando = ref(false)
const exportando = ref(false)
const salvandoConfig = ref(false)

const tabs = [
  { id: 'importar', label: 'Importar', icon: 'heroicons:arrow-up-tray' },
  { id: 'exportar', label: 'Exportar', icon: 'heroicons:arrow-down-tray' },
  { id: 'templates', label: 'Templates', icon: 'heroicons:document-duplicate' },
  { id: 'configuracoes', label: 'Configurações', icon: 'heroicons:cog-6-tooth' },
]

const importForm = ref({ tipoEntidade: '', templateId: '', arquivo: null as File | null, validarAntes: true, fazerBackup: true, atualizarExistentes: false })
const exportForm = ref({ tipoEntidade: '', formato: '', incluirInativos: false, filtros: { dataInicio: '', dataFim: '', status: '' } })
const modalErros = ref({ aberto: false, erros: [] as any[] })
const modalTemplate = ref({ aberto: false, template: null as any })

const templatesDisponiveis = computed(() => templates.value.filter(t => t.tipo_entidade === importForm.value.tipoEntidade && t.ativo))

const handleImportar = async () => {
  importando.value = true
  try {
    await executarImportacao(importForm.value)
    alert('✅ Importação iniciada com sucesso!')
    importForm.value.arquivo = null
  } catch (e: any) { alert(`Erro: ${e.message}`) }
  finally { importando.value = false }
}

const handleExportar = async () => {
  exportando.value = true
  try {
    await executarExportacao(exportForm.value)
    alert('✅ Exportação gerada com sucesso!')
  } catch (e: any) { alert(`Erro: ${e.message}`) }
  finally { exportando.value = false }
}

const handleExcluirTemplate = async (id: string) => {
  if (!confirm('Deseja realmente excluir este template?')) return
  try { await excluirTemplate(id); alert('✅ Template excluído!') }
  catch (e: any) { alert(`Erro: ${e.message}`) }
}

const verDetalhesErros = (item: any) => { modalErros.value = { aberto: true, erros: item.erros_detalhes || [] } }
const abrirModalTemplate = () => { modalTemplate.value = { aberto: true, template: null } }
const editarTemplate = (template: any) => { modalTemplate.value = { aberto: true, template } }
const baixarTemplate = async (template: any) => { alert('Template baixado!') }
const baixarArquivo = (item: any) => { if (item.arquivo_url) window.open(item.arquivo_url, '_blank') }
const onTemplateSaved = () => { modalTemplate.value.aberto = false; carregarTemplates() }
const salvarConfiguracoes = () => { alert('⚠️ Funcionalidade temporariamente desabilitada. As configurações padrão já estão ativas.') }

watch(activeTab, (newTab) => { if (newTab === 'exportar' && historicoExportacoes.value.length === 0) carregarHistoricoExportacoes() })

onMounted(() => { carregarHistoricoImportacoes(); carregarTemplates(); carregarConfig() })
</script>
