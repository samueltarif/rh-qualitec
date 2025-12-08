<template>
  <div class="space-y-4">
    <h4 class="font-medium text-gray-800 border-b pb-2">Identidade (RG)</h4>
    <div class="grid md:grid-cols-3 gap-4">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">RG</label>
        <UIInput :model-value="modelValue.rg" @update:model-value="update('rg', $event)" type="text" />
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Órgão Emissor</label>
        <UIInput :model-value="modelValue.orgao_emissor" @update:model-value="update('orgao_emissor', $event)" type="text" placeholder="Ex: SSP/SP" />
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Data de Emissão</label>
        <UIInput :model-value="modelValue.data_emissao_rg" @update:model-value="update('data_emissao_rg', $event)" type="date" />
      </div>
    </div>

    <h4 class="font-medium text-gray-800 border-b pb-2 mt-6">PIS/PASEP</h4>
    <div class="grid md:grid-cols-2 gap-4">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">PIS</label>
        <UIInput :model-value="modelValue.pis" @update:model-value="update('pis', $event)" type="text" placeholder="000.00000.00-0" />
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">PIS/PASEP</label>
        <UIInput :model-value="modelValue.pis_pasep" @update:model-value="update('pis_pasep', $event)" type="text" />
      </div>
    </div>

    <h4 class="font-medium text-gray-800 border-b pb-2 mt-6">Título de Eleitor</h4>
    <div class="grid md:grid-cols-3 gap-4">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Título de Eleitor</label>
        <UIInput :model-value="modelValue.titulo_eleitor" @update:model-value="update('titulo_eleitor', $event)" type="text" />
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Zona Eleitoral</label>
        <UIInput :model-value="modelValue.zona_eleitoral" @update:model-value="update('zona_eleitoral', $event)" type="text" />
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Seção Eleitoral</label>
        <UIInput :model-value="modelValue.secao_eleitoral" @update:model-value="update('secao_eleitoral', $event)" type="text" />
      </div>
    </div>

    <h4 class="font-medium text-gray-800 border-b pb-2 mt-6">Certificado Militar</h4>
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-1">Certificado de Reservista</label>
      <UIInput :model-value="modelValue.certificado_militar" @update:model-value="update('certificado_militar', $event)" type="text" />
    </div>

    <h4 class="font-medium text-gray-800 border-b pb-2 mt-6">CTPS (Carteira de Trabalho)</h4>
    <div class="grid md:grid-cols-3 gap-4">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Número CTPS</label>
        <UIInput :model-value="modelValue.ctps" @update:model-value="update('ctps', $event)" type="text" />
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Série</label>
        <UIInput :model-value="modelValue.ctps_serie" @update:model-value="update('ctps_serie', $event)" type="text" />
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">UF</label>
        <UISelect :model-value="modelValue.ctps_uf" @update:model-value="update('ctps_uf', $event)">
          <option value="">Selecione</option>
          <option v-for="uf in ufs" :key="uf" :value="uf">{{ uf }}</option>
        </UISelect>
      </div>
    </div>

    <h4 class="font-medium text-gray-800 border-b pb-2 mt-6">CNH (Carteira de Motorista)</h4>
    <div class="grid md:grid-cols-3 gap-4">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Número CNH</label>
        <UIInput :model-value="modelValue.cnh" @update:model-value="update('cnh', $event)" type="text" />
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
        <UISelect :model-value="modelValue.cnh_categoria" @update:model-value="update('cnh_categoria', $event)">
          <option value="">Selecione</option>
          <option value="A">A</option>
          <option value="B">B</option>
          <option value="AB">AB</option>
          <option value="C">C</option>
          <option value="D">D</option>
          <option value="E">E</option>
        </UISelect>
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Validade</label>
        <UIInput :model-value="modelValue.cnh_validade" @update:model-value="update('cnh_validade', $event)" type="date" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{ modelValue: Record<string, any> }>()
const emit = defineEmits<{ 'update:modelValue': [value: Record<string, any>] }>()

const ufs = ['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO']

const update = (key: string, value: any) => {
  emit('update:modelValue', { ...props.modelValue, [key]: value })
}
</script>
