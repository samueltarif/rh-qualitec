export default defineEventHandler(async () => {
  try {
    const config = useRuntimeConfig()
    const supabaseUrl = config.public.supabaseUrl
    const serviceKey = config.supabaseServiceKey

    if (!serviceKey) {
      throw createError({ statusCode: 500, message: 'Service key não configurada' })
    }

    const headers = { 'Authorization': `Bearer ${serviceKey}`, 'apikey': serviceKey }

    // Buscar primeira empresa
    const empresa = await $fetch<any[]>(`${supabaseUrl}/rest/v1/empresa?select=id&limit=1`, { headers })
    
    if (!empresa || empresa.length === 0) {
      return null
    }

    const comunicacao = await $fetch<any[]>(
      `${supabaseUrl}/rest/v1/configuracoes_comunicacao?empresa_id=eq.${empresa[0].id}&select=*`,
      { headers }
    )

    return comunicacao && comunicacao.length > 0 ? comunicacao[0] : null
  } catch (error: any) {
    console.error('[GET COMUNICACAO] Erro:', error.message || error)
    throw createError({ 
      statusCode: error.statusCode || 500, 
      message: error.message || 'Erro ao buscar configurações de comunicação' 
    })
  }
})
