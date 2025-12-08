export const useGeolocalizacao = () => {
  const localizacaoAtual = ref<{ latitude: number; longitude: number } | null>(null)
  const erro = ref<string | null>(null)
  const carregando = ref(false)

  const obterLocalizacao = (): Promise<{ latitude: number; longitude: number }> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocalização não suportada pelo navegador'))
        return
      }

      carregando.value = true
      erro.value = null

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          }
          localizacaoAtual.value = coords
          carregando.value = false
          resolve(coords)
        },
        (error) => {
          carregando.value = false
          let mensagem = 'Erro ao obter localização'
          
          switch (error.code) {
            case error.PERMISSION_DENIED:
              mensagem = 'Permissão de localização negada. Habilite nas configurações do navegador.'
              break
            case error.POSITION_UNAVAILABLE:
              mensagem = 'Localização indisponível no momento.'
              break
            case error.TIMEOUT:
              mensagem = 'Tempo esgotado ao obter localização.'
              break
          }
          
          erro.value = mensagem
          reject(new Error(mensagem))
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      )
    })
  }

  const verificarLocalPermitido = async () => {
    try {
      const coords = await obterLocalizacao()
      
      const { data, error: fetchError } = await useFetch('/api/locais-ponto/verificar', {
        method: 'POST',
        body: coords
      })

      if (fetchError.value) {
        throw new Error(fetchError.value.message || 'Erro ao verificar local')
      }

      return data.value
    } catch (error: any) {
      erro.value = error.message
      throw error
    }
  }

  const verificarSuporteGPS = (): boolean => {
    return 'geolocation' in navigator
  }

  const calcularDistancia = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number => {
    const R = 6371000 // Raio da Terra em metros
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLon = (lon2 - lon1) * Math.PI / 180
    
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2)
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    
    return Math.round(R * c)
  }

  return {
    localizacaoAtual,
    erro,
    carregando,
    obterLocalizacao,
    verificarLocalPermitido,
    calcularDistancia,
    verificarSuporteGPS
  }
}
