/**
 * API para buscar dados da empresa
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

    // Buscar dados da empresa (deve ter apenas 1 registro)
    const empresa = await $fetch<any[]>(`${supabaseUrl}/rest/v1/empresa?select=*&limit=1`, { headers })

    if (!empresa || empresa.length === 0) {
      throw createError({ statusCode: 404, message: 'Dados da empresa não encontrados' })
    }

    return { success: true, data: empresa[0] }
  } catch (error: any) {
    console.error('[GET EMPRESA] Erro:', error.message || error)
    throw createError({ 
      statusCode: error.statusCode || 500, 
      message: error.message || 'Erro ao buscar dados da empresa' 
    })
  }
})
