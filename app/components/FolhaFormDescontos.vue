<template>
  <div class="card">
    <h4 class="text-sm font-semibold text-red-700 mb-3 flex items-center gap-2">
      <Icon name="heroicons:minus-circle" size="18" />
      Descontos
    </h4>
    <div class="space-y-3">
      <div class="grid md:grid-cols-2 gap-3">
        <UIInput 
          :model-value="modelValue.adiantamento" 
          @update:model-value="updateField('adiantamento', $event)"
          label="Adiantamento Salarial" 
          type="number" 
          step="0.01"
        />
        <UIInput 
          :model-value="modelValue.emprestimos" 
          @update:model-value="updateField('emprestimos', $event)"
          label="Empréstimos / Consignados" 
          type="number" 
          step="0.01"
        />
      </div>
      <div class="grid md:grid-cols-2 gap-3">
        <UIInput 
          :model-value="modelValue.faltas_horas" 
          @update:model-value="updateField('faltas_horas', $event)"
          label="Faltas (horas)" 
          type="number" 
          step="0.01"
        />
        <UIInput 
          :model-value="modelValue.atrasos_horas" 
          @update:model-value="updateField('atrasos_horas', $event)"
          label="Atrasos (horas)" 
          type="number" 
          step="0.01"
        />
      </div>
      <UIInput 
        :model-value="modelValue.outros_descontos" 
        @update:model-value="updateField('outros_descontos', $event)"
        label="Outros Descontos (Personalizado)" 
        type="number" 
        step="0.01"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
interface Descontos {
  adiantamento: number
  emprestimos: number
  faltas_horas: number
  atrasos_horas: number
  outros_descontos: number
}

const props = defineProps<{
  modelValue: Descontos
}>()

const emit = defineEmits<{
  'update:modelValue': [value: Descontos]
  change: []
}>()

const updateField = (field: keyof Descontos, value: any) => {
  emit('update:modelValue', {
    ...props.modelValue,
    [field]: value
  })
  emit('change')
}
</script>
