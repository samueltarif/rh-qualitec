<template>
  <UIModal v-model="isOpen" title="Nova Solicitação" size="lg">
    <form @submit.prevent="handleSubmit" class="space-y-4">
      <!-- Tipo de Solicitação -->
      <div>
        <label class="block text-sm font-medium text-slate-700 mb-1">Tipo de Solicitação *</label>
        <select 
          v-model="form.tipo" 
          required
          class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
        >
          <option value="">Selecione o tipo</option>
          <option value="ferias">Férias</option>
          <option value="abono">Abono</option>
          <option value="atestado">Atestado Médico</option>
          <option value="declaracao">Declaração</option>
          <option value="alteracao_dados">Alteração de Dados Cadastrais</option>
          <option value="holerite">Segunda Via de Holerite</option>
          <option value="informe_rendimentos">Informe de Rendimentos</option>
          <option value="carta_referencia">Carta de Referência</option>
          <option value="outros">Outros</option>
        </select>
      </div>

      <!-- Título -->
      <div>
        <label class="block text-sm font-medium text-slate-700 mb-1">Título *</label>
        <input 
          v-model="form.titulo"
          type="text"
          required
          placeholder="Descreva brevemente sua solicitação"
          class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
        />
      </div>

      <!-- Descrição -->
      <div>
        <label class="block text-sm font-medium text-slate-700 mb-1">Descrição</label>
        <textarea 
          v-model="form.descricao"
          rows="4"
          placeholder="Forneça mais detalhes sobre sua solicitação..."
          class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none"
        ></textarea>
      </div>

      <!-- Prioridade -->
      <div>
        <label class="block text-sm font-medium text-slate-700 mb-1">Prioridade</label>
        <div class="flex gap-4">
          <label class="flex items-center gap-2 cursor-pointer">
            <input type="radio" v-model="form.prioridade" value="Baixa" class="text-amber-500 focus:ring-amber-500" />
            <span class="text-sm text-slate-600">Baixa</span>
          </label>
          <label class="flex items-center gap-2 cursor-pointer">
            <input type="radio" v-model="form.prioridade" value="Normal" class="text-amber-500 focus:ring-amber-500" />
            <span class="text-sm text-slate-600">Normal</span>
          </label>
          <label class="flex items-center gap-2 cursor-pointer">
            <input type="radio" v-model="form.prioridade" value="Alta" class="text-amber-500 focus:ring-amber-500" />
            <span class="text-sm text-slate-600">Alta</span>
          </label>
          <label class="flex items-center gap-2 cursor-pointer">
            <input type="radio" v-model="form.prioridade" value="Urgente" class="text-amber-500 focus:ring-amber-500" />
            <span class="text-sm text-red-600 font-medium">Urgente</span>
          </label>
        </div>
      </div>

      <!-- Campos específicos por tipo -->
      <div v-if="form.tipo === 'ferias'" class="bg-amber-50 rounded-lg p-4">
        <p class="text-sm text-amber-800">
          <Icon name="heroicons:information-circle" size="16" class="inline mr-1" />
          Para solicitação de férias, utilize o módulo específico de Férias no menu principal.
        </p>
      </div>

      <div v-if="form.tipo === 'atestado'" class="bg-blue-50 rounded-lg p-4">
        <p class="text-sm text-blue-800">
          <Icon name="heroicons:information-circle" size="16" class="inline mr-1" />
          Lembre-se de anexar o atestado médico digitalizado após criar a solicitação.
        </p>
      </div>
    </form>

    <template #footer>
      <div class="flex gap-3">
        <button 
          type="button"
          @click="isOpen = false"
          class="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors"
        >
          Cancelar
        </button>
        <button 
          @click="handleSubmit"
          :disabled="!isValid || loading"
          class="px-4 py-2 bg-amber-500 text-slate-900 font-medium rounded-lg hover:bg-amber-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span v-if="loading" class="flex items-center gap-2">
            <Icon name="heroicons:arrow-path" class="animate-spin" size="18" />
            Enviando...
          </span>
          <span v-else>Enviar Solicitação</span>
        </button>
      </div>
    </template>
  </UIModal>
</template>

<script setup lang="ts">
const props = defineProps<{
  modelValue: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  submit: [data: any]
}>()

const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const loading = ref(false)

const form = ref({
  tipo: '',
  titulo: '',
  descricao: '',
  prioridade: 'Normal'
})

const isValid = computed(() => {
  return form.value.tipo && form.value.titulo
})

const handleSubmit = () => {
  if (!isValid.value) return
  loading.value = true
  emit('submit', { ...form.value })
  setTimeout(() => {
    loading.value = false
    resetForm()
  }, 500)
}

const resetForm = () => {
  form.value = {
    tipo: '',
    titulo: '',
    descricao: '',
    prioridade: 'Normal'
  }
}

watch(isOpen, (val) => {
  if (!val) resetForm()
})
</script>
