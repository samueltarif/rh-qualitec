<template>
  <section class="space-y-4">
    <h3 class="font-semibold text-gray-700 border-b pb-2">Campos Obrigatórios</h3>
    
    <div class="grid grid-cols-2 gap-3">
      <label v-for="campo in campos" :key="campo.key" class="flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-all" :class="form[campo.key] ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:bg-gray-50'">
        <input v-model="form[campo.key]" type="checkbox" class="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500" />
        <div>
          <div class="font-medium text-sm text-gray-800">{{ campo.label }}</div>
          <div class="text-xs text-gray-500">{{ campo.desc }}</div>
        </div>
      </label>
    </div>

    <div v-if="form.requer_periodo" class="p-3 bg-blue-50 border border-blue-200 rounded-lg">
      <p class="text-sm text-blue-700"><strong>Período habilitado:</strong> O usuário deverá informar data de início e fim ao cadastrar este documento.</p>
    </div>
  </section>
</template>

<script setup lang="ts">
defineProps<{
  form: { requer_periodo: boolean; requer_horas: boolean; requer_aprovacao: boolean; requer_arquivo: boolean }
}>()

const campos = [
  { key: 'requer_periodo', label: 'Período', desc: 'Data início/fim' },
  { key: 'requer_horas', label: 'Horas', desc: 'Quantidade de horas' },
  { key: 'requer_aprovacao', label: 'Aprovação', desc: 'Requer aprovação do gestor' },
  { key: 'requer_arquivo', label: 'Arquivo', desc: 'Upload obrigatório' },
]
</script>
