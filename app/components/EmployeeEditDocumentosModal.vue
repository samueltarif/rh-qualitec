<template>
  <UIModal v-model="isOpen" title="Editar Documentos" size="lg">
    <form @submit.prevent="salvar" class="space-y-4">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <UIInput v-model="form.cnh" label="CNH" placeholder="Número da CNH" />
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1">Categoria CNH</label>
          <select v-model="form.cnh_categoria" class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500">
            <option value="">Selecione</option>
            <option v-for="cat in categorias" :key="cat" :value="cat">{{ cat }}</option>
          </select>
        </div>
        <UIDateInput v-model="form.cnh_validade" label="Validade CNH" />
      </div>
      <p class="text-xs text-slate-500 mt-2">
        <Icon name="heroicons:information-circle" class="inline" />
        CPF, RG e PIS só podem ser alterados pelo RH.
      </p>
      <div class="flex justify-end gap-3 pt-4 border-t">
        <button type="button" @click="isOpen = false" class="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg">Cancelar</button>
        <button type="submit" :disabled="loading" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
          {{ loading ? 'Salvando...' : 'Salvar' }}
        </button>
      </div>
    </form>
  </UIModal>
</template>

<script setup lang="ts">
const props = defineProps<{ modelValue: boolean; colaborador: any }>()
const emit = defineEmits(['update:modelValue', 'saved'])

const isOpen = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const loading = ref(false)
const categorias = ['A', 'B', 'AB', 'C', 'D', 'E', 'AC', 'AD', 'AE']
const form = ref({ cnh: '', cnh_categoria: '', cnh_validade: '' })

watch(() => props.modelValue, (val) => {
  if (val && props.colaborador) {
    form.value = {
      cnh: props.colaborador.cnh || '',
      cnh_categoria: props.colaborador.cnh_categoria || '',
      cnh_validade: props.colaborador.cnh_validade?.split('T')[0] || ''
    }
  }
})

const salvar = async () => {
  loading.value = true
  try {
    await $fetch('/api/funcionario/perfil/documentos', { method: 'PUT', body: form.value })
    emit('saved')
    isOpen.value = false
  } catch (e: any) {
    alert(e.data?.message || 'Erro ao salvar')
  } finally {
    loading.value = false
  }
}
</script>
