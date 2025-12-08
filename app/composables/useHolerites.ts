export const useHolerites = () => {
  const loading = ref(false)
  const holerites = ref<any[]>([])
  const error = ref<string | null>(null)

  // Buscar holerites
  const buscarHolerites = async (filtros?: {
    colaborador_id?: string
    mes?: number
    ano?: number
    tipo?: string
    status?: string
  }) => {
    loading.value = true
    error.value = null

    try {
      let url = '/api/holerites'
      const params = new URLSearchParams()

      if (filtros?.colaborador_id) params.append('colaborador_id', filtros.colaborador_id)
      if (filtros?.mes) params.append('mes', filtros.mes.toString())
      if (filtros?.ano) params.append('ano', filtros.ano.toString())
      if (filtros?.tipo) params.append('tipo', filtros.tipo)
      if (filtros?.status) params.append('status', filtros.status)

      if (params.toString()) {
        url += `?${params.toString()}`
      }

      const response = await $fetch(url) as any
      holerites.value = response.data || response || []
      return response.data || response
    } catch (err: any) {
      error.value = err.message || 'Erro ao buscar holerites'
      throw err
    } finally {
      loading.value = false
    }
  }

  // Buscar holerite por ID
  const buscarHoleritePorId = async (id: string) => {
    loading.value = true
    error.value = null

    try {
      const data = await $fetch(`/api/holerites/${id}`)
      return data
    } catch (err: any) {
      error.value = err.message || 'Erro ao buscar holerite'
      throw err
    } finally {
      loading.value = false
    }
  }

  // Excluir holerite
  const excluirHolerite = async (id: string) => {
    loading.value = true
    error.value = null

    try {
      const data = await $fetch(`/api/holerites/${id}`, {
        method: 'DELETE'
      })
      
      // Remover da lista local
      holerites.value = holerites.value.filter(h => h.id !== id)
      
      return data
    } catch (err: any) {
      error.value = err.message || 'Erro ao excluir holerite'
      throw err
    } finally {
      loading.value = false
    }
  }

  // Gerar holerites
  const gerarHolerites = async (dados: {
    colaboradores_ids: string[]
    mes: number
    ano: number
    tipo?: string
  }) => {
    loading.value = true
    error.value = null

    try {
      const data = await $fetch('/api/holerites/gerar', {
        method: 'POST',
        body: dados
      })
      return data
    } catch (err: any) {
      error.value = err.message || 'Erro ao gerar holerites'
      throw err
    } finally {
      loading.value = false
    }
  }

  // Enviar holerite por email
  const enviarHoleritePorEmail = async (id: string) => {
    loading.value = true
    error.value = null

    try {
      const data = await $fetch('/api/holerites/enviar-email', {
        method: 'POST',
        body: { holerite_id: id }
      })
      return data
    } catch (err: any) {
      error.value = err.message || 'Erro ao enviar holerite'
      throw err
    } finally {
      loading.value = false
    }
  }

  // Gerar 13º salário
  const gerar13Salario = async (dados: {
    colaboradores_ids: string[]
    parcela: '1' | '2' | 'integral'
    ano: number
  }) => {
    loading.value = true
    error.value = null

    try {
      const data = await $fetch('/api/decimo-terceiro/gerar', {
        method: 'POST',
        body: dados
      })
      return data
    } catch (err: any) {
      error.value = err.message || 'Erro ao gerar 13º salário'
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    loading,
    holerites,
    error,
    buscarHolerites,
    buscarHoleritePorId,
    excluirHolerite,
    gerarHolerites,
    enviarHoleritePorEmail,
    gerar13Salario
  }
}
