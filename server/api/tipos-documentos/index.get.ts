export default defineEventHandler(async (event) => {
  try {
    const config = useRuntimeConfig()
    const supabaseUrl = config.public.supabaseUrl
    const serviceKey = config.supabaseServiceKey
    const query = getQuery(event)

    if (!serviceKey) {
      throw createError({ statusCode: 500, message: 'Service key não configurada' })
    }

    const headers = { 'Authorization': `Bearer ${serviceKey}`, 'apikey': serviceKey }

    // Construir query string
    let queryString = 'select=*,categoria:categorias_documentos(id,nome,cor,icone)&order=ordem.asc'
    
    if (query.categoria_id) {
      queryString += `&categoria_id=eq.${query.categoria_id}`
    }
    
    if (query.apenas_ativos === 'true') {
      queryString += '&ativo=eq.true'
    }

    const data = await $fetch<any[]>(
      `${supabaseUrl}/rest/v1/tipos_documentos?${queryString}`,
      { headers }
    )

    return data || []
  } catch (error: any) {
    console.error('[GET TIPOS] Erro:', error)
    throw createError({ 
      statusCode: error.statusCode || 500, 
      message: error.message || 'Erro ao buscar tipos' 
    })
  }
})
