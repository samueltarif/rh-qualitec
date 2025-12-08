export default defineEventHandler(async (event) => {
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
      'Content-Type': 'application/json'
    }

    // Total de políticas
    const politicas = await $fetch<any[]>(
      `${supabaseUrl}/rest/v1/politicas_compliance?select=id,status,publicado,obrigatorio_aceite`,
      { headers }
    )

    // Aceites
    const aceites = await $fetch<any[]>(
      `${supabaseUrl}/rest/v1/politicas_aceites?select=aceito,atrasado,prazo_aceite`,
      { headers }
    )

    // Incidentes
    const incidentes = await $fetch<any[]>(
      `${supabaseUrl}/rest/v1/politicas_incidentes?select=status,gravidade`,
      { headers }
    )

    // Treinamentos
    const treinamentos = await $fetch<any[]>(
      `${supabaseUrl}/rest/v1/politicas_treinamentos?select=id,ativo`,
      { headers }
    )

    const stats = {
      totalPoliticas: politicas?.length || 0,
      politicasPublicadas: politicas?.filter(p => p.publicado).length || 0,
      politicasRascunho: politicas?.filter(p => p.status === 'rascunho').length || 0,
      politicasObrigatorias: politicas?.filter(p => p.obrigatorio_aceite).length || 0,
      
      totalAceites: aceites?.length || 0,
      aceitesCompletos: aceites?.filter(a => a.aceito).length || 0,
      aceitesPendentes: aceites?.filter(a => !a.aceito).length || 0,
      aceitesAtrasados: aceites?.filter(a => a.atrasado).length || 0,
      taxaAceite: aceites?.length > 0 
        ? ((aceites.filter(a => a.aceito).length / aceites.length) * 100).toFixed(1)
        : '0.0',
      
      totalIncidentes: incidentes?.length || 0,
      incidentesAbertos: incidentes?.filter(i => i.status === 'aberto').length || 0,
      incidentesCriticos: incidentes?.filter(i => i.gravidade === 'critica').length || 0,
      
      totalTreinamentos: treinamentos?.length || 0,
      treinamentosAtivos: treinamentos?.filter(t => t.ativo).length || 0
    }

    return stats
  } catch (error: any) {
    console.error('[GET STATS POLÍTICAS] Erro:', error.message || error)
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Erro ao buscar estatísticas'
    })
  }
})
