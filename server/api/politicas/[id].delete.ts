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

    const id = event.context.params?.id

    await $fetch(
      `${supabaseUrl}/rest/v1/politicas_compliance?id=eq.${id}`,
      {
        method: 'DELETE',
        headers
      }
    )

    return { success: true }
  } catch (error: any) {
    console.error('[DELETE POLÍTICA] Erro:', error.message || error)
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Erro ao excluir política'
    })
  }
})
