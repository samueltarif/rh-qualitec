import { serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const client = await serverSupabaseClient(event)

  // Buscar configurações de notificações
  const { data, error } = await client
    .from('configuracoes_notificacoes')
    .select('*')
    .limit(1)
    .single()

  if (error && error.code !== 'PGRST116') {
    throw createError({ statusCode: 500, message: error.message })
  }

  // Se não existir, retornar valores padrão
  if (!data) {
    return {
      // Documentos
      notificar_documentos_vencendo: true,
      dias_antecedencia_documentos: 30,
      
      // Contratos
      notificar_contratos_vencendo: true,
      dias_antecedencia_contratos: 60,
      
      // Férias
      notificar_ferias_vencendo: true,
      dias_antecedencia_ferias: 30,
      notificar_ferias_programadas: true,
      dias_antecedencia_ferias_programadas: 15,
      
      // Aniversários
      notificar_aniversarios: true,
      dias_antecedencia_aniversarios: 1,
      notificar_aniversarios_empresa: true,
      dias_antecedencia_aniversarios_empresa: 7,
      
      // Exames
      notificar_exames_vencendo: true,
      dias_antecedencia_exames: 30,
      
      // Experiência
      notificar_experiencia_vencendo: true,
      dias_antecedencia_experiencia: 15,
      
      // Ponto
      notificar_faltas_injustificadas: true,
      notificar_atrasos_frequentes: true,
      limite_atrasos_mes: 3,
      notificar_horas_extras_excessivas: true,
      limite_horas_extras_mes: 40,
      
      // Folha
      notificar_folha_processada: true,
      notificar_erros_folha: true,
      
      // Afastamentos
      notificar_afastamentos_longos: true,
      dias_afastamento_longo: 15,
      notificar_retorno_afastamento: true,
      dias_antecedencia_retorno: 3,
      
      // Treinamentos
      notificar_certificados_vencendo: true,
      dias_antecedencia_certificados: 60,
      
      // Canais
      enviar_email: true,
      enviar_sistema: true,
      enviar_push: false,
      
      // Destinatários
      notificar_rh: true,
      notificar_gestor: true,
      notificar_colaborador: false,
      
      // Horários
      horario_envio_diario: '08:00:00',
      dias_envio_semanal: [1, 2, 3, 4, 5],
      enviar_resumo_diario: true,
      horario_resumo_diario: '07:00:00',
    }
  }

  return data
})
