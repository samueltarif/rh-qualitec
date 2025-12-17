export interface PerfilFuncionario {
  appUser: {
    id: string
    colaborador_id: string
    nome: string
    email: string
    role: string
  }
  colaborador: {
    id: string
    nome: string
    cpf: string
    matricula: string
    email_corporativo: string
    telefone: string
    data_nascimento: string
    data_admissao: string
    salario: number
    status: string
    foto_url: string
    cargo: { id: string; nome: string }
    departamento: { id: string; nome: string }
    jornada: { id: string; nome: string; carga_horaria_semanal: number }
  } | null
}

export interface Solicitacao {
  id: string
  tipo: string
  titulo: string
  descricao: string
  status: string
  prioridade: string
  data_solicitacao: string
  data_resposta: string
  resposta: string
  motivo_rejeicao: string
  respondido: { nome: string }
  created_at: string
}

// Importar interface do pontoCalculos.ts
import type { RegistroPonto } from '~/utils/pontoCalculos'

export interface DocumentoFuncionario {
  id: string
  tipo: string
  titulo: string
  descricao: string
  competencia: string
  ano_referencia: number
  arquivo_url: string
  arquivo_nome: string
  created_at: string
}

export interface Comunicado {
  id: string
  titulo: string
  conteudo: string
  tipo: string
  data_publicacao: string
  publicado: { nome: string }
  lido: boolean
}

export interface StatsFuncionario {
  banco_horas: string
  dias_ferias: number
  solicitacoes_pendentes: number
  documentos_novos: number
  comunicados_nao_lidos: number
}

