<template>
  <div v-if="modelValue" class="fixed inset-0 z-50 flex items-center justify-center">
    <div class="absolute inset-0 bg-black/50" @click="$emit('update:modelValue', false)"></div>
    <div class="relative bg-white rounded-xl shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
      <div class="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <h3 class="text-xl font-bold text-gray-800">Novo Documento</h3>
        <button class="p-2 hover:bg-gray-100 rounded-lg" @click="$emit('update:modelValue', false)">
          <Icon name="heroicons:x-mark" size="24" />
        </button>
      </div>

      <form class="p-6 space-y-4" @submit.prevent="handleSubmit">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Colaborador *</label>
          <UISelect v-model="form.colaborador_id" required>
            <option value="">Selecione</option>
            <option v-for="col in colaboradores" :key="col.id" :value="col.id">{{ col.nome }}</option>
          </UISelect>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Tipo de Documento *</label>
          <UISelect v-model="form.tipo" required>
            <option value="">Selecione</option>
            <option v-for="tipo in tiposDocumento" :key="tipo.value" :value="tipo.value">{{ tipo.label }}</option>
          </UISelect>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Data Início</label>
            <UIInput v-model="form.data_inicio" type="date" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Data Fim</label>
            <UIInput v-model="form.data_fim" type="date" />
          </div>
        </div>

        <div v-if="form.tipo === 'Declaracao_Horas'">
          <label class="block text-sm font-medium text-gray-700 mb-1">Quantidade de Horas</label>
          <UIInput v-model.number="form.horas" type="number" step="0.5" min="0" placeholder="Ex: 2.5" />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Observações</label>
          <textarea v-model="form.observacoes" rows="3" class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500" placeholder="Detalhes adicionais..."></textarea>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Anexar Arquivo</label>
          <div class="border-2 border-dashed border-gray-300 rounded-lg p-4">
            <input type="file" @change="handleFileSelect" accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" class="w-full" />
            <p class="text-xs text-gray-500 mt-2">PDF, JPG, PNG ou DOC (máx. 10MB)</p>
          </div>
        </div>

        <div class="flex gap-3 pt-4">
          <UIButton type="button" theme="admin" variant="secondary" full-width @click="$emit('update:modelValue', false)">Cancelar</UIButton>
          <UIButton type="submit" theme="admin" variant="primary" full-width :disabled="saving">{{ saving ? 'Salvando...' : 'Cadastrar' }}</UIButton>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  modelValue: boolean
  colaboradores: any[]
  saving: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  submit: [form: any, file: File | null]
}>()

const tiposDocumento = [
  { value: 'Atestado', label: 'Atestado Médico' },
  { value: 'Declaracao_Horas', label: 'Declaração de Horas' },
  { value: 'Declaracao_Comparecimento', label: 'Declaração de Comparecimento' },
  { value: 'Licenca', label: 'Licença' },
  { value: 'Ferias', label: 'Férias' },
  { value: 'Advertencia', label: 'Advertência' },
  { value: 'Outros', label: 'Outros' },
]

const form = ref({ colaborador_id: '', tipo: '', data_inicio: '', data_fim: '', horas: null as number | null, observacoes: '' })
const selectedFile = ref<File | null>(null)

watch(() => props.modelValue, (open) => {
  if (open) {
    form.value = { colaborador_id: '', tipo: '', data_inicio: '', data_fim: '', horas: null, observacoes: '' }
    selectedFile.value = null
  }
})

const handleFileSelect = (e: Event) => {
  const target = e.target as HTMLInputElement
  selectedFile.value = target.files?.[0] || null
}

const handleSubmit = () => {
  if (!form.value.colaborador_id || !form.value.tipo) {
    alert('Preencha os campos obrigatórios!')
    return
  }
  emit('submit', { ...form.value }, selectedFile.value)
}
</script>
