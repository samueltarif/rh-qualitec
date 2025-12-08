<template>
  <div class="card bg-green-50 border-2 border-green-200">
    <h4 class="text-sm font-semibold text-green-700 mb-3 flex items-center gap-2">
      <Icon name="heroicons:gift" size="18" />
      Benefícios (Proventos - Aparecem no Holerite)
    </h4>
    
    <!-- Aviso Informativo -->
    <div class="bg-green-100 border border-green-300 rounded-lg p-3 mb-3">
      <p class="text-xs text-green-800 flex items-start gap-2">
        <Icon name="heroicons:information-circle" size="16" class="mt-0.5 flex-shrink-0" />
        <span>
          <strong>Valores pré-preenchidos do cadastro do colaborador.</strong><br>
          Você pode ajustar os valores aqui para este mês específico. Estes benefícios são <strong>proventos</strong> (não descontos) e aparecem no holerite, mas não afetam o salário líquido pois são pagos pela empresa.
        </span>
      </p>
    </div>

    <!-- Campos de Benefícios -->
    <div class="space-y-3">
      <!-- Linha 1: Vales -->
      <div class="grid md:grid-cols-3 gap-3">
        <UIInput 
          :model-value="modelValue.vale_transporte" 
          @update:model-value="updateField('vale_transporte', $event)"
          label="Vale Transporte" 
          type="number" 
          step="0.01"
          placeholder="0.00"
        />
        <UIInput 
          :model-value="modelValue.vale_refeicao" 
          @update:model-value="updateField('vale_refeicao', $event)"
          label="Vale Refeição" 
          type="number" 
          step="0.01"
          placeholder="0.00"
        />
        <UIInput 
          :model-value="modelValue.vale_alimentacao" 
          @update:model-value="updateField('vale_alimentacao', $event)"
          label="Vale Alimentação" 
          type="number" 
          step="0.01"
          placeholder="0.00"
        />
      </div>

      <!-- Linha 2: Planos de Saúde -->
      <div class="grid md:grid-cols-2 gap-3">
        <UIInput 
          :model-value="modelValue.plano_saude" 
          @update:model-value="updateField('plano_saude', $event)"
          label="Plano de Saúde" 
          type="number" 
          step="0.01"
          placeholder="0.00"
        />
        <UIInput 
          :model-value="modelValue.plano_odontologico" 
          @update:model-value="updateField('plano_odontologico', $event)"
          label="Plano Odontológico" 
          type="number" 
          step="0.01"
          placeholder="0.00"
        />
      </div>

      <!-- Linha 3: Seguros e Auxílios -->
      <div class="grid md:grid-cols-2 gap-3">
        <UIInput 
          :model-value="modelValue.seguro_vida" 
          @update:model-value="updateField('seguro_vida', $event)"
          label="Seguro de Vida" 
          type="number" 
          step="0.01"
          placeholder="0.00"
        />
        <UIInput 
          :model-value="modelValue.auxilio_creche" 
          @update:model-value="updateField('auxilio_creche', $event)"
          label="Auxílio Creche" 
          type="number" 
          step="0.01"
          placeholder="0.00"
        />
      </div>

      <!-- Linha 4: Mais Auxílios -->
      <div class="grid md:grid-cols-2 gap-3">
        <UIInput 
          :model-value="modelValue.auxilio_educacao" 
          @update:model-value="updateField('auxilio_educacao', $event)"
          label="Auxílio Educação" 
          type="number" 
          step="0.01"
          placeholder="0.00"
        />
        <UIInput 
          :model-value="modelValue.auxilio_combustivel" 
          @update:model-value="updateField('auxilio_combustivel', $event)"
          label="Auxílio Combustível" 
          type="number" 
          step="0.01"
          placeholder="0.00"
        />
      </div>

      <!-- Linha 5: Outros Benefícios -->
      <UIInput 
        :model-value="modelValue.outros_beneficios" 
        @update:model-value="updateField('outros_beneficios', $event)"
        label="Outros Benefícios (Personalizado)" 
        type="number" 
        step="0.01"
        placeholder="0.00"
        description="Adicione qualquer outro benefício não listado acima"
      />
    </div>

    <!-- Resumo dos Benefícios -->
    <div v-if="totalBeneficios > 0" class="mt-4 pt-4 border-t border-green-300">
      <div class="flex items-center justify-between bg-green-100 rounded-lg p-3">
        <div class="flex items-center gap-2">
          <Icon name="heroicons:calculator" size="20" class="text-green-700" />
          <span class="font-semibold text-green-800">Total de Benefícios</span>
        </div>
        <span class="text-lg font-bold text-green-700">{{ formatCurrency(totalBeneficios) }}</span>
      </div>
      <p class="text-xs text-green-600 mt-2 text-center">
        💡 Este valor aparecerá no holerite como provento, mas não afeta o salário líquido
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
interface BeneficiosData {
  vale_transporte: number
  vale_refeicao: number
  vale_alimentacao: number
  plano_saude: number
  plano_odontologico: number
  seguro_vida: number
  auxilio_creche: number
  auxilio_educacao: number
  auxilio_combustivel: number
  outros_beneficios: number
}

interface Props {
  modelValue: BeneficiosData
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:modelValue': [value: BeneficiosData]
  'change': []
}>()

// Calcular total de benefícios
const totalBeneficios = computed(() => {
  return (
    (parseFloat(String(props.modelValue.vale_transporte)) || 0) +
    (parseFloat(String(props.modelValue.vale_refeicao)) || 0) +
    (parseFloat(String(props.modelValue.vale_alimentacao)) || 0) +
    (parseFloat(String(props.modelValue.plano_saude)) || 0) +
    (parseFloat(String(props.modelValue.plano_odontologico)) || 0) +
    (parseFloat(String(props.modelValue.seguro_vida)) || 0) +
    (parseFloat(String(props.modelValue.auxilio_creche)) || 0) +
    (parseFloat(String(props.modelValue.auxilio_educacao)) || 0) +
    (parseFloat(String(props.modelValue.auxilio_combustivel)) || 0) +
    (parseFloat(String(props.modelValue.outros_beneficios)) || 0)
  )
})

// Atualizar campo específico
const updateField = (field: keyof BeneficiosData, value: string | number) => {
  const numValue = parseFloat(String(value)) || 0
  
  emit('update:modelValue', {
    ...props.modelValue,
    [field]: numValue
  })
  
  // Emitir evento de mudança para recalcular resumo
  emit('change')
}

// Formatar moeda
const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value || 0)
}
</script>
