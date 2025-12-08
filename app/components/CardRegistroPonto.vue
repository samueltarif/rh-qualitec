<template>
  <div class="bg-gray-800 rounded-lg shadow-lg p-6 text-white">
    <div class="flex items-center justify-between">
      <div class="flex items-center space-x-4">
        <div class="bg-orange-500 rounded-lg p-3">
          <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/>
          </svg>
        </div>
        <div>
          <h3 class="text-xl font-bold">{{ titulo }}</h3>
          <p class="text-sm text-gray-400">{{ subtitulo }}</p>
        </div>
      </div>
      <ButtonBaterPonto
        :texto="textoBotao"
        :loading="loading"
        @click="$emit('bater-ponto')"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  titulo?: string
  subtitulo?: string
  textoBotao?: string
  loading?: boolean
}

withDefaults(defineProps<Props>(), {
  titulo: 'Registro de Ponto',
  subtitulo: 'sexta-feira, 05 de dezembro de 2025 às 14:22',
  textoBotao: 'Bater Ponto',
  loading: false
})

defineEmits<{
  'bater-ponto': []
}>()
</script>