export const useFuncionario = () => {
  const perfil = ref<PerfilFuncionario | null>(null)
  const solicitacoes = ref<Solicitacao[]>([])
  const registrosPonto = ref<RegistroPonto[]>([])
  const documentos = ref<DocumentoFuncionario[]>([])
  const comunicados = ref<Comunicado[]>([])
  const stats = ref<StatsFuncionario>({
    banco_horas: '00:00',
    dias_ferias: 0,
    solicitacoes_pendentes: 0,
    documentos_novos: 0,
    comunicados_nao_lidos: 0
  })
  const loading = ref(false)
  const error = ref<string | null>(null)

  const fetchPerfil = async () => {
    try {
      const data = await $fetch<PerfilFuncionario>('/api/funcionario/perfil')
      perfil.value = data
    } catch (e: any) {
      console.error('Erro ao buscar perfil:', e)
      error.value = e.message
    }
  }

  const fetchStats = async () => {
    try {
      const data = await $fetch<StatsFuncionario>('/api/funcionario/stats')
      stats.value = data
    } catch (e: any) {
      console.error('Erro ao buscar stats:', e)
    }
  }

  const fetchSolicitacoes = async (filtros?: { status?: string; tipo?: string }) => {
    loading.value = true
    try {
      const params = new URLSearchParams()
      if (filtros?.status) params.append('status', filtros.status)
      if (filtros?.tipo) params.append('tipo', filtros.tipo)
      
      const data = await $fetch<Solicitacao[]>(`/api/funcionario/solicitacoes?${params}`)
      solicitacoes.value = data
    } catch (e: any) {
      console.error('Erro ao buscar solicitações:', e)
      error.value = e.message
    } finally {
      loading.value = false
    }
  }

  const criarSolicitacao = async (dados: Partial<Solicitacao>) => {
    loading.value = true
    try {
      const data = await $fetch<Solicitacao>('/api/funcionario/solicitacoes', {
        method: 'POST',
        body: dados
      })
      await fetchSolicitacoes()
      await fetchStats()
      return data
    } catch (e: any) {
      error.value = e.message
      throw e
    } finally {
      loading.value = false
    }
  }

  const fetchPonto = async (mes?: number, ano?: number) => {
    loading.value = true
    try {
      const params = new URLSearchParams()
      if (mes) params.append('mes', mes.toString())
      if (ano) params.append('ano', ano.toString())
      
      // Forçar não cachear
      params.append('_t', Date.now().toString())
      
      const data = await $fetch<RegistroPonto[]>(`/api/funcionario/ponto?${params}`, {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache'
        }
      })
      
      console.log('🔄 [FETCH PONTO] Registros recebidos:', data?.length || 0)
      registrosPonto.value = data
    } catch (e: any) {
      console.error('Erro ao buscar ponto:', e)
      error.value = e.message
    } finally {
      loading.value = false
    }
  }

  const registrarPonto = async (dados?: { ip?: string; localizacao?: any }) => {
    loading.value = true
    try {
      const result = await $fetch<any>('/api/funcionario/ponto/registrar', {
        method: 'POST',
        body: dados || {}
      })
      await fetchPonto()
      return result
    } catch (e: any) {
      error.value = e.message
      throw e
    } finally {
      loading.value = false
    }
  }

  const fetchDocumentos = async (filtros?: { tipo?: string; ano?: string }) => {
    loading.value = true
    try {
      const params = new URLSearchParams()
      if (filtros?.tipo) params.append('tipo', filtros.tipo)
      if (filtros?.ano) params.append('ano', filtros.ano)
      
      const data = await $fetch<DocumentoFuncionario[]>(`/api/funcionario/documentos?${params}`)
      documentos.value = data
    } catch (e: any) {
      console.error('Erro ao buscar documentos:', e)
      error.value = e.message
    } finally {
      loading.value = false
    }
  }

  const fetchComunicados = async () => {
    try {
      const data = await $fetch<Comunicado[]>('/api/funcionario/comunicados')
      comunicados.value = data
    } catch (e: any) {
      console.error('Erro ao buscar comunicados:', e)
    }
  }

  const marcarComunicadoLido = async (id: string) => {
    try {
      await $fetch(`/api/funcionario/comunicados/${id}/ler`, { method: 'POST' })
      await fetchComunicados()
      await fetchStats()
    } catch (e: any) {
      console.error('Erro ao marcar comunicado como lido:', e)
    }
  }

  // Helpers
  const getTipoSolicitacaoLabel = (tipo: string) => {
    const tipos: Record<string, string> = {
      'ferias': 'Férias',
      'abono': 'Abono',
      'atestado': 'Atestado',
      'declaracao': 'Declaração',
      'alteracao_dados': 'Alteração de Dados',
      'holerite': 'Holerite',
      'informe_rendimentos': 'Informe de Rendimentos',
      'carta_referencia': 'Carta de Referência',
      'outros': 'Outros'
    }
    return tipos[tipo] || tipo
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'Pendente': 'warning',
      'Em_Analise': 'info',
      'Aprovada': 'success',
      'Rejeitada': 'danger',
      'Cancelada': 'default',
      'Concluida': 'success'
    }
    return colors[status] || 'default'
  }

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      'Pendente': 'Pendente',
      'Em_Analise': 'Em Análise',
      'Aprovada': 'Aprovada',
      'Rejeitada': 'Rejeitada',
      'Cancelada': 'Cancelada',
      'Concluida': 'Concluída'
    }
    return labels[status] || status
  }

  const formatDate = (date: string) => {
    if (!date) return '-'
    return new Date(date).toLocaleDateString('pt-BR')
  }

  const formatTime = (time: string) => {
    if (!time) return '-'
    return time.substring(0, 5)
  }

  return {
    perfil,
    solicitacoes,
    registrosPonto,
    documentos,
    comunicados,
    stats,
    loading,
    error,
    fetchPerfil,
    fetchStats,
    fetchSolicitacoes,
    criarSolicitacao,
    fetchPonto,
    registrarPonto,
    fetchDocumentos,
    fetchComunicados,
    marcarComunicadoLido,
    getTipoSolicitacaoLabel,
    getStatusColor,
    getStatusLabel,
    formatDate,
    formatTime
  }
}
