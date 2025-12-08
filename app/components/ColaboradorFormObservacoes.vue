<template>
  <div class="space-y-4">
    <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
      <div class="flex items-center gap-2 text-yellow-800">
        <Icon name="heroicons:eye-slash" size="20" />
        <span class="font-medium">Informações internas - não visíveis pelo funcionário</span>
      </div>
    </div>
    <div>
      <UITextarea
        :model-value="modelValue.observacoes_rh"
        @update:model-value="update('observacoes_rh', $event)"
        label="Observações do RH"
        rows="6"
        placeholder="Notas internas, histórico, observações..."
        :uppercase="true"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{ modelValue: Record<string, any> }>()
const emit = defineEmits<{ 'update:modelValue': [value: Record<string, any>] }>()

const update = (key: string, value: any) => {
  emit('update:modelValue', { ...props.modelValue, [key]: value })
}
</script>
