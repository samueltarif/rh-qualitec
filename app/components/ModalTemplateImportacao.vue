<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div class="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-hidden">
      <div class="p-6 border-b border-gray-200">
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-semibold text-gray-800">
            {{ template ? 'Editar Template' : 'Novo Template' }}
          </h3>
          <button @click="$emit('close')" class="text-gray-400 hover:text-gray-600">
            <Icon name="heroicons:x-mark" size="24" />
          </button>
        </div>
      </div>

      <form @submit.prevent="salvar" class="p-6 overflow-y-auto max-h-[calc(90vh-200px)] space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Nome *</label>
          <UIInput v-model="form.nome" required />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
          <textarea
            v-model="form.descricao"
            rows="2"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          />
        </div>

        <div class="grid md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Tipo de Entidade *</label>
            <UISelect v-model="form.tipo_entidade" required>
              <option value="">Selecione</option>
              <option value="colaboradores">Colaboradores</option>
              <option value="usuarios">Usuários</option>
              <option value="ferias">Férias</option>
              <option value="documentos">Documentos</option>
              <option value="ponto">Ponto</option>
              <option value="folha">Folha</option>
            </UISelect>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Formato *</label>
            <UISelect v-model="form.formato" required>
              <option value="csv">CSV</option>
              <option value="xlsx">Excel</option>
              <option value="json">JSON</option>
            </UISelect>
          </div>
        </div>

        <div>
          <label class="flex items-center gap-2">
            <input type="checkbox" v-model="form.ativo" class="rounded text-teal-600" />
            <span class="text-sm text-gray-700">Template ativo</span>
          </label>
        </div>
      </form>

      <div class="p-6 border-t border-gray-200 flex gap-3">
        <UIButton @click="$emit('close')" theme="admin" variant="secondary" class="flex-1">
          Cancelar
        </UIButton>
        <UIButton @click="salvar" theme="admin" variant="primary" class="flex-1" :disabled="salvando">
          {{ salvando ? 'Salvando...' : 'Salvar' }}
        </UIButton>
      </div>
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

const salvando = ref(false)

const form = ref({
  nome: props.template?.nome || '',
  descricao: props.template?.descricao || '',
  tipo_entidade: props.template?.tipo_entidade || '',
  formato: props.template?.formato || 'csv',
  ativo: props.template?.ativo ?? true,
})

const salvar = async () => {
  if (!form.value.nome || !form.value.tipo_entidade) {
    alert('Preencha os campos obrigatórios')
    return
  }

  salvando.value = true
  try {
    if (props.template?.id) {
      await $fetch(`/api/importacao/templates/${props.template.id}`, {
        method: 'PUT',
        body: form.value,
      })
    } else {
      await $fetch('/api/importacao/templates', {
        method: 'POST',
        body: form.value,
      })
    }
    alert('✅ Template salvo com sucesso!')
    emit('saved')
  } catch (error: any) {
    console.error('Erro ao salvar:', error)
    alert(`Erro: ${error.data?.message || error.message}`)
  } finally {
    salvando.value = false
  }
}
</script>
