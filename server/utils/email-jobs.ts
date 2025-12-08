import { getEmailService, EmailService } from './email-service'

/**
 * Job para enviar e-mails de aniversário
 * Deve ser executado diariamente
 */
export async function jobAniversarios() {
  try {
    console.log('🎂 Iniciando job de aniversários...')

    const config = useRuntimeConfig()
    const supabaseUrl = config.public.supabaseUrl
    const serviceKey = config.supabaseServiceKey

    if (!serviceKey) {
      console.warn('⚠️ Service key não configurada')
      return
    }

    const headers = { 
      'Authorization': `Bearer ${serviceKey}`, 
      'apikey': serviceKey 
    }

    // Buscar empresa
    const empresa = await $fetch<any[]>(
      `${supabaseUrl}/rest/v1/empresa?select=id&limit=1`,
      { headers }
    )

    if (!empresa || empresa.length === 0) return

    // Buscar configurações de comunicação
    const config_com = await $fetch<any[]>(
      `${supabaseUrl}/rest/v1/configuracoes_comunicacao?empresa_id=eq.${empresa[0].id}&select=*`,
      { headers }
    )

    if (!config_com || config_com.length === 0 || !config_com[0].notificar_aniversario) {
      console.log('ℹ️ Notificação de aniversário desativada')
      return
    }

    const diasAntes = config_com[0].dias_alerta_aniversario || 3

    // Buscar colaboradores com aniversário nos próximos N dias
    const hoje = new Date()
    const dataInicio = new Date(hoje)
    const dataFim = new Date(hoje)
    dataFim.setDate(dataFim.getDate() + diasAntes)

    // Query para buscar aniversários (simplificada)
    const colaboradores = await $fetch<any[]>(
      `${supabaseUrl}/rest/v1/colaboradores?empresa_id=eq.${empresa[0].id}&select=*`,
      { headers }
    )

    if (!colaboradores) return

    // Filtrar aniversários
    const aniversariantes = colaboradores.filter(col => {
      if (!col.data_nascimento) return false

      const dataNasc = new Date(col.data_nascimento)
      const mesAno = `${String(dataNasc.getMonth() + 1).padStart(2, '0')}-${String(dataNasc.getDate()).padStart(2, '0')}`
      const mesAnoHoje = `${String(hoje.getMonth() + 1).padStart(2, '0')}-${String(hoje.getDate()).padStart(2, '0')}`
      const mesAnoFim = `${String(dataFim.getMonth() + 1).padStart(2, '0')}-${String(dataFim.getDate()).padStart(2, '0')}`

      return mesAno >= mesAnoHoje && mesAno <= mesAnoFim
    })

    console.log(`📧 Encontrados ${aniversariantes.length} aniversariantes`)

    // Buscar template
    const template = await $fetch<any[]>(
      `${supabaseUrl}/rest/v1/templates_email?empresa_id=eq.${empresa[0].id}&codigo=eq.aniversario&select=*`,
      { headers }
    )

    if (!template || template.length === 0) {
      console.warn('⚠️ Template de aniversário não encontrado')
      return
    }

    // Enviar e-mails
    const emailService = await getEmailService()
    let enviados = 0

    for (const colaborador of aniversariantes) {
      if (!colaborador.email) continue

      const variaveis = {
        nome_colaborador: colaborador.nome,
        nome_empresa: empresa[0].razao_social || 'Empresa'
      }

      const assunto = EmailService.processarTemplate(template[0].assunto, variaveis)
      const corpo_html = EmailService.processarTemplate(template[0].corpo_html, variaveis)

      const sucesso = await emailService.enviar({
        destinatario: colaborador.email,
        assunto,
        corpo_html
      })

      if (sucesso) {
        enviados++

        // Registrar no histórico
        await $fetch(
          `${supabaseUrl}/rest/v1/historico_emails`,
          {
            method: 'POST',
            headers: { ...headers, 'Content-Type': 'application/json' },
            body: {
              empresa_id: empresa[0].id,
              template_id: template[0].id,
              destinatario_email: colaborador.email,
              destinatario_nome: colaborador.nome,
              destinatario_tipo: 'colaborador',
              destinatario_id: colaborador.id,
              assunto,
              corpo_html,
              status: 'enviado',
              enviado_em: new Date().toISOString(),
              contexto: 'aniversario',
              contexto_id: colaborador.id
            }
          }
        ).catch(err => console.error('Erro ao registrar histórico:', err))
      }
    }

    console.log(`✅ ${enviados} e-mails de aniversário enviados`)
  } catch (error) {
    console.error('❌ Erro no job de aniversários:', error)
  }
}

/**
 * Job para enviar alertas de férias vencendo
 */
export async function jobFeriasVencendo() {
  try {
    console.log('🏖️ Iniciando job de férias vencendo...')

    const config = useRuntimeConfig()
    const supabaseUrl = config.public.supabaseUrl
    const serviceKey = config.supabaseServiceKey

    if (!serviceKey) return

    const headers = { 
      'Authorization': `Bearer ${serviceKey}`, 
      'apikey': serviceKey 
    }

    // Buscar empresa
    const empresa = await $fetch<any[]>(
      `${supabaseUrl}/rest/v1/empresa?select=id&limit=1`,
      { headers }
    )

    if (!empresa || empresa.length === 0) return

    // Buscar configurações
    const config_com = await $fetch<any[]>(
      `${supabaseUrl}/rest/v1/configuracoes_comunicacao?empresa_id=eq.${empresa[0].id}&select=*`,
      { headers }
    )

    if (!config_com || config_com.length === 0 || !config_com[0].notificar_ferias_vencendo) {
      return
    }

    const diasAntes = config_com[0].dias_alerta_ferias || 30

    // Aqui você buscaria as férias vencendo
    // Este é um exemplo simplificado
    console.log(`✅ Job de férias vencendo concluído`)
  } catch (error) {
    console.error('❌ Erro no job de férias vencendo:', error)
  }
}

/**
 * Job para enviar alertas de documentos vencendo
 */
export async function jobDocumentosVencendo() {
  try {
    console.log('📄 Iniciando job de documentos vencendo...')

    const config = useRuntimeConfig()
    const supabaseUrl = config.public.supabaseUrl
    const serviceKey = config.supabaseServiceKey

    if (!serviceKey) return

    const headers = { 
      'Authorization': `Bearer ${serviceKey}`, 
      'apikey': serviceKey 
    }

    // Buscar empresa
    const empresa = await $fetch<any[]>(
      `${supabaseUrl}/rest/v1/empresa?select=id&limit=1`,
      { headers }
    )

    if (!empresa || empresa.length === 0) return

    // Buscar configurações
    const config_com = await $fetch<any[]>(
      `${supabaseUrl}/rest/v1/configuracoes_comunicacao?empresa_id=eq.${empresa[0].id}&select=*`,
      { headers }
    )

    if (!config_com || config_com.length === 0 || !config_com[0].notificar_documentos_vencendo) {
      return
    }

    const diasAntes = config_com[0].dias_alerta_documentos || 15

    // Aqui você buscaria os documentos vencendo
    console.log(`✅ Job de documentos vencendo concluído`)
  } catch (error) {
    console.error('❌ Erro no job de documentos vencendo:', error)
  }
}

/**
 * Executa todos os jobs
 */
export async function executarTodosOsJobs() {
  console.log('🚀 Executando todos os jobs de e-mail...')
  
  await jobAniversarios()
  await jobFeriasVencendo()
  await jobDocumentosVencendo()
  
  console.log('✅ Todos os jobs concluídos')
}
