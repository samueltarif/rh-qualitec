<template>
  <UIModal v-model="isOpen" title="Editar Dados Pessoais" size="lg">
    <form @submit.prevent="salvar" class="space-y-4">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <UIInput v-model="form.telefone" label="Telefone" placeholder="(00) 00000-0000" />
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1">Sexo</label>
          <select v-model="form.sexo" class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500">
            <option value="">Selecione</option>
            <option value="M">Masculino</option>
            <option value="F">Feminino</option>
            <option value="Outro">Outro</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1">Estado Civil</label>
          <select v-model="form.estado_civil" class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500">
            <option value="">Selecione</option>
            <option value="Solteiro(a)">Solteiro(a)</option>
            <option value="Casado(a)">Casado(a)</option>
            <option value="Divorciado(a)">Divorciado(a)</option>
            <option value="Viúvo(a)">Viúvo(a)</option>
            <option value="União Estável">União Estável</option>
          </select>
        </div>
      </div>
      <p class="text-xs text-slate-500 mt-2">
        <Icon name="heroicons:information-circle" class="inline" />
        CPF, RG, PIS, Data de Nascimento e Email Corporativo só podem ser alterados pelo RH.
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
const form = ref({ telefone: '', sexo: '', estado_civil: '' })

watch(() => props.modelValue, (val) => {
  if (val && props.colaborador) {
    form.value = {
      telefone: props.colaborador.telefone || '',
      sexo: props.colaborador.sexo || '',
      estado_civil: props.colaborador.estado_civil || ''
    }
  }
})

const salvar = async () => {
  loading.value = true
  try {
    await $fetch('/api/funcionario/perfil/dados-pessoais', { method: 'PUT', body: form.value })
    emit('saved')
    isOpen.value = false
  } catch (e: any) {
    alert(e.data?.message || 'Erro ao salvar')
  } finally {
    loading.value = false
  }
}
</script>
