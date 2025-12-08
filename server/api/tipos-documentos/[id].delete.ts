export default defineEventHandler(async (event) => {
  try {
    const config = useRuntimeConfig()
    const supabaseUrl = config.public.supabaseUrl
    const serviceKey = config.supabaseServiceKey
    const id = getRouterParam(event, 'id')

    if (!serviceKey) {
      throw createError({ statusCode: 500, message: 'Service key não configurada' })
    }

    const headers = { 
      'Authorization': `Bearer ${serviceKey}`, 
      'apikey': serviceKey
    }

    await $fetch(
      `${supabaseUrl}/rest/v1/tipos_documentos?id=eq.${id}`,
      { 
        method: 'DELETE',
        headers
      }
    )

    return { success: true }
  } catch (error: any) {
    console.error('[DELETE TIPO] Erro:', error)
    throw createError({ 
      statusCode: error.statusCode || 500, 
      message: error.message || 'Erro ao excluir tipo' 
    })
  }
})
