export default defineEventHandler(async () => {
  try {
    const config = useRuntimeConfig()
    const supabaseUrl = config.public.supabaseUrl
    const serviceKey = config.supabaseServiceKey

    if (!serviceKey) {
      throw createError({ statusCode: 500, message: 'Service key não configurada' })
    }

    const headers = { 'Authorization': `Bearer ${serviceKey}`, 'apikey': serviceKey }

    // Buscar primeira empresa (simplificado)
    const empresa = await $fetch<any[]>(`${supabaseUrl}/rest/v1/empresa?select=id&limit=1`, { headers })
    
    if (!empresa || empresa.length === 0) {
      return null
    }

    const smtp = await $fetch<any[]>(
      `${supabaseUrl}/rest/v1/configuracoes_smtp?empresa_id=eq.${empresa[0].id}&select=*`,
      { headers }
    )

    return smtp && smtp.length > 0 ? smtp[0] : null
  } catch (error: any) {
    console.error('[GET SMTP] Erro:', error.message || error)
    throw createError({ 
      statusCode: error.statusCode || 500, 
      message: error.message || 'Erro ao buscar configurações SMTP' 
    })
  }
})
