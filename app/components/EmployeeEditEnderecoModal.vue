<template>
  <UIModal v-model="isOpen" title="Editar Endereço" size="lg">
    <form @submit.prevent="salvar" class="space-y-4">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <UIInput v-model="form.cep" label="CEP" placeholder="00000-000" @blur="buscarCep" />
        <UIInput v-model="form.logradouro" label="Logradouro" placeholder="Rua, Avenida..." />
        <UIInput v-model="form.numero" label="Número" placeholder="123" />
        <UIInput v-model="form.complemento" label="Complemento" placeholder="Apto, Bloco..." />
        <UIInput v-model="form.bairro" label="Bairro" placeholder="Bairro" />
        <UIInput v-model="form.cidade" label="Cidade" placeholder="Cidade" />
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1">Estado</label>
          <select v-model="form.estado" class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
            <option value="">Selecione</option>
            <option v-for="uf in estados" :key="uf" :value="uf">{{ uf }}</option>
          </select>
        </div>
      </div>
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
const estados = ['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO']

const form = ref({
  cep: '', logradouro: '', numero: '', complemento: '', bairro: '', cidade: '', estado: ''
})

watch(() => props.modelValue, (val) => {
  if (val && props.colaborador) {
    form.value = {
      cep: props.colaborador.cep || '',
      logradouro: props.colaborador.logradouro || '',
      numero: props.colaborador.numero || '',
      complemento: props.colaborador.complemento || '',
      bairro: props.colaborador.bairro || '',
      cidade: props.colaborador.cidade || '',
      estado: props.colaborador.estado || ''
    }
  }
})

const buscarCep = async () => {
  const cep = form.value.cep.replace(/\D/g, '')
  if (cep.length !== 8) return
  try {
    const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`)
    const data = await res.json()
    if (!data.erro) {
      form.value.logradouro = data.logradouro || form.value.logradouro
      form.value.bairro = data.bairro || form.value.bairro
      form.value.cidade = data.localidade || form.value.cidade
      form.value.estado = data.uf || form.value.estado
    }
  } catch (e) { console.error('Erro ao buscar CEP:', e) }
}

const salvar = async () => {
  loading.value = true
  try {
    await $fetch('/api/funcionario/perfil/endereco', { method: 'PUT', body: form.value })
    emit('saved')
    isOpen.value = false
  } catch (e: any) {
    alert(e.data?.message || 'Erro ao salvar')
  } finally {
    loading.value = false
  }
}
</script>
