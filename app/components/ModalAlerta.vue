<template>
  <div v-if="modelValue" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
    <div class="bg-white rounded-lg shadow-xl w-full max-w-lg mx-4">
      <div class="flex items-center justify-between p-4 border-b">
        <h3 class="text-lg font-semibold">{{ editando ? 'Editar Alerta' : 'Novo Alerta Manual' }}</h3>
        <button @click="$emit('update:modelValue', false)" class="btn-icon">
          <Icon name="heroicons:x-mark" size="20" />
        </button>
      </div>
      <div class="p-4 space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Título *</label>
          <input v-model="form.titulo" type="text" class="input w-full" placeholder="Ex: Lembrete importante">
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Mensagem *</label>
          <textarea v-model="form.mensagem" class="input w-full" rows="3" placeholder="Descreva o alerta..."></textarea>
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Prioridade</label>
            <select v-model="form.prioridade" class="input w-full">
              <option value="baixa">Baixa</option>
              <option value="media">Média</option>
              <option value="alta">Alta</option>
              <option value="critica">Crítica</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Data Limite</label>
            <input v-model="form.data_vencimento" type="date" class="input w-full">
          </div>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Tipo de Alerta</label>
          <select v-model="form.tipo_alerta_id" class="input w-full">
            <option value="">Nenhum (alerta manual)</option>
            <option v-for="tipo in tiposAlertas" :key="tipo.id" :value="tipo.id">
              {{ tipo.nome }}
            </option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Colaborador (opcional)</label>
          <select v-model="form.colaborador_id" class="input w-full">
            <option value="">Nenhum</option>
            <option v-for="colab in colaboradores" :key="colab.id" :value="colab.id">
              {{ colab.nome }}
            </option>
          </select>
        </div>
      </div>
      <div class="flex justify-end gap-3 p-4 border-t bg-gray-50">
        <button @click="$emit('update:modelValue', false)" class="btn-secondary">Cancelar</button>
        <button @click="salvar" :disabled="salvando" class="btn-primary">
          <Icon :name="salvando ? 'heroicons:arrow-path' : 'heroicons:check'" :class="{ 'animate-spin': salvando }" class="mr-2" />
          {{ salvando ? 'Salvando...' : 'Salvar Alerta' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface FormAlerta {
  titulo: string
  mensagem: string
  prioridade: string
  data_vencimento: string
  tipo_alerta_id: string
  colaborador_id: string
}

const props = defineProps<{
  modelValue: boolean
  editando?: any
  tiposAlertas: any[]
  colaboradores: any[]
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'salvar': [form: FormAlerta]
}>()

const salvando = ref(false)

const form = ref<FormAlerta>({
  titulo: '',
  mensagem: '',
  prioridade: 'media',
  data_vencimento: '',
  tipo_alerta_id: '',
  colaborador_id: '',
})

watch(() => props.modelValue, (open) => {
  if (open && props.editando) {
    form.value = {
      titulo: props.editando.titulo,
      mensagem: props.editando.mensagem,
      prioridade: props.editando.prioridade,
      data_vencimento: props.editando.data_vencimento || '',
      tipo_alerta_id: props.editando.tipo_alerta_id || '',
      colaborador_id: props.editando.colaborador_id || '',
    }
  } else if (open) {
    form.value = {
      titulo: '',
      mensagem: '',
      prioridade: 'media',
      data_vencimento: '',
      tipo_alerta_id: '',
      colaborador_id: '',
    }
  }
})

const salvar = () => {
  if (!form.value.titulo || !form.value.mensagem) {
    alert('Título e mensagem são obrigatórios')
    return
  }
  emit('salvar', form.value)
}
</script>
