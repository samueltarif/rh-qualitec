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
      'Prefer': 'count=exact'
    }

    const query = getQuery(event)
    const limit = parseInt(query.limit as string) || 50
    const offset = parseInt(query.offset as string) || 0
    const status = query.status as string | undefined
    const contexto = query.contexto as string | undefined

    // Buscar primeira empresa
    const empresa = await $fetch<any[]>(`${supabaseUrl}/rest/v1/empresa?select=id&limit=1`, { headers })
    
    if (!empresa || empresa.length === 0) {
      return {
        data: [],
        total: 0,
        limit,
        offset
      }
    }

    let url = `${supabaseUrl}/rest/v1/historico_emails?empresa_id=eq.${empresa[0].id}&select=*,templates_email(nome)&order=created_at.desc&limit=${limit}&offset=${offset}`
    
    if (status) {
      url += `&status=eq.${status}`
    }
    
    if (contexto) {
      url += `&contexto=eq.${contexto}`
    }

    const historico = await $fetch<any[]>(url, { headers })

    return {
      data: historico || [],
      total: historico?.length || 0,
      limit,
      offset
    }
  } catch (error: any) {
    console.error('[GET HISTORICO] Erro:', error.message || error)
    return {
      data: [],
      total: 0,
      limit: 50,
      offset: 0
    }
  }
})
