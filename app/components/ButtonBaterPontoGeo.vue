<template>
  <div class="space-y-3 sm:space-y-4">
    <!-- Alerta GPS não suportado -->
    <div v-if="!gpsSuportado" class="p-3 sm:p-4 bg-red-50 border border-red-200 rounded-lg">
      <div class="flex items-start gap-2 sm:gap-3">
        <svg class="w-4 h-4 sm:w-5 sm:h-5 text-red-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
        </svg>
        <div class="flex-1 min-w-0">
          <p class="font-medium text-red-800 text-sm sm:text-base">GPS não disponível</p>
          <p class="text-xs sm:text-sm text-red-600 mt-1">Seu navegador não suporta geolocalização ou você está em HTTP.</p>
        </div>
      </div>
    </div>

    <!-- Botão de bater ponto com geolocalização - Responsivo -->
    <button
      @click="baterPontoComGeo"
      :disabled="!gpsSuportado || carregando || geoCarregando"
      :class="[
        'w-full font-semibold py-3 sm:py-4 px-4 sm:px-6 rounded-lg sm:rounded-xl shadow-lg transition-all duration-200 flex items-center justify-center gap-2 sm:gap-3 touch-manipulation min-h-[48px] sm:min-h-[56px]',
        gpsSuportado 
          ? 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 active:from-blue-800 active:to-blue-900 text-white hover:shadow-xl' 
          : 'bg-gray-300 text-gray-500 cursor-not-allowed',
        (carregando || geoCarregando) && 'opacity-50 cursor-not-allowed'
      ]"
    >
      <svg v-if="!carregando && !geoCarregando" class="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
      <svg v-else class="animate-spin h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      <span class="text-sm sm:text-base">{{ carregando ? 'Registrando...' : geoCarregando ? 'Obtendo GPS...' : 'Bater Ponto' }}</span>
    </button>

    <!-- Informações de localização - Responsivo -->
    <div v-if="verificacao" class="p-3 sm:p-4 rounded-lg" :class="verificacao.permitido ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'">
      <div class="flex items-start gap-2 sm:gap-3">
        <svg v-if="verificacao.permitido" class="w-4 h-4 sm:w-5 sm:h-5 text-green-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
        </svg>
        <svg v-else class="w-4 h-4 sm:w-5 sm:h-5 text-red-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
        </svg>
        <div class="flex-1 min-w-0">
          <p class="font-medium text-sm sm:text-base" :class="verificacao.permitido ? 'text-green-800' : 'text-red-800'">
            {{ verificacao.permitido ? '✅ Dentro do raio' : '❌ Fora do local' }}
          </p>
          <p v-if="verificacao.local" class="text-xs sm:text-sm mt-1" :class="verificacao.permitido ? 'text-green-600' : 'text-red-600'">
            {{ verificacao.local.nome }} - {{ verificacao.local.distancia }}m
          </p>
          <p v-if="!verificacao.permitido" class="text-xs sm:text-sm mt-2 text-red-700 font-medium">
            ⚠️ Aproxime-se do local (máx. 30m)
          </p>
        </div>
      </div>
    </div>

    <!-- Erro de geolocalização - Responsivo -->
    <div v-if="geoErro" class="p-3 sm:p-4 bg-red-50 border border-red-200 rounded-lg">
      <div class="flex items-start gap-2 sm:gap-3">
        <svg class="w-4 h-4 sm:w-5 sm:h-5 text-red-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
        </svg>
        <div class="flex-1 min-w-0">
          <p class="font-medium text-red-800 text-sm sm:text-base">Erro de localização</p>
          <p class="text-xs sm:text-sm text-red-600 mt-1">{{ geoErro }}</p>
        </div>
      </div>
    </div>

    <!-- Mensagem de sucesso - Responsivo -->
    <div v-if="mensagemSucesso" class="p-3 sm:p-4 bg-green-50 border border-green-200 rounded-lg">
      <div class="flex items-start gap-2 sm:gap-3">
        <svg class="w-4 h-4 sm:w-5 sm:h-5 text-green-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
        </svg>
        <p class="text-green-800 font-medium text-sm sm:text-base">{{ mensagemSucesso }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { 
  obterLocalizacao, 
  verificarLocalPermitido, 
  verificarSuporteGPS,
  erro: geoErro, 
  carregando: geoCarregando 
} = useGeolocalizacao()

const carregando = ref(false)
const verificacao = ref<any>(null)
const mensagemSucesso = ref('')
const gpsSuportado = ref(true)

const emit = defineEmits(['sucesso'])

onMounted(() => {
  gpsSuportado.value = verificarSuporteGPS()
})

const baterPontoComGeo = async () => {
  try {
    mensagemSucesso.value = ''
    verificacao.value = null
    
    // Obter localização
    const coords = await obterLocalizacao()
    
    // Verificar se está em local permitido
    verificacao.value = await verificarLocalPermitido()
    
    // BLOQUEAR se estiver fora do raio
    if (!verificacao.value?.permitido) {
      console.error('❌ Fora do raio permitido')
      // Não registra ponto, apenas mostra o erro
      return
    }
    
    // Registrar ponto com coordenadas (só chega aqui se estiver dentro do raio)
    carregando.value = true
    const { data, error } = await useFetch('/api/funcionario/ponto/registrar', {
      method: 'POST',
      body: {
        latitude: coords.latitude,
        longitude: coords.longitude
      }
    })
    
    if (error.value) {
      throw new Error(error.value.message || 'Erro ao registrar ponto')
    }
    
    mensagemSucesso.value = data.value?.message || 'Ponto registrado com sucesso!'
    emit('sucesso', data.value)
    
    // Limpar mensagem após 5 segundos
    setTimeout(() => {
      mensagemSucesso.value = ''
      verificacao.value = null
    }, 5000)
    
  } catch (error: any) {
    console.error('Erro ao bater ponto:', error)
  } finally {
    carregando.value = false
  }
}
</script>
