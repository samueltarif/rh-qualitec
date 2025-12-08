<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div class="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
      <div class="p-6 border-b border-gray-200">
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <Icon name="heroicons:exclamation-triangle" class="text-red-600" size="24" />
            Detalhes dos Erros ({{ erros.length }})
          </h3>
          <button @click="$emit('close')" class="text-gray-400 hover:text-gray-600">
            <Icon name="heroicons:x-mark" size="24" />
          </button>
        </div>
      </div>

      <div class="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
        <div v-if="erros.length === 0" class="text-center py-8 text-gray-500">
          Nenhum erro encontrado
        </div>

        <div v-else class="space-y-3">
          <div
            v-for="(erro, index) in erros"
            :key="index"
            class="border border-red-200 bg-red-50 rounded-lg p-4"
          >
            <div class="flex items-start gap-3">
              <Icon name="heroicons:x-circle" class="text-red-600 flex-shrink-0 mt-0.5" size="20" />
              <div class="flex-1">
                <p class="text-sm font-medium text-red-800 mb-1">
                  Linha {{ erro.linha || index + 1 }}
                </p>
                <p class="text-sm text-red-700">{{ erro.mensagem }}</p>
                <div v-if="erro.campo" class="mt-2 text-xs text-red-600">
                  Campo: <span class="font-medium">{{ erro.campo }}</span>
                </div>
                <div v-if="erro.valor" class="mt-1 text-xs text-red-600">
                  Valor: <span class="font-mono">{{ erro.valor }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="p-6 border-t border-gray-200 flex justify-end">
        <UIButton @click="$emit('close')" theme="admin" variant="secondary">
          Fechar
        </UIButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  erros: any[]
}>()

defineEmits<{
  close: []
}>()
</script>
