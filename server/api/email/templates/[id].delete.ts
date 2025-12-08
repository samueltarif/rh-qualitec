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
      'apikey': serviceKey
    }

    const id = event.context.params?.id

    // Verifica se é template do sistema
    const template = await $fetch<any[]>(
      `${supabaseUrl}/rest/v1/templates_email?id=eq.${id}&select=sistema`,
      { headers }
    )

    if (template && template.length > 0 && template[0].sistema) {
      throw createError({ 
        statusCode: 403, 
        message: 'Templates do sistema não podem ser excluídos' 
      })
    }

    await $fetch(
      `${supabaseUrl}/rest/v1/templates_email?id=eq.${id}`,
      {
        method: 'DELETE',
        headers
      }
    )

    return { success: true }
  } catch (error: any) {
    console.error('[DELETE TEMPLATE] Erro:', error.message || error)
    throw createError({ 
      statusCode: error.statusCode || 500, 
      message: error.message || 'Erro ao excluir template' 
    })
  }
})
