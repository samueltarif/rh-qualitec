<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div class="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
      <!-- Header -->
      <div class="flex items-center justify-between p-6 border-b">
        <div>
          <h3 class="text-lg font-semibold text-gray-900">
            Assinatura Digital do Ponto
          </h3>
          <p class="text-sm text-gray-600 mt-1">
            {{ mesNome }} de {{ ano }}
          </p>
        </div>
        <button
          @click="$emit('close')"
          class="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Content -->
      <div class="p-6">
        <!-- Resumo do Período -->
        <div class="bg-blue-50 rounded-lg p-4 mb-6">
          <h4 class="font-medium text-blue-900 mb-2">Resumo do Período</h4>
          <div class="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span class="text-blue-700">Total de dias:</span>
              <span class="font-medium ml-2">{{ totalDias }} dias</span>
            </div>
            <div>
              <span class="text-blue-700">Total de horas:</span>
              <span class="font-medium ml-2">{{ totalHoras }}</span>
            </div>
          </div>
        </div>

        <!-- Área de Assinatura -->
        <div class="mb-6">
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Assinatura Digital *
          </label>
          <div class="border-2 border-dashed border-gray-300 rounded-lg p-4">
            <canvas
              ref="canvasAssinatura"
              @mousedown="iniciarAssinatura"
              @mousemove="desenharAssinatura"
              @mouseup="finalizarAssinatura"
              @touchstart="iniciarAssinaturaToque"
              @touchmove="desenharAssinaturaToque"
              @touchend="finalizarAssinatura"
              class="w-full h-40 bg-white border rounded cursor-crosshair touch-none"
              width="600"
              height="160"
            />
            <div class="flex justify-between items-center mt-2">
              <p class="text-xs text-gray-500">
                Assine com o mouse ou toque na tela
              </p>
              <button
                @click="limparAssinatura"
                type="button"
                class="text-xs text-red-600 hover:text-red-800 font-medium"
              >
                Limpar
              </button>
            </div>
          </div>
        </div>

        <!-- Observações -->
        <div class="mb-6">
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Observações (opcional)
          </label>
          <textarea
            v-model="observacoes"
            rows="3"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Adicione observações sobre o período..."
          />
        </div>

        <!-- Aviso Legal -->
        <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <div class="flex">
            <svg class="w-5 h-5 text-yellow-600 mt-0.5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
            </svg>
            <div>
              <h5 class="text-sm font-medium text-yellow-800">Importante</h5>
              <p class="text-xs text-yellow-700 mt-1">
                Ao assinar digitalmente, você confirma que os registros de ponto estão corretos e completos para o período selecionado.
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="flex items-center justify-end gap-3 p-6 border-t bg-gray-50">
        <button
          @click="$emit('close')"
          type="button"
          class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Cancelar
        </button>
        <button
          @click="salvarAssinatura"
          :disabled="!assinaturaValida || salvando"
          class="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span v-if="salvando" class="flex items-center">
            <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Salvando...
          </span>
          <span v-else>Confirmar Assinatura</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  mes: number
  ano: number
  totalDias: number
  totalHoras: string
}

const props = defineProps<Props>()
const emit = defineEmits(['close', 'assinado'])

// Estados
const canvasAssinatura = ref<HTMLCanvasElement>()
const observacoes = ref('')
const salvando = ref(false)
const assinando = ref(false)
const assinaturaValida = ref(false)

// Computed
const mesNome = computed(() => {
  const meses = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ]
  return meses[props.mes - 1]
})

// Funções de assinatura com mouse
const iniciarAssinatura = (event: MouseEvent) => {
  assinando.value = true
  const canvas = canvasAssinatura.value
  if (!canvas) return
  
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  
  const rect = canvas.getBoundingClientRect()
  const x = event.clientX - rect.left
  const y = event.clientY - rect.top
  
  ctx.beginPath()
  ctx.moveTo(x, y)
}

const desenharAssinatura = (event: MouseEvent) => {
  if (!assinando.value) return
  
  const canvas = canvasAssinatura.value
  if (!canvas) return
  
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  
  const rect = canvas.getBoundingClientRect()
  const x = event.clientX - rect.left
  const y = event.clientY - rect.top
  
  ctx.lineTo(x, y)
  ctx.stroke()
  assinaturaValida.value = true
}

const finalizarAssinatura = () => {
  assinando.value = false
}

// Funções de assinatura com toque
const iniciarAssinaturaToque = (event: TouchEvent) => {
  event.preventDefault()
  assinando.value = true
  
  const canvas = canvasAssinatura.value
  if (!canvas) return
  
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  
  const rect = canvas.getBoundingClientRect()
  const touch = event.touches[0]
  const x = touch.clientX - rect.left
  const y = touch.clientY - rect.top
  
  ctx.beginPath()
  ctx.moveTo(x, y)
}

const desenharAssinaturaToque = (event: TouchEvent) => {
  event.preventDefault()
  if (!assinando.value) return
  
  const canvas = canvasAssinatura.value
  if (!canvas) return
  
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  
  const rect = canvas.getBoundingClientRect()
  const touch = event.touches[0]
  const x = touch.clientX - rect.left
  const y = touch.clientY - rect.top
  
  ctx.lineTo(x, y)
  ctx.stroke()
  assinaturaValida.value = true
}

// Limpar assinatura
const limparAssinatura = () => {
  const canvas = canvasAssinatura.value
  if (!canvas) return
  
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  assinaturaValida.value = false
}

// Configurar canvas
const configurarCanvas = () => {
  const canvas = canvasAssinatura.value
  if (!canvas) return
  
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  
  ctx.strokeStyle = '#000000'
  ctx.lineWidth = 2
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
}

// Salvar assinatura
const salvarAssinatura = async () => {
  if (!assinaturaValida.value) {
    alert('Por favor, faça sua assinatura antes de confirmar.')
    return
  }
  
  const canvas = canvasAssinatura.value
  if (!canvas) return
  
  salvando.value = true
  
  try {
    // Converter canvas para base64
    const assinaturaBase64 = canvas.toDataURL('image/png')
    
    // Enviar para API
    const response = await $fetch('/api/funcionario/ponto/assinar-digital', {
      method: 'POST',
      body: {
        mes: props.mes,
        ano: props.ano,
        assinaturaDigital: assinaturaBase64,
        observacoes: observacoes.value
      }
    })
    
    // Sucesso
    if (response && response.success) {
      emit('assinado', response)
      emit('close')
    } else {
      throw new Error('Resposta inválida da API')
    }
    
  } catch (error: any) {
    console.error('Erro ao salvar assinatura:', error)
    alert(error.data?.message || 'Erro ao salvar assinatura. Tente novamente.')
  } finally {
    salvando.value = false
  }
}

// Lifecycle
onMounted(() => {
  configurarCanvas()
})
</script>

<style scoped>
canvas {
  touch-action: none;
}
</style>