<template>
  <div class="space-y-6">
    <div class="card">
      <h3 class="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
        <Icon name="heroicons:arrow-down-tray" class="text-teal-600" size="24" />
        Exportar Dados
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
          <label class="block text-sm font-medium text-gray-700 mb-2">Formato</label>
          <div class="grid grid-cols-3 gap-3">
            <button
              v-for="formato in formatos"
              :key="formato.value"
              @click="form.formato = formato.value"
              class="p-4 border-2 rounded-lg text-center transition-all"
              :class="form.formato === formato.value ? 'border-teal-600 bg-teal-50' : 'border-gray-200 hover:border-gray-300'"
            >
              <Icon :name="formato.icon" class="mx-auto mb-2" size="32" :class="form.formato === formato.value ? 'text-teal-600' : 'text-gray-400'" />
              <p class="text-sm font-medium" :class="form.formato === formato.value ? 'text-teal-600' : 'text-gray-700'">{{ formato.label }}</p>
            </button>
          </div>
        </div>

        <div v-if="form.formato" class="bg-gray-50 p-4 rounded-lg space-y-3">
          <h4 class="text-sm font-medium text-gray-700 mb-2">Filtros (Opcional)</h4>
          <div class="grid md:grid-cols-2 gap-3">
            <div>
              <label class="block text-xs text-gray-600 mb-1">Data Início</label>
              <UIInput v-model="form.filtros.dataInicio" type="date" />
            </div>
            <div>
              <label class="block text-xs text-gray-600 mb-1">Data Fim</label>
              <UIInput v-model="form.filtros.dataFim" type="date" />
            </div>
          </div>
          <div v-if="form.tipoEntidade === 'colaboradores'">
            <label class="block text-xs text-gray-600 mb-1">Status</label>
            <UISelect v-model="form.filtros.status">
              <option value="">Todos</option>
              <option value="ativo">Ativos</option>
              <option value="inativo">Inativos</option>
              <option value="ferias">Em Férias</option>
              <option value="afastado">Afastados</option>
            </UISelect>
          </div>
          <label class="flex items-center gap-2">
            <input type="checkbox" v-model="form.incluirInativos" class="rounded text-teal-600" />
            <span class="text-sm text-gray-700">Incluir registros inativos</span>
          </label>
        </div>

        <UIButton v-if="form.formato" @click="$emit('exportar')" theme="admin" variant="primary" full-width :disabled="exportando">
          <Icon name="heroicons:arrow-down-tray" class="mr-2" size="18" />
          {{ exportando ? 'Gerando...' : 'Gerar Exportação' }}
        </UIButton>
      </div>
    </div>

    <WidgetHistoricoOperacoes
      titulo="Histórico de Exportações"
      :items="historico"
      :loading="loading"
      tipo="exportacao"
      @refresh="$emit('refresh')"
      @baixar="(item) => $emit('baixar', item)"
    />
  </div>
</template>

<script setup lang="ts">
defineProps<{
  form: {
    tipoEntidade: string
    formato: string
    incluirInativos: boolean
    filtros: { dataInicio: string; dataFim: string; status: string }
  }
  historico: any[]
  loading: boolean
  exportando: boolean
}>()

defineEmits<{
  exportar: []
  refresh: []
  baixar: [item: any]
}>()

const tiposEntidade = [
  { value: 'colaboradores', label: 'Colaboradores' },
  { value: 'usuarios', label: 'Usuários' },
  { value: 'ferias', label: 'Férias' },
  { value: 'documentos', label: 'Documentos' },
  { value: 'ponto', label: 'Registros de Ponto' },
  { value: 'folha', label: 'Folha de Pagamento' },
  { value: 'departamentos', label: 'Departamentos' },
  { value: 'cargos', label: 'Cargos' },
  { value: 'jornadas', label: 'Jornadas de Trabalho' },
]

const formatos = [
  { value: 'csv', label: 'CSV', icon: 'heroicons:document-text' },
  { value: 'xlsx', label: 'Excel', icon: 'heroicons:table-cells' },
  { value: 'json', label: 'JSON', icon: 'heroicons:code-bracket' },
]
</script>
