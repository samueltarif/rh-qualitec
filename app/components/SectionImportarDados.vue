<template>
  <div class="space-y-6">
    <!-- Card de Upload -->
    <div class="card">
      <h3 class="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
        <Icon name="heroicons:arrow-up-tray" class="text-teal-600" size="24" />
        Importar Dados
      </h3>
      
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Tipo de Dados</label>
          <UISelect v-model="form.tipoEntidade">
            <option value="">Selecione o tipo</option>
            <option v-for="tipo in tiposEntidade" :key="tipo.value" :value="tipo.value">{{ tipo.label }}</option>
          </UISelect>
        </div>

        <div v-if="form.tipoEntidade">
          <label class="block text-sm font-medium text-gray-700 mb-2">Template (Opcional)</label>
          <UISelect v-model="form.templateId">
            <option value="">Sem template</option>
            <option v-for="t in templatesDisponiveis" :key="t.id" :value="t.id">{{ t.nome }}</option>
          </UISelect>
        </div>

        <div v-if="form.tipoEntidade" class="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-teal-500 transition-colors">
          <input type="file" ref="fileInput" @change="handleFileSelect" accept=".csv,.xlsx,.xls,.json" class="hidden" />
          <Icon name="heroicons:document-arrow-up" class="text-gray-400 mx-auto mb-4" size="48" />
          <p class="text-gray-600 mb-2">{{ form.arquivo ? form.arquivo.name : 'Arraste um arquivo ou clique para selecionar' }}</p>
          <p class="text-xs text-gray-500 mb-4">CSV, XLSX ou JSON (máx. 10MB)</p>
          <UIButton @click="($refs.fileInput as HTMLInputElement).click()" theme="admin" variant="secondary">Selecionar Arquivo</UIButton>
        </div>

        <div v-if="form.arquivo" class="space-y-3 bg-gray-50 p-4 rounded-lg">
          <label class="flex items-center gap-2">
            <input type="checkbox" v-model="form.validarAntes" class="rounded text-teal-600" />
            <span class="text-sm text-gray-700">Validar dados antes de importar</span>
          </label>
          <label class="flex items-center gap-2">
            <input type="checkbox" v-model="form.fazerBackup" class="rounded text-teal-600" />
            <span class="text-sm text-gray-700">Fazer backup antes da importação</span>
          </label>
          <label class="flex items-center gap-2">
            <input type="checkbox" v-model="form.atualizarExistentes" class="rounded text-teal-600" />
            <span class="text-sm text-gray-700">Atualizar registros existentes</span>
          </label>
        </div>

        <UIButton v-if="form.arquivo" @click="$emit('importar')" theme="admin" variant="primary" full-width :disabled="importando">
          <Icon name="heroicons:arrow-up-tray" class="mr-2" size="18" />
          {{ importando ? 'Importando...' : 'Iniciar Importação' }}
        </UIButton>
      </div>
    </div>

    <!-- Histórico -->
    <WidgetHistoricoOperacoes
      titulo="Histórico de Importações"
      :items="historico"
      :loading="loading"
      tipo="importacao"
      @refresh="$emit('refresh')"
      @ver-erros="(item) => $emit('ver-erros', item)"
    />
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  form: {
    tipoEntidade: string
    templateId: string
    arquivo: File | null
    validarAntes: boolean
    fazerBackup: boolean
    atualizarExistentes: boolean
  }
  templatesDisponiveis: any[]
  historico: any[]
  loading: boolean
  importando: boolean
}>()

defineEmits<{
  importar: []
  refresh: []
  'ver-erros': [item: any]
}>()

const fileInput = ref<HTMLInputElement>()

const tiposEntidade = [
  { value: 'colaboradores', label: 'Colaboradores' },
  { value: 'usuarios', label: 'Usuários' },
  { value: 'ferias', label: 'Férias' },
  { value: 'documentos', label: 'Documentos (Metadados)' },
  { value: 'ponto', label: 'Registros de Ponto' },
  { value: 'folha', label: 'Dados de Folha' },
]

const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files[0]) {
    props.form.arquivo = target.files[0]
  }
}
</script>
