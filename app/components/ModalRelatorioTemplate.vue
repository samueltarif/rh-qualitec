<template>
  <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" @click.self="$emit('close')">
    <div class="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
      <!-- Header -->
      <div class="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <h2 class="text-xl font-bold text-gray-800">
          {{ template ? 'Editar Relatório' : 'Novo Relatório' }}
        </h2>
        <button @click="$emit('close')" class="text-gray-400 hover:text-gray-600">
          <Icon name="heroicons:x-mark" size="24" />
        </button>
      </div>

      <!-- Form -->
      <form @submit.prevent="salvar" class="p-6 space-y-4">
        <!-- Nome e Descrição -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Nome do Relatório *</label>
          <UIInput v-model="form.nome" required placeholder="Ex: Lista de Colaboradores Ativos" />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
          <textarea 
            v-model="form.descricao" 
            rows="2"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            placeholder="Descrição do relatório..."
          ></textarea>
        </div>

        <!-- Categoria e Entidade -->
        <div class="grid md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Categoria *</label>
            <UISelect v-model="form.categoria" required>
              <option value="">Selecione</option>
              <option value="colaboradores">Colaboradores</option>
              <option value="folha">Folha de Pagamento</option>
              <option value="ponto">Ponto</option>
              <option value="ferias">Férias</option>
              <option value="documentos">Documentos</option>
              <option value="geral">Geral</option>
            </UISelect>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Entidade Principal *</label>
            <UISelect v-model="form.entidade_principal" required>
              <option value="">Selecione</option>
              <option value="colaboradores">colaboradores</option>
              <option value="folha_pagamento">folha_pagamento</option>
              <option value="registros_ponto">registros_ponto</option>
              <option value="ferias">ferias</option>
              <option value="documentos_colaboradores">documentos_colaboradores</option>
            </UISelect>
          </div>
        </div>

        <!-- Campos Selecionados -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Campos a Incluir *</label>
          <textarea 
            v-model="camposTexto" 
            rows="3"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent font-mono text-sm"
            placeholder="Digite os campos separados por vírgula&#10;Ex: nome, cpf, cargo, departamento, salario"
            required
          ></textarea>
          <p class="text-xs text-gray-500 mt-1">Separe os campos por vírgula</p>
        </div>

        <!-- Formato e Orientação -->
        <div class="grid md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Formato Padrão</label>
            <UISelect v-model="form.formato_padrao">
              <option value="pdf">PDF</option>
              <option value="excel">Excel</option>
              <option value="csv">CSV</option>
              <option value="json">JSON</option>
            </UISelect>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Orientação</label>
            <UISelect v-model="form.orientacao">
              <option value="portrait">Retrato</option>
              <option value="landscape">Paisagem</option>
            </UISelect>
          </div>
        </div>

        <!-- Opções -->
        <div class="space-y-2">
          <label class="flex items-center gap-2">
            <input type="checkbox" v-model="form.incluir_logo" class="rounded text-red-600 focus:ring-red-500">
            <span class="text-sm text-gray-700">Incluir logo da empresa</span>
          </label>
          <label class="flex items-center gap-2">
            <input type="checkbox" v-model="form.incluir_cabecalho" class="rounded text-red-600 focus:ring-red-500">
            <span class="text-sm text-gray-700">Incluir cabeçalho</span>
          </label>
          <label class="flex items-center gap-2">
            <input type="checkbox" v-model="form.incluir_rodape" class="rounded text-red-600 focus:ring-red-500">
            <span class="text-sm text-gray-700">Incluir rodapé</span>
          </label>
          <label class="flex items-center gap-2">
            <input type="checkbox" v-model="form.ativo" class="rounded text-red-600 focus:ring-red-500">
            <span class="text-sm text-gray-700">Ativo</span>
          </label>
        </div>

        <!-- Botões -->
        <div class="flex gap-4 pt-4">
          <UIButton type="button" @click="$emit('close')" theme="admin" variant="secondary" full-width>
            Cancelar
          </UIButton>
          <UIButton type="submit" theme="admin" variant="primary" full-width :disabled="saving">
            {{ saving ? 'Salvando...' : 'Salvar' }}
          </UIButton>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  template?: any
}>()

const emit = defineEmits<{
  close: []
  saved: []
}>()

const saving = ref(false)
const camposTexto = ref('')

const form = ref({
  id: '',
  nome: '',
  descricao: '',
  categoria: 'colaboradores',
  entidade_principal: 'colaboradores',
  campos_selecionados: [],
  formato_padrao: 'pdf',
  orientacao: 'portrait',
  incluir_logo: true,
  incluir_cabecalho: true,
  incluir_rodape: true,
  ativo: true,
})

// Carregar dados do template
onMounted(() => {
  if (props.template) {
    form.value = { ...form.value, ...props.template }
    
    // Converter array de campos para texto
    if (props.template.campos_selecionados && Array.isArray(props.template.campos_selecionados)) {
      camposTexto.value = props.template.campos_selecionados.join(', ')
    }
  }
})

// Salvar
const salvar = async () => {
  // Converter campos de texto para array
  form.value.campos_selecionados = camposTexto.value
    .split(',')
    .map(c => c.trim())
    .filter(c => c.length > 0)

  if (form.value.campos_selecionados.length === 0) {
    alert('Adicione pelo menos um campo ao relatório')
    return
  }

  saving.value = true
  try {
    if (props.template) {
      // Atualizar
      await $fetch(`/api/relatorios/templates/${props.template.id}`, {
        method: 'PUT',
        body: form.value
      })
    } else {
      // Criar
      await $fetch('/api/relatorios/templates', {
        method: 'POST',
        body: form.value
      })
    }

    alert('✅ Relatório salvo com sucesso!')
    emit('saved')
    emit('close')
  } catch (error: any) {
    console.error('Erro ao salvar:', error)
    alert(`Erro ao salvar: ${error.data?.message || error.message || 'Erro desconhecido'}`)
  } finally {
    saving.value = false
  }
}
</script>
