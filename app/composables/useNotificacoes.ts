export interface NotificacoesConfig {
  notificar_documentos_vencendo: boolean
  dias_antecedencia_documentos: number
  notificar_contratos_vencendo: boolean
  dias_antecedencia_contratos: number
  notificar_ferias_vencendo: boolean
  dias_antecedencia_ferias: number
  notificar_ferias_programadas: boolean
  dias_antecedencia_ferias_programadas: number
  notificar_aniversarios: boolean
  dias_antecedencia_aniversarios: number
  notificar_aniversarios_empresa: boolean
  dias_antecedencia_aniversarios_empresa: number
  notificar_exames_vencendo: boolean
  dias_antecedencia_exames: number
  notificar_experiencia_vencendo: boolean
  dias_antecedencia_experiencia: number
  notificar_faltas_injustificadas: boolean
  notificar_atrasos_frequentes: boolean
  limite_atrasos_mes: number
  notificar_horas_extras_excessivas: boolean
  limite_horas_extras_mes: number
  notificar_folha_processada: boolean
  notificar_erros_folha: boolean
  notificar_afastamentos_longos: boolean
  dias_afastamento_longo: number
  notificar_retorno_afastamento: boolean
  dias_antecedencia_retorno: number
  notificar_certificados_vencendo: boolean
  dias_antecedencia_certificados: number
  enviar_email: boolean
  enviar_sistema: boolean
  enviar_push: boolean
  notificar_rh: boolean
  notificar_gestor: boolean
  notificar_colaborador: boolean
  horario_envio_diario: string
  dias_envio_semanal: number[]
  enviar_resumo_diario: boolean
  horario_resumo_diario: string
}

export interface NotificacoesStats {
  total: number
  pendentes: number
  lidos: number
  resolvidos: number
  ignorados: number
  criticos: number
  altos: number
  medios: number
  baixos: number
}

export interface Alerta {
  id: string
  titulo: string
  mensagem: string
  prioridade: string
  status: string
  data_vencimento?: string
  created_at: string
  tipo_alerta_id?: string
  colaborador_id?: string
  tipo_alerta?: { icone: string; cor: string; nome: string }
  colaborador?: { nome: string }
}

const defaultConfig: NotificacoesConfig = {
  notificar_documentos_vencendo: true,
  dias_antecedencia_documentos: 30,
  notificar_contratos_vencendo: true,
  dias_antecedencia_contratos: 60,
  notificar_ferias_vencendo: true,
  dias_antecedencia_ferias: 30,
  notificar_ferias_programadas: true,
  dias_antecedencia_ferias_programadas: 15,
  notificar_aniversarios: true,
  dias_antecedencia_aniversarios: 1,
  notificar_aniversarios_empresa: true,
  dias_antecedencia_aniversarios_empresa: 7,
  notificar_exames_vencendo: true,
  dias_antecedencia_exames: 30,
  notificar_experiencia_vencendo: true,
  dias_antecedencia_experiencia: 15,
  notificar_faltas_injustificadas: true,
  notificar_atrasos_frequentes: true,
  limite_atrasos_mes: 3,
  notificar_horas_extras_excessivas: true,
  limite_horas_extras_mes: 40,
  notificar_folha_processada: true,
  notificar_erros_folha: true,
  notificar_afastamentos_longos: true,
  dias_afastamento_longo: 15,
  notificar_retorno_afastamento: true,
  dias_antecedencia_retorno: 3,
  notificar_certificados_vencendo: true,
  dias_antecedencia_certificados: 60,
  enviar_email: true,
  enviar_sistema: true,
  enviar_push: false,
  notificar_rh: true,
  notificar_gestor: true,
  notificar_colaborador: false,
  horario_envio_diario: '08:00:00',
  dias_envio_semanal: [1, 2, 3, 4, 5],
  enviar_resumo_diario: true,
  horario_resumo_diario: '07:00:00',
}

export const useNotificacoes = () => {
  const config = ref<NotificacoesConfig>({ ...defaultConfig })
  const stats = ref<NotificacoesStats>({
    total: 0, pendentes: 0, lidos: 0, resolvidos: 0, ignorados: 0,
    criticos: 0, altos: 0, medios: 0, baixos: 0,
  })
  const alertas = ref<Alerta[]>([])
  const tiposAlertas = ref<any[]>([])
  const loading = ref(false)

  const carregarConfig = async () => {
    try {
      const data = await $fetch('/api/notificacoes/config')
      if (data) config.value = { ...config.value, ...data }
    } catch (e) { console.error('Erro ao carregar config:', e) }
  }

  const salvarConfig = async () => {
    await $fetch('/api/notificacoes/config', { method: 'PUT', body: config.value })
  }

  const carregarStats = async () => {
    try {
      const data = await $fetch('/api/alertas/stats')
      if (data) stats.value = data as NotificacoesStats
    } catch (e) { console.error('Erro ao carregar stats:', e) }
  }

  const carregarAlertas = async (filtros?: { status?: string; prioridade?: string }) => {
    try {
      const params: Record<string, string> = {}
      if (filtros?.status && filtros.status !== 'todos') params.status = filtros.status
      if (filtros?.prioridade && filtros.prioridade !== 'todas') params.prioridade = filtros.prioridade
      alertas.value = await $fetch('/api/alertas', { params }) as Alerta[]
    } catch (e) { alertas.value = [] }
  }

  const carregarTiposAlertas = async () => {
    try {
      tiposAlertas.value = await $fetch('/api/alertas/tipos') as any[]
    } catch (e) { tiposAlertas.value = [] }
  }

  const gerarAlertas = async () => {
    const result = await $fetch('/api/alertas/gerar', { method: 'POST' })
    await carregarStats()
    await carregarAlertas()
    return result
  }

  const marcarAlerta = async (id: string, status: string) => {
    await $fetch(`/api/alertas/${id}`, { method: 'PUT', body: { status } })
    await carregarStats()
    await carregarAlertas()
  }

  const salvarAlerta = async (dados: Partial<Alerta>, id?: string) => {
    if (id) {
      await $fetch(`/api/alertas/${id}`, { method: 'PUT', body: dados })
    } else {
      await $fetch('/api/alertas', { method: 'POST', body: dados })
    }
    await carregarStats()
    await carregarAlertas()
  }

  const excluirAlerta = async (id: string) => {
    await $fetch(`/api/alertas/${id}`, { method: 'DELETE' })
    await carregarStats()
    await carregarAlertas()
  }

  return {
    config, stats, alertas, tiposAlertas, loading,
    carregarConfig, salvarConfig, carregarStats, carregarAlertas,
    carregarTiposAlertas, gerarAlertas, marcarAlerta, salvarAlerta, excluirAlerta,
  }
}
