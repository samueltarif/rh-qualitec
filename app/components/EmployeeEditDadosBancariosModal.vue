<template>
  <UIModal v-model="isOpen" title="Editar Dados Bancários" size="lg">
    <div class="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
      <p class="text-sm text-amber-800">
        <Icon name="heroicons:exclamation-triangle" class="inline mr-1" />
        Alterações nos dados bancários precisam de aprovação do RH antes de serem efetivadas.
      </p>
    </div>
    <form @submit.prevent="salvar" class="space-y-4">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <UIInput v-model="form.banco_nome" label="Nome do Banco" placeholder="Ex: Banco do Brasil" />
        <UIInput v-model="form.banco_codigo" label="Código do Banco" placeholder="001" />
        <UIInput v-model="form.agencia" label="Agência" placeholder="0000" />
        <UIInput v-model="form.conta" label="Conta" placeholder="00000-0" />
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1">Tipo de Conta</label>
          <select v-model="form.tipo_conta" class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
            <option value="">Selecione</option>
            <option value="corrente">Conta Corrente</option>
            <option value="poupanca">Conta Poupança</option>
            <option value="salario">Conta Salário</option>
          </select>
        </div>
        <UIInput v-model="form.pix" label="Chave PIX" placeholder="CPF, Email, Telefone ou Aleatória" />
      </div>
      <div class="flex justify-end gap-3 pt-4 border-t">
        <button type="button" @click="isOpen = false" class="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg">Cancelar</button>
        <button type="submit" :disabled="loading" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
          {{ loading ? 'Enviando...' : 'Solicitar Alteração' }}
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
const form = ref({
  banco_nome: '', banco_codigo: '', agencia: '', conta: '', tipo_conta: '', pix: ''
})

watch(() => props.modelValue, (val) => {
  if (val && props.colaborador) {
    form.value = {
      banco_nome: props.colaborador.banco_nome || '',
      banco_codigo: props.colaborador.banco_codigo || '',
      agencia: props.colaborador.agencia || '',
      conta: props.colaborador.conta || '',
      tipo_conta: props.colaborador.tipo_conta || '',
      pix: props.colaborador.pix || ''
    }
  }
})

const salvar = async () => {
  loading.value = true
  try {
    await $fetch('/api/funcionario/perfil/dados-bancarios', { method: 'PUT', body: form.value })
    alert('Solicitação enviada! Aguarde a aprovação do RH.')
    emit('saved')
    isOpen.value = false
  } catch (e: any) {
    alert(e.data?.message || 'Erro ao enviar solicitação')
  } finally {
    loading.value = false
  }
}
</script>
