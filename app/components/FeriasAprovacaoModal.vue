<template>
  <UIModal v-model="isOpen" title="Aprovar/Rejeitar Solicitação" size="md">
    <div v-if="solicitacao" class="space-y-6">
      <!-- Info do colaborador -->
      <div class="bg-gray-50 rounded-lg p-4">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
            <Icon name="heroicons:user" class="text-red-600" size="24" />
          </div>
          <div>
            <h4 class="font-semibold text-gray-800">{{ solicitacao.colaborador_nome }}</h4>
            <p class="text-sm text-gray-500">{{ solicitacao.cargo }} - {{ solicitacao.departamento }}</p>
          </div>
        </div>
      </div>

      <!-- Detalhes da solicitação -->
      <div class="grid grid-cols-2 gap-4">
        <div>
          <span class="text-sm text-gray-500">Período</span>
          <p class="font-semibold text-gray-800">
            {{ formatDate(solicitacao.data_inicio) }} a {{ formatDate(solicitacao.data_fim) }}
          </p>
        </div>
        <div>
          <span class="text-sm text-gray-500">Dias</span>
          <p class="font-semibold text-gray-800">{{ solicitacao.dias_solicitados }} dias</p>
        </div>
        <div>
          <span class="text-sm text-gray-500">Tipo</span>
          <p class="font-semibold text-gray-800">{{ tipoLabel }}</p>
        </div>
        <div>
          <span class="text-sm text-gray-500">Solicitado em</span>
          <p class="font-semibold text-gray-800">{{ formatDate(solicitacao.created_at) }}</p>
        </div>
      </div>

      <!-- Opções selecionadas -->
      <div v-if="solicitacao.vender_dias || solicitacao.adiantamento_13" class="space-y-2">
        <div v-if="solicitacao.vender_dias" class="flex items-center gap-2 text-sm">
          <Icon name="heroicons:check-circle" class="text-green-500" size="18" />
          <span>Venda de {{ solicitacao.dias_venda }} dias</span>
        </div>
        <div v-if="solicitacao.adiantamento_13" class="flex items-center gap-2 text-sm">
          <Icon name="heroicons:check-circle" class="text-green-500" size="18" />
          <span>Adiantamento do 13º salário</span>
        </div>
      </div>

      <!-- Observações do colaborador -->
      <div v-if="solicitacao.observacoes">
        <span class="text-sm text-gray-500">Observações do colaborador</span>
        <p class="text-gray-700 mt-1 bg-gray-50 rounded-lg p-3">{{ solicitacao.observacoes }}</p>
      </div>

      <!-- Ação -->
      <div class="border-t border-gray-200 pt-4">
        <div class="flex gap-2 mb-4">
          <button
            type="button"
            class="flex-1 py-2 px-4 rounded-lg font-medium transition-colors"
            :class="acao === 'aprovar' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'"
            @click="acao = 'aprovar'"
          >
            <Icon name="heroicons:check" size="18" class="mr-1" />
            Aprovar
          </button>
          <button
            type="button"
            class="flex-1 py-2 px-4 rounded-lg font-medium transition-colors"
            :class="acao === 'rejeitar' ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'"
            @click="acao = 'rejeitar'"
          >
            <Icon name="heroicons:x-mark" size="18" class="mr-1" />
            Rejeitar
          </button>
        </div>

        <UITextarea
          v-if="acao === 'rejeitar'"
          v-model="motivoRejeicao"
          label="Motivo da Rejeição"
          placeholder="Informe o motivo da rejeição..."
          required
          :rows="3"
        />
      </div>

      <div class="flex gap-3 pt-4">
        <UIButton type="button" theme="admin" variant="secondary" full-width @click="close">
          Cancelar
        </UIButton>
        <UIButton
          type="button"
          theme="admin"
          :variant="acao === 'aprovar' ? 'success' : 'danger'"
          full-width
          :loading="saving"
          :disabled="acao === 'rejeitar' && !motivoRejeicao"
          @click="handleSubmit"
        >
          {{ acao === 'aprovar' ? 'Confirmar Aprovação' : 'Confirmar Rejeição' }}
        </UIButton>
      </div>
    </div>
  </UIModal>
</template>

<script setup lang="ts">
interface Props {
  modelValue: boolean
  solicitacao?: Record<string, any> | null
}

const props = withDefaults(defineProps<Props>(), {
  solicitacao: null,
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'aprovar': [id: string]
  'rejeitar': [id: string, motivo: string]
}>()

const saving = ref(false)
const acao = ref<'aprovar' | 'rejeitar'>('aprovar')
const motivoRejeicao = ref('')

const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const tipoLabel = computed(() => {
  const tipos: Record<string, string> = {
    normal: 'Normal',
    fracionada: 'Fracionada',
    abono_pecuniario: 'Com Abono Pecuniário',
    coletiva: 'Coletiva',
  }
  return tipos[props.solicitacao?.tipo] || 'Normal'
})

const formatDate = (date: string) => {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('pt-BR')
}

const close = () => {
  emit('update:modelValue', false)
  acao.value = 'aprovar'
  motivoRejeicao.value = ''
}

const handleSubmit = async () => {
  if (!props.solicitacao?.id) return
  
  saving.value = true
  try {
    if (acao.value === 'aprovar') {
      emit('aprovar', props.solicitacao.id)
    } else {
      emit('rejeitar', props.solicitacao.id, motivoRejeicao.value)
    }
    close()
  } finally {
    saving.value = false
  }
}
</script>
