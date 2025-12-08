<template>
  <div class="card mb-8">
    <h3 class="text-lg font-semibold text-gray-800 mb-4">Selecione o Período</h3>
    <div class="flex flex-col md:flex-row gap-4 items-end">
      <div class="flex-1">
        <label class="block text-sm font-medium text-gray-700 mb-1">Mês</label>
        <UISelect :model-value="mes" @update:model-value="$emit('update:mes', $event)" class="w-full">
          <option value="1">Janeiro</option>
          <option value="2">Fevereiro</option>
          <option value="3">Março</option>
          <option value="4">Abril</option>
          <option value="5">Maio</option>
          <option value="6">Junho</option>
          <option value="7">Julho</option>
          <option value="8">Agosto</option>
          <option value="9">Setembro</option>
          <option value="10">Outubro</option>
          <option value="11">Novembro</option>
          <option value="12">Dezembro</option>
        </UISelect>
      </div>

      <div class="flex-1">
        <label class="block text-sm font-medium text-gray-700 mb-1">Ano</label>
        <UISelect :model-value="ano" @update:model-value="$emit('update:ano', $event)" class="w-full">
          <option v-for="a in anosDisponiveis" :key="a" :value="a">{{ a }}</option>
        </UISelect>
      </div>

      <UIButton 
        theme="admin" 
        variant="primary" 
        icon-left="heroicons:calculator"
        @click="$emit('calcular')"
        :disabled="loading"
        class="w-full md:w-auto"
      >
        {{ loading ? 'Calculando...' : 'Calcular Folha' }}
      </UIButton>

      <UIButton 
        theme="admin" 
        variant="success" 
        icon-left="heroicons:document-text"
        @click="$emit('gerar-holerites')"
        :disabled="loadingHolerites || !temFolha"
        class="w-full md:w-auto"
      >
        {{ loadingHolerites ? 'Gerando...' : 'Gerar Holerites' }}
      </UIButton>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  mes: string
  ano: string
  loading?: boolean
  loadingHolerites?: boolean
  temFolha?: boolean
}>()

const emit = defineEmits<{
  'update:mes': [value: string]
  'update:ano': [value: string]
  calcular: []
  'gerar-holerites': []
}>()

const hoje = new Date()
const anosDisponiveis = computed(() => {
  const anoAtual = hoje.getFullYear()
  return [anoAtual - 2, anoAtual - 1, anoAtual, anoAtual + 1]
})
</script>
