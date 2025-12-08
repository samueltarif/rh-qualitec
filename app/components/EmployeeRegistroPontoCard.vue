<template>
  <div class="bg-gradient-to-r from-slate-800 to-slate-700 rounded-xl p-6 shadow-lg">
    <div class="flex flex-col md:flex-row items-center justify-between gap-4">
      <!-- Info do Registro -->
      <div class="flex items-center gap-4">
        <div class="w-16 h-16 bg-amber-500 rounded-xl flex items-center justify-center">
          <Icon name="heroicons:finger-print" class="text-slate-900" size="32" />
        </div>
        <div class="text-center md:text-left">
          <h3 class="text-lg font-bold text-white">Registro de Ponto</h3>
          <p class="text-slate-400">{{ dataHoraAtual }}</p>
        </div>
      </div>

      <!-- Botão de Registro com GPS -->
      <ButtonBaterPontoGeo @sucesso="$emit('sucesso', $event)" />
    </div>

    <!-- Último Registro -->
    <div v-if="ultimoRegistro" class="mt-4 pt-4 border-t border-slate-600">
      <p class="text-sm text-slate-400">
        Último registro: <span class="text-amber-400 font-medium">{{ ultimoRegistro }}</span>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  dataHoraAtual: string
  ultimoRegistro?: string
}

withDefaults(defineProps<Props>(), {
  ultimoRegistro: ''
})

defineEmits<{
  sucesso: [data: any]
}>()
</script>
