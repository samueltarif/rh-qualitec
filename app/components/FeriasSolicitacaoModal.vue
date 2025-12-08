<template>
  <UIModal v-model="isOpen" :title="isEditing ? 'Editar Solicitação' : 'Nova Solicitação de Férias'" size="lg">
    <form @submit.prevent="handleSubmit">
      <div class="space-y-6">
        <!-- Colaborador -->
        <UISelect
          v-model="form.colaborador_id"
          label="Colaborador"
          placeholder="Selecione o colaborador"
          icon-left="heroicons:user"
          required
          :disabled="isEditing"
        >
          <option v-for="col in colaboradores" :key="col.id" :value="col.id">
            {{ col.nome }}
          </option>
        </UISelect>

        <!-- Período Aquisitivo -->
        <UISelect
          v-model="form.periodo_aquisitivo_id"
          label="Período Aquisitivo"
          placeholder="Selecione o período"
          icon-left="heroicons:calendar"
        >
          <option v-for="periodo in periodosDisponiveis" :key="periodo.id" :value="periodo.id">
            {{ formatDate(periodo.data_inicio) }} a {{ formatDate(periodo.data_fim) }} - Saldo: {{ periodo.dias_saldo }} dias
          </option>
        </UISelect>

        <!-- Tipo de Férias -->
        <UISelect
          v-model="form.tipo"
          label="Tipo de Férias"
          icon-left="heroicons:tag"
          required
        >
          <option value="normal">Normal (30 dias)</option>
          <option value="fracionada">Fracionada</option>
          <option value="abono_pecuniario">Com Abono Pecuniário</option>
          <option value="coletiva">Coletiva</option>
        </UISelect>

        <!-- Datas -->
        <div class="grid grid-cols-2 gap-4">
          <UIDateInput
            v-model="form.data_inicio"
            label="Data Início"
            :min="minDate"
            required
          />
          <UIDateInput
            v-model="form.data_fim"
            label="Data Fim"
            :min="form.data_inicio"
            required
          />
        </div>

        <!-- Dias calculados -->
        <div class="bg-gray-50 rounded-lg p-4">
          <div class="flex items-center justify-between">
            <span class="text-sm text-gray-600">Dias solicitados:</span>
            <span class="text-lg font-bold text-gray-800">{{ diasCalculados }} dias</span>
          </div>
        </div>

        <!-- Opções adicionais -->
        <div class="space-y-3">
          <UICheckbox
            v-model="form.vender_dias"
            label="Vender dias de férias (Abono Pecuniário)"
            description="Converter até 10 dias em dinheiro"
          />
          
          <div v-if="form.vender_dias" class="ml-8">
            <UIInput
              v-model="form.dias_venda"
              type="number"
              label="Quantidade de dias para vender"
              :max="10"
              :min="1"
            />
          </div>

          <UICheckbox
            v-model="form.adiantamento_13"
            label="Solicitar adiantamento do 13º salário"
            description="Receber 50% do 13º junto com as férias"
          />
        </div>

        <!-- Observações -->
        <UITextarea
          v-model="form.observacoes"
          label="Observações"
          placeholder="Informações adicionais sobre a solicitação..."
          :rows="3"
        />
      </div>

      <div class="flex gap-3 mt-8 pt-6 border-t border-gray-200">
        <UIButton type="button" theme="admin" variant="secondary" full-width @click="close">
          Cancelar
        </UIButton>
        <UIButton type="submit" theme="admin" variant="primary" full-width :loading="saving">
          {{ isEditing ? 'Salvar Alterações' : 'Enviar Solicitação' }}
        </UIButton>
      </div>
    </form>
  </UIModal>
</template>

<script setup lang="ts">
interface Colaborador {
  id: string
  nome: string
}

interface PeriodoAquisitivo {
  id: string
  data_inicio: string
  data_fim: string
  dias_saldo: number
}

interface Props {
  modelValue: boolean
  solicitacao?: Record<string, any> | null
  colaboradores: Colaborador[]
  periodos: PeriodoAquisitivo[]
}

const props = withDefaults(defineProps<Props>(), {
  solicitacao: null,
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'submit': [data: Record<string, any>]
}>()

const saving = ref(false)

const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const isEditing = computed(() => !!props.solicitacao?.id)

const form = ref({
  colaborador_id: '',
  periodo_aquisitivo_id: '',
  tipo: 'normal',
  data_inicio: '',
  data_fim: '',
  vender_dias: false,
  dias_venda: 0,
  adiantamento_13: false,
  observacoes: '',
})

const minDate = computed(() => {
  const date = new Date()
  date.setDate(date.getDate() + 30) // Antecedência mínima
  return date.toISOString().split('T')[0]
})

const resetForm = () => {
  form.value = {
    colaborador_id: '',
    periodo_aquisitivo_id: '',
    tipo: 'normal',
    data_inicio: '',
    data_fim: '',
    vender_dias: false,
    dias_venda: 0,
    adiantamento_13: false,
    observacoes: '',
  }
}

const periodosDisponiveis = computed(() => {
  if (!form.value.colaborador_id) return props.periodos
  return props.periodos.filter(p => p.dias_saldo > 0)
})

const diasCalculados = computed(() => {
  if (!form.value.data_inicio || !form.value.data_fim) return 0
  const inicio = new Date(form.value.data_inicio)
  const fim = new Date(form.value.data_fim)
  const diff = Math.ceil((fim.getTime() - inicio.getTime()) / (1000 * 60 * 60 * 24)) + 1
  return diff > 0 ? diff : 0
})

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('pt-BR')
}

const close = () => {
  emit('update:modelValue', false)
  resetForm()
}

const handleSubmit = async () => {
  saving.value = true
  try {
    emit('submit', {
      ...form.value,
      dias_solicitados: diasCalculados.value,
    })
  } finally {
    saving.value = false
  }
}

watch(() => props.solicitacao, (newVal) => {
  if (newVal) {
    form.value = { ...newVal }
  } else {
    resetForm()
  }
}, { immediate: true })
</script>
