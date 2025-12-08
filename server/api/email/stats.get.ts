export default defineEventHandler(async () => {
  try {
    const config = useRuntimeConfig()
    const supabaseUrl = config.public.supabaseUrl
    const serviceKey = config.supabaseServiceKey

    if (!serviceKey) {
      throw createError({ statusCode: 500, message: 'Service key não configurada' })
    }

    const headers = { 
      'Authorization': `Bearer ${serviceKey}`, 
      'apikey': serviceKey,
      'Prefer': 'count=exact'
    }

    // Buscar primeira empresa
    const empresa = await $fetch<any[]>(`${supabaseUrl}/rest/v1/empresa?select=id&limit=1`, { headers })
    
    if (!empresa || empresa.length === 0) {
      return {
        totalEnviados: 0,
        totalPendentes: 0,
        totalFalhas: 0,
        taxaAbertura: '0.0',
        enviadosHoje: 0,
        totalTemplates: 0
      }
    }

    const empresaId = empresa[0].id

    // Total enviados
    const enviados = await $fetch(
      `${supabaseUrl}/rest/v1/historico_emails?empresa_id=eq.${empresaId}&status=eq.enviado&select=count`,
      { headers }
    )

    // Total pendentes
    const pendentes = await $fetch(
      `${supabaseUrl}/rest/v1/fila_emails?empresa_id=eq.${empresaId}&status=eq.pendente&select=count`,
      { headers }
    )

    // Total falhas
    const falhas = await $fetch(
      `${supabaseUrl}/rest/v1/historico_emails?empresa_id=eq.${empresaId}&status=eq.falha&select=count`,
      { headers }
    )

    // Total abertos
    const abertos = await $fetch(
      `${supabaseUrl}/rest/v1/historico_emails?empresa_id=eq.${empresaId}&status=eq.enviado&aberto_em=not.is.null&select=count`,
      { headers }
    )

    // Enviados hoje
    const hoje = new Date()
    hoje.setHours(0, 0, 0, 0)
    const enviadosHoje = await $fetch(
      `${supabaseUrl}/rest/v1/historico_emails?empresa_id=eq.${empresaId}&status=eq.enviado&enviado_em=gte.${hoje.toISOString()}&select=count`,
      { headers }
    )

    // Total templates
    const templates = await $fetch(
      `${supabaseUrl}/rest/v1/templates_email?empresa_id=eq.${empresaId}&ativo=eq.true&select=count`,
      { headers }
    )

    const totalEnviados = Array.isArray(enviados) ? enviados.length : 0
    const totalAbertos = Array.isArray(abertos) ? abertos.length : 0
    const taxaAbertura = totalEnviados > 0 ? ((totalAbertos / totalEnviados) * 100).toFixed(1) : '0.0'

    return {
      totalEnviados,
      totalPendentes: Array.isArray(pendentes) ? pendentes.length : 0,
      totalFalhas: Array.isArray(falhas) ? falhas.length : 0,
      taxaAbertura,
      enviadosHoje: Array.isArray(enviadosHoje) ? enviadosHoje.length : 0,
      totalTemplates: Array.isArray(templates) ? templates.length : 0
    }
  } catch (error: any) {
    console.error('[GET STATS] Erro:', error.message || error)
    return {
      totalEnviados: 0,
      totalPendentes: 0,
      totalFalhas: 0,
      taxaAbertura: '0.0',
      enviadosHoje: 0,
      totalTemplates: 0
    }
  }
})
