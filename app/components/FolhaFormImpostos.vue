<template>
  <div class="card bg-blue-50 border-2 border-blue-200">
    <h4 class="text-sm font-semibold text-blue-700 mb-3 flex items-center gap-2">
      <Icon name="heroicons:calculator" size="18" />
      Impostos (Calculados Automaticamente)
    </h4>
    <div class="space-y-3">
      <div class="grid md:grid-cols-2 gap-3">
        <div>
          <UIInput 
            :model-value="modelValue.inss_manual" 
            @update:model-value="updateField('inss_manual', $event)"
            label="INSS (editar manualmente)" 
            type="number" 
            step="0.01"
          />
          <p class="text-xs text-gray-500 mt-1">Calculado: {{ formatCurrency(inssCalculado) }}</p>
        </div>
        <div>
          <UIInput 
            :model-value="modelValue.irrf_manual" 
            @update:model-value="updateField('irrf_manual', $event)"
            label="IRRF (editar manualmente)" 
            type="number" 
            step="0.01"
          />
          <p class="text-xs text-gray-500 mt-1">Calculado: {{ formatCurrency(irrfCalculado) }}</p>
        </div>
      </div>
      <p class="text-xs text-blue-600">
        💡 Deixe em branco para usar o cálculo automático
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Impostos {
  inss_manual: number | null
  irrf_manual: number | null
}

const props = defineProps<{
  modelValue: Impostos
  inssCalculado: number
  irrfCalculado: number
}>()

const emit = defineEmits<{
  'update:modelValue': [value: Impostos]
  change: []
}>()

const updateField = (field: keyof Impostos, value: any) => {
  emit('update:modelValue', {
    ...props.modelValue,
    [field]: value
  })
  emit('change')
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}
</script>
