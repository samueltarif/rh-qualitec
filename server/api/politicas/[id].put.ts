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
      'Content-Type': 'application/json',
      'Prefer': 'return=representation'
    }

    const id = event.context.params?.id
    const body = await readBody(event)

    const data = await $fetch<any[]>(
      `${supabaseUrl}/rest/v1/politicas_compliance?id=eq.${id}`,
      {
        method: 'PATCH',
        headers,
        body: {
          ...body,
          updated_at: new Date().toISOString()
        }
      }
    )

    return data && data.length > 0 ? data[0] : data
  } catch (error: any) {
    console.error('[PUT POLÍTICA] Erro:', error.message || error)
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Erro ao atualizar política'
    })
  }
})
