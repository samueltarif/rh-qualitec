<template>
  <section class="space-y-4">
    <h3 class="font-semibold text-gray-700 border-b pb-2">Validade e Notificações</h3>
    
    <label class="flex items-center gap-3 cursor-pointer">
      <input v-model="form.tem_validade" type="checkbox" class="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500" @change="onToggleValidade" />
      <span class="text-sm font-medium text-gray-800">Este documento tem validade</span>
    </label>

    <div v-if="form.tem_validade" class="ml-7 pl-4 border-l-2 border-red-200 space-y-4">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Válido por (dias) <span class="text-red-500">*</span></label>
        <input v-model.number="form.dias_validade" type="number" min="1" class="w-full sm:w-48 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500" :class="{ 'border-red-500 bg-red-50': erros.dias_validade }" placeholder="Ex: 365" :required="form.tem_validade" />
        <p v-if="erros.dias_validade" class="text-sm text-red-600 mt-1">{{ erros.dias_validade }}</p>
        <p v-else class="text-xs text-gray-500 mt-1">Após este período, o documento expira automaticamente</p>
      </div>

      <label class="flex items-center gap-3 cursor-pointer">
        <input v-model="form.notificar_vencimento" type="checkbox" class="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500" @change="onToggleNotificacao" />
        <span class="text-sm font-medium text-gray-800">Notificar antes do vencimento</span>
      </label>

      <div v-if="form.notificar_vencimento" class="ml-7">
        <label class="block text-sm font-medium text-gray-700 mb-1">Avisar com antecedência (dias)</label>
        <input v-model.number="form.dias_aviso_vencimento" type="number" min="1" class="w-full sm:w-48 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500" placeholder="Ex: 30" />
        <p class="text-xs text-gray-500 mt-1">Sistema enviará notificação X dias antes do vencimento</p>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
const props = defineProps<{
  form: { tem_validade: boolean; dias_validade: number | null; notificar_vencimento: boolean; dias_aviso_vencimento: number | null }
  erros: { dias_validade: string }
}>()

const onToggleValidade = () => {
  if (!props.form.tem_validade) {
    props.form.dias_validade = null
    props.form.notificar_vencimento = false
    props.form.dias_aviso_vencimento = 30
  }
}

const onToggleNotificacao = () => {
  if (!props.form.notificar_vencimento) {
    props.form.dias_aviso_vencimento = 30
  }
}
</script>
