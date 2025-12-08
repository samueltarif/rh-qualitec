<template>
  <div class="space-y-4">
    <div class="grid md:grid-cols-3 gap-4">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">CEP</label>
        <div class="flex gap-2">
          <UIInput :model-value="modelValue.cep" @update:model-value="update('cep', $event)" type="text" placeholder="00000-000" class="flex-1" />
          <UIButton type="button" theme="admin" variant="secondary" @click="$emit('buscar-cep')" :disabled="buscandoCep">
            {{ buscandoCep ? '...' : 'Buscar' }}
          </UIButton>
        </div>
      </div>
    </div>
    <div class="grid md:grid-cols-3 gap-4">
      <div class="md:col-span-2">
        <label class="block text-sm font-medium text-gray-700 mb-1">Logradouro</label>
        <UIInput :model-value="modelValue.logradouro" @update:model-value="update('logradouro', $event)" type="text" />
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Número</label>
        <UIInput :model-value="modelValue.numero" @update:model-value="update('numero', $event)" type="text" />
      </div>
    </div>
    <div class="grid md:grid-cols-2 gap-4">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Complemento</label>
        <UIInput :model-value="modelValue.complemento" @update:model-value="update('complemento', $event)" type="text" />
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Bairro</label>
        <UIInput :model-value="modelValue.bairro" @update:model-value="update('bairro', $event)" type="text" />
      </div>
    </div>
    <div class="grid md:grid-cols-2 gap-4">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Cidade</label>
        <UIInput :model-value="modelValue.cidade" @update:model-value="update('cidade', $event)" type="text" />
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">UF</label>
        <UISelect :model-value="modelValue.estado" @update:model-value="update('estado', $event)">
          <option value="">Selecione</option>
          <option v-for="uf in ufs" :key="uf" :value="uf">{{ uf }}</option>
        </UISelect>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{ modelValue: Record<string, any>; buscandoCep?: boolean }>()
const emit = defineEmits<{ 'update:modelValue': [value: Record<string, any>]; 'buscar-cep': [] }>()

const ufs = ['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO']

const update = (key: string, value: any) => {
  emit('update:modelValue', { ...props.modelValue, [key]: value })
}
</script>
