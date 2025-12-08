/**
 * API para buscar parâmetros de folha
 */
export default defineEventHandler(async (event) => {
  try {
    const config = useRuntimeConfig()
    const supabaseUrl = config.public.supabaseUrl
    const serviceKey = config.supabaseServiceKey

    if (!serviceKey) {
      throw createError({ statusCode: 500, message: 'Service key não configurada' })
    }

    const headers = { 'Authorization': `Bearer ${serviceKey}`, 'apikey': serviceKey }

    // Buscar parâmetros ativos
    const parametros = await $fetch<any[]>(
      `${supabaseUrl}/rest/v1/parametros_folha?ativo=eq.true&order=vigencia_inicio.desc&limit=1`,
      { headers }
    )

    console.log('[GET PARAMETROS FOLHA] Parâmetros encontrados:', parametros)

    if (!parametros || parametros.length === 0) {
      throw createError({ statusCode: 404, message: 'Parâmetros de folha não encontrados' })
    }

    console.log('[GET PARAMETROS FOLHA] Retornando:', parametros[0])
    return { success: true, data: parametros[0] }
  } catch (error: any) {
    console.error('[GET PARAMETROS FOLHA] Erro:', error.message || error)
    throw createError({ 
      statusCode: error.statusCode || 500, 
      message: error.message || 'Erro ao buscar parâmetros de folha' 
    })
  }
})
