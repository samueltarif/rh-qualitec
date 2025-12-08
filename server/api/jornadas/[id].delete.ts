/**
 * API para excluir/desativar jornada de trabalho
 */
export default defineEventHandler(async (event) => {
  try {
    const id = getRouterParam(event, 'id')
    
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

    // Soft delete - apenas desativa
    const jornada = await $fetch<any[]>(
      `${supabaseUrl}/rest/v1/jornadas_trabalho?id=eq.${id}`,
      {
        method: 'PATCH',
        headers,
        body: { ativo: false, updated_at: new Date().toISOString() }
      }
    )

    return { success: true, message: 'Jornada desativada com sucesso' }
  } catch (error: any) {
    console.error('[DELETE JORNADA] Erro:', error.message || error)
    throw createError({ 
      statusCode: error.statusCode || 500, 
      message: error.message || 'Erro ao excluir jornada' 
    })
  }
})
