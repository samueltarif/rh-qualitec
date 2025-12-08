<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center">
    <div class="absolute inset-0 bg-black/50" @click="$emit('close')"></div>
    <div class="relative bg-white rounded-xl shadow-xl w-full max-w-md mx-4 p-6">
      <h3 class="text-xl font-bold text-gray-800 mb-6">
        {{ isEditing ? 'Editar Cargo' : 'Novo Cargo' }}
      </h3>

      <form @submit.prevent="$emit('submit')">
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-2">Nome do Cargo *</label>
          <UIInput :model-value="form.nome" @update:model-value="updateForm('nome', $event)" type="text" placeholder="Ex: Gerente de Vendas" required />
        </div>

        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-2">Nível *</label>
          <UISelect :model-value="form.nivel" @update:model-value="updateForm('nivel', $event)" required>
            <option value="">Selecione o nível</option>
            <option value="operacional">Operacional</option>
            <option value="gestao">Gestão</option>
          </UISelect>
        </div>

        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-2">Departamento</label>
          <UISelect :model-value="form.departamento_id" @update:model-value="updateForm('departamento_id', $event)">
            <option value="">Nenhum departamento</option>
            <option v-for="dep in departamentos" :key="dep.id" :value="dep.id">{{ dep.nome }}</option>
          </UISelect>
          <p class="text-xs text-gray-500 mt-1">Opcional: vincule este cargo a um departamento específico</p>
        </div>

        <div class="mb-6">
          <label class="block text-sm font-medium text-gray-700 mb-2">Descrição</label>
          <textarea
            :value="form.descricao"
            @input="updateForm('descricao', ($event.target as HTMLTextAreaElement).value)"
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
            rows="3"
            placeholder="Descrição das responsabilidades do cargo..."
          ></textarea>
        </div>

        <div class="flex gap-3">
          <UIButton type="button" theme="admin" variant="secondary" full-width @click="$emit('close')">Cancelar</UIButton>
          <UIButton type="submit" theme="admin" variant="primary" full-width :disabled="saving">
            {{ saving ? 'Salvando...' : (isEditing ? 'Salvar' : 'Criar Cargo') }}
          </UIButton>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  isEditing: boolean
  form: { nome: string; nivel: string; descricao: string; departamento_id: string }
  saving: boolean
  departamentos: Array<{ id: string; nome: string }>
}>()

const emit = defineEmits<{
  close: []
  submit: []
  'update:form': [value: typeof props.form]
}>()

const updateForm = (key: string, value: any) => {
  emit('update:form', { ...props.form, [key]: value })
}
</script>
