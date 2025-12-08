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

    const query = getQuery(event)
    let url = `${supabaseUrl}/rest/v1/politicas_compliance?select=*&order=created_at.desc`

    // Filtros
    if (query.tipo) {
      url += `&tipo=eq.${query.tipo}`
    }
    if (query.status) {
      url += `&status=eq.${query.status}`
    }
    if (query.publicado !== undefined) {
      url += `&publicado=eq.${query.publicado}`
    }
    if (query.categoria) {
      url += `&categoria=eq.${query.categoria}`
    }

    const data = await $fetch<any[]>(url, { headers })
    return data || []
  } catch (error: any) {
    console.error('[GET POLÍTICAS] Erro:', error.message || error)
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Erro ao buscar políticas'
    })
  }
})
