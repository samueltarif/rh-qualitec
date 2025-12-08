<template>
  <div class="card">
    <h4 class="text-sm font-semibold text-green-700 mb-3 flex items-center gap-2">
      <Icon name="heroicons:plus-circle" size="18" />
      Proventos (Adições)
    </h4>
    <div class="space-y-3">
      <div class="grid md:grid-cols-2 gap-3">
        <UIInput 
          :model-value="modelValue.horas_extras_50" 
          @update:model-value="updateField('horas_extras_50', $event)"
          label="Horas Extras 50%" 
          type="number" 
          step="0.01"
        />
        <UIInput 
          :model-value="modelValue.horas_extras_100" 
          @update:model-value="updateField('horas_extras_100', $event)"
          label="Horas Extras 100%" 
          type="number" 
          step="0.01"
        />
      </div>
      <div class="grid md:grid-cols-2 gap-3">
        <UIInput 
          :model-value="modelValue.bonus" 
          @update:model-value="updateField('bonus', $event)"
          label="Bônus / Gratificações" 
          type="number" 
          step="0.01"
        />
        <UIInput 
          :model-value="modelValue.comissoes" 
          @update:model-value="updateField('comissoes', $event)"
          label="Comissões" 
          type="number" 
          step="0.01"
        />
      </div>
      <div class="grid md:grid-cols-2 gap-3">
        <UIInput 
          :model-value="modelValue.adicional_insalubridade" 
          @update:model-value="updateField('adicional_insalubridade', $event)"
          label="Adicional Insalubridade (%)" 
          type="number" 
          step="0.01"
        />
        <UIInput 
          :model-value="modelValue.adicional_periculosidade" 
          @update:model-value="updateField('adicional_periculosidade', $event)"
          label="Adicional Periculosidade (%)" 
          type="number" 
          step="0.01"
        />
      </div>
      <UIInput 
        :model-value="modelValue.adicional_noturno" 
        @update:model-value="updateField('adicional_noturno', $event)"
        label="Adicional Noturno" 
        type="number" 
        step="0.01"
      />
      <UIInput 
        :model-value="modelValue.outros_proventos" 
        @update:model-value="updateField('outros_proventos', $event)"
        label="Outros Proventos (Personalizado)" 
        type="number" 
        step="0.01"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
interface Proventos {
  horas_extras_50: number
  horas_extras_100: number
  bonus: number
  comissoes: number
  adicional_insalubridade: number
  adicional_periculosidade: number
  adicional_noturno: number
  outros_proventos: number
}

const props = defineProps<{
  modelValue: Proventos
}>()

const emit = defineEmits<{
  'update:modelValue': [value: Proventos]
  change: []
}>()

const updateField = (field: keyof Proventos, value: any) => {
  emit('update:modelValue', {
    ...props.modelValue,
    [field]: value
  })
  emit('change')
}
</script>
