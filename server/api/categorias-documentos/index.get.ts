export default defineEventHandler(async (event) => {
  try {
    const config = useRuntimeConfig()
    const supabaseUrl = config.public.supabaseUrl
    const serviceKey = config.supabaseServiceKey

    if (!serviceKey) {
      throw createError({ statusCode: 500, message: 'Service key não configurada' })
    }

    const headers = { 'Authorization': `Bearer ${serviceKey}`, 'apikey': serviceKey }

    const data = await $fetch<any[]>(
      `${supabaseUrl}/rest/v1/categorias_documentos?order=ordem.asc`,
      { headers }
    )

    return data || []
  } catch (error: any) {
    console.error('[GET CATEGORIAS] Erro:', error)
    throw createError({ 
      statusCode: error.statusCode || 500, 
      message: error.message || 'Erro ao buscar categorias' 
    })
  }
})
