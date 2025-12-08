export interface Ferias {
  id: string
  colaborador_id: string
  colaborador_nome: string
  cargo: string
  departamento: string
  periodo_aquisitivo_inicio: string
  periodo_aquisitivo_fim: string
  data_inicio: string
  data_fim: string
  dias_gozo: number
  dias_solicitados: number
  dias_abono: number
  dias_venda: number
  valor_abono: number
  valor_ferias: number
  valor_terco: number
  valor_total: number
  tipo: string
  vender_dias: boolean
  adiantamento_13: boolean
  status: string
  solicitado_em: string
  aprovado_por: string
  aprovador_nome: string
  aprovado_em: string
  motivo_rejeicao: string
  observacoes: string
  created_at: string
  updated_at: string
}

export interface FeriasStats {
  pendentes: number
  aprovadas: number
  em_gozo: number
  concluidas: number
  rejeitadas: number
  vencendo: number
  total_dias_ano: number
}

export interface ConfigFerias {
  id?: string
  dias_minimos_fracionamento: number
  dias_maximos_venda: number
  antecedencia_minima_dias: number
  permite_fracionamento: boolean
  max_fracoes: number
  permite_abono_pecuniario: boolean
  notificar_vencimento_dias: number
  notificar_aprovador: boolean
  notificar_rh: boolean
  bloquear_ferias_coletivas: boolean
  periodos_bloqueados: string[]
}

export function useFerias() {
  const ferias = ref<Ferias[]>([])
  const stats = ref<FeriasStats>({
    pendentes: 0,
    aprovadas: 0,
    em_gozo: 0,
    concluidas: 0,
    rejeitadas: 0,
    vencendo: 0,
    total_dias_ano: 0,
  })
  const config = ref<ConfigFerias>({
    dias_minimos_fracionamento: 5,
    dias_maximos_venda: 10,
    antecedencia_minima_dias: 30,
    permite_fracionamento: true,
    max_fracoes: 3,
    permite_abono_pecuniario: true,
    notificar_vencimento_dias: 60,
    notificar_aprovador: true,
    notificar_rh: true,
    bloquear_ferias_coletivas: false,
    periodos_bloqueados: [],
  })
  const loading = ref(false)
  const error = ref<string | null>(null)

  const fetchFerias = async (filtros?: { status?: string; colaborador_id?: string; ano?: number }) => {
    loading.value = true
    error.value = null
    try {
      const params = new URLSearchParams()
      if (filtros?.status && filtros.status !== 'todos') {
        params.append('status', filtros.status)
      }
      if (filtros?.colaborador_id) {
        params.append('colaborador_id', filtros.colaborador_id)
      }
      if (filtros?.ano) {
        params.append('ano', filtros.ano.toString())
      }

      const queryString = params.toString()
      const url = queryString ? `/api/ferias?${queryString}` : '/api/ferias'
      const data = await $fetch<Ferias[]>(url)
      ferias.value = data || []
    } catch (e: any) {
      error.value = e.message || 'Erro ao buscar férias'
      console.error('Erro ao buscar férias:', e)
      ferias.value = []
    } finally {
      loading.value = false
    }
  }

  const fetchStats = async () => {
    try {
      const data = await $fetch<FeriasStats>('/api/ferias/stats')
      stats.value = data
    } catch (e: any) {
      console.error('Erro ao buscar estatísticas:', e)
    }
  }

  const fetchConfig = async () => {
    try {
      const data = await $fetch<ConfigFerias>('/api/ferias/config')
      config.value = data
    } catch (e: any) {
      console.error('Erro ao buscar configurações:', e)
    }
  }

  const criarSolicitacao = async (dados: Partial<Ferias>) => {
    loading.value = true
    try {
      const data = await $fetch<Ferias>('/api/ferias', {
        method: 'POST',
        body: dados,
      })
      await fetchFerias()
      await fetchStats()
      return data
    } catch (e: any) {
      error.value = e.message || 'Erro ao criar solicitação'
      throw e
    } finally {
      loading.value = false
    }
  }

  const aprovarFerias = async (id: string) => {
    loading.value = true
    try {
      await $fetch('/api/ferias/aprovar', {
        method: 'POST',
        body: { id, acao: 'aprovar' },
      })
      await fetchFerias()
      await fetchStats()
    } catch (e: any) {
      error.value = e.message || 'Erro ao aprovar férias'
      throw e
    } finally {
      loading.value = false
    }
  }

  const rejeitarFerias = async (id: string, motivo: string) => {
    loading.value = true
    try {
      await $fetch('/api/ferias/aprovar', {
        method: 'POST',
        body: { id, acao: 'rejeitar', motivo_rejeicao: motivo },
      })
      await fetchFerias()
      await fetchStats()
    } catch (e: any) {
      error.value = e.message || 'Erro ao rejeitar férias'
      throw e
    } finally {
      loading.value = false
    }
  }

  const cancelarFerias = async (id: string) => {
    loading.value = true
    try {
      await $fetch(`/api/ferias/${id}`, { method: 'DELETE' })
      await fetchFerias()
      await fetchStats()
    } catch (e: any) {
      error.value = e.message || 'Erro ao cancelar férias'
      throw e
    } finally {
      loading.value = false
    }
  }

  const salvarConfig = async (dados: ConfigFerias) => {
    loading.value = true
    try {
      await $fetch('/api/ferias/config', {
        method: 'PUT',
        body: dados,
      })
      await fetchConfig()
    } catch (e: any) {
      error.value = e.message || 'Erro ao salvar configurações'
      throw e
    } finally {
      loading.value = false
    }
  }

  // Helpers
  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'Pendente': 'warning',
      'Aprovada': 'success',
      'Rejeitada': 'danger',
      'Cancelada': 'default',
      'Em_Andamento': 'info',
      'Concluida': 'success',
    }
    return colors[status] || 'default'
  }

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      'Pendente': 'Pendente',
      'Aprovada': 'Aprovada',
      'Rejeitada': 'Rejeitada',
      'Cancelada': 'Cancelada',
      'Em_Andamento': 'Em Gozo',
      'Concluida': 'Concluída',
    }
    return labels[status] || status
  }

  const getTipoLabel = (tipo: string) => {
    const tipos: Record<string, string> = {
      'normal': 'Normal',
      'fracionada': 'Fracionada',
      'abono_pecuniario': 'Com Abono Pecuniário',
      'coletiva': 'Coletiva',
    }
    return tipos[tipo] || 'Normal'
  }

  const formatDate = (date: string) => {
    if (!date) return '-'
    return new Date(date).toLocaleDateString('pt-BR')
  }

  return {
    ferias,
    stats,
    config,
    loading,
    error,
    fetchFerias,
    fetchStats,
    fetchConfig,
    criarSolicitacao,
    aprovarFerias,
    rejeitarFerias,
    cancelarFerias,
    salvarConfig,
    getStatusColor,
    getStatusLabel,
    getTipoLabel,
    formatDate,
  }
}
