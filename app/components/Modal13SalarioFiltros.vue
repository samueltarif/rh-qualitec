<template>
  <div class="card bg-blue-50 border-2 border-blue-200">
    <h4 class="text-sm font-semibold text-blue-800 mb-3">Configurações do 13º Salário</h4>
    <div class="grid md:grid-cols-2 gap-4">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Parcela</label>
        <select 
          :model-value="parcela" 
          @change="$emit('update:parcela', ($event.target as HTMLSelectElement).value)"
          class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="1">1ª Parcela (até 30/11)</option>
          <option value="2">2ª Parcela (até 20/12)</option>
          <option value="integral">Integral (Parcela Única)</option>
        </select>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Ano de Referência</label>
        <select 
          :model-value="ano" 
          @change="$emit('update:ano', ($event.target as HTMLSelectElement).value)"
          class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option v-for="a in anosDisponiveis" :key="a" :value="a">{{ a }}</option>
        </select>
      </div>
    </div>

    <div class="mt-3 p-3 bg-blue-100 rounded-lg">
      <p class="text-xs text-blue-800">
        <strong>Informação:</strong>
        <span v-if="parcela === '1'">
          A 1ª parcela corresponde a 50% do 13º salário (sem descontos de INSS e IRRF) paga em novembro.
        </span>
        <span v-else-if="parcela === '2'">
          A 2ª parcela corresponde aos 50% restantes com descontos de INSS e IRRF sobre o valor total, paga em dezembro.
        </span>
        <span v-else>
          Parcela integral com todos os descontos aplicados, paga em dezembro.
        </span>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  parcela: string
  ano: string
}>()

const emit = defineEmits<{
  'update:parcela': [value: string]
  'update:ano': [value: string]
}>()

const hoje = new Date()
const anosDisponiveis = computed(() => {
  const anoAtual = hoje.getFullYear()
  return [anoAtual - 1, anoAtual, anoAtual + 1]
})
</script>
