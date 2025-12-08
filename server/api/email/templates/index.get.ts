export default defineEventHandler(async (event) => {
  try {
    const config = useRuntimeConfig()
    const supabaseUrl = config.public.supabaseUrl
    const serviceKey = config.supabaseServiceKey

    if (!serviceKey) {
      throw createError({ statusCode: 500, message: 'Service key não configurada' })
    }

    const headers = { 'Authorization': `Bearer ${serviceKey}`, 'apikey': serviceKey }
    const query = getQuery(event)
    const categoria = query.categoria as string | undefined

    // Buscar primeira empresa
    const empresa = await $fetch<any[]>(`${supabaseUrl}/rest/v1/empresa?select=id&limit=1`, { headers })
    
    if (!empresa || empresa.length === 0) {
      return []
    }

    let url = `${supabaseUrl}/rest/v1/templates_email?empresa_id=eq.${empresa[0].id}&select=*&order=categoria.asc,nome.asc`
    
    if (categoria) {
      url += `&categoria=eq.${categoria}`
    }

    const templates = await $fetch<any[]>(url, { headers })

    return templates || []
  } catch (error: any) {
    console.error('[GET TEMPLATES] Erro:', error.message || error)
    throw createError({ 
      statusCode: error.statusCode || 500, 
      message: error.message || 'Erro ao buscar templates' 
    })
  }
})
