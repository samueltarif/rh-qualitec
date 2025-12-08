<template>
  <UIModal v-model="isOpen" title="Editar Contatos de Emergência" size="lg">
    <form @submit.prevent="salvar" class="space-y-6">
      <!-- Contato 1 -->
      <div class="p-4 bg-slate-50 rounded-lg">
        <h4 class="font-medium text-slate-800 mb-3">Contato Principal</h4>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
          <UIInput v-model="form.contato_emergencia_nome" label="Nome" placeholder="Nome completo" />
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">Parentesco</label>
            <select v-model="form.contato_emergencia_parentesco" class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500">
              <option value="">Selecione</option>
              <option v-for="p in parentescos" :key="p" :value="p">{{ p }}</option>
            </select>
          </div>
          <UIInput v-model="form.contato_emergencia_telefone" label="Telefone" placeholder="(00) 00000-0000" />
        </div>
      </div>

      <!-- Contato 2 -->
      <div class="p-4 bg-slate-50 rounded-lg">
        <h4 class="font-medium text-slate-800 mb-3">Contato 2 (Opcional)</h4>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
          <UIInput v-model="form.contato_emergencia_2_nome" label="Nome" placeholder="Nome completo" />
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">Parentesco</label>
            <select v-model="form.contato_emergencia_2_parentesco" class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500">
              <option value="">Selecione</option>
              <option v-for="p in parentescos" :key="p" :value="p">{{ p }}</option>
            </select>
          </div>
          <UIInput v-model="form.contato_emergencia_2_telefone" label="Telefone" placeholder="(00) 00000-0000" />
        </div>
      </div>

      <!-- Contato 3 -->
      <div class="p-4 bg-slate-50 rounded-lg">
        <h4 class="font-medium text-slate-800 mb-3">Contato 3 (Opcional)</h4>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
          <UIInput v-model="form.contato_emergencia_3_nome" label="Nome" placeholder="Nome completo" />
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">Parentesco</label>
            <select v-model="form.contato_emergencia_3_parentesco" class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500">
              <option value="">Selecione</option>
              <option v-for="p in parentescos" :key="p" :value="p">{{ p }}</option>
            </select>
          </div>
          <UIInput v-model="form.contato_emergencia_3_telefone" label="Telefone" placeholder="(00) 00000-0000" />
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
const parentescos = ['Pai', 'Mãe', 'Cônjuge', 'Filho(a)', 'Irmão(ã)', 'Avô(ó)', 'Tio(a)', 'Primo(a)', 'Amigo(a)', 'Outro']

const form = ref({
  contato_emergencia_nome: '',
  contato_emergencia_parentesco: '',
  contato_emergencia_telefone: '',
  contato_emergencia_2_nome: '',
  contato_emergencia_2_parentesco: '',
  contato_emergencia_2_telefone: '',
  contato_emergencia_3_nome: '',
  contato_emergencia_3_parentesco: '',
  contato_emergencia_3_telefone: ''
})

watch(() => props.modelValue, (val) => {
  if (val && props.colaborador) {
    form.value = {
      contato_emergencia_nome: props.colaborador.contato_emergencia_nome || '',
      contato_emergencia_parentesco: props.colaborador.contato_emergencia_parentesco || '',
      contato_emergencia_telefone: props.colaborador.contato_emergencia_telefone || '',
      contato_emergencia_2_nome: props.colaborador.contato_emergencia_2_nome || '',
      contato_emergencia_2_parentesco: props.colaborador.contato_emergencia_2_parentesco || '',
      contato_emergencia_2_telefone: props.colaborador.contato_emergencia_2_telefone || '',
      contato_emergencia_3_nome: props.colaborador.contato_emergencia_3_nome || '',
      contato_emergencia_3_parentesco: props.colaborador.contato_emergencia_3_parentesco || '',
      contato_emergencia_3_telefone: props.colaborador.contato_emergencia_3_telefone || ''
    }
  }
})

const salvar = async () => {
  loading.value = true
  try {
    await $fetch('/api/funcionario/perfil/contato-emergencia', { method: 'PUT', body: form.value })
    emit('saved')
    isOpen.value = false
  } catch (e: any) {
    alert(e.data?.message || 'Erro ao salvar')
  } finally {
    loading.value = false
  }
}
</script>
