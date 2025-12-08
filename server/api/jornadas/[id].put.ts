/**
 * API para atualizar jornada de trabalho
 */
export default defineEventHandler(async (event) => {
  try {
    const id = getRouterParam(event, 'id')
    const body = await readBody(event)
    
    if (!id) {
      throw createError({ statusCode: 400, message: 'ID da jornada é obrigatório' })
    }

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

    // Remover campos que não devem ser atualizados
    const { id: _, created_at, ...dadosAtualizaveis } = body

    const jornada = await $fetch<any[]>(
      `${supabaseUrl}/rest/v1/jornadas_trabalho?id=eq.${id}`,
      {
        method: 'PATCH',
        headers,
        body: { ...dadosAtualizaveis, updated_at: new Date().toISOString() }
      }
    )

    return { success: true, data: jornada?.[0] }
  } catch (error: any) {
    console.error('[UPDATE JORNADA] Erro:', error.message || error)
    throw createError({ 
      statusCode: error.statusCode || 500, 
      message: error.message || 'Erro ao atualizar jornada' 
    })
  }
})
