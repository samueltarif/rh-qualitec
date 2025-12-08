/**
 * API para listar jornadas de trabalho
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

    // Buscar todas as jornadas ativas
    const jornadas = await $fetch<any[]>(
      `${supabaseUrl}/rest/v1/jornadas_trabalho?ativo=eq.true&order=padrao.desc,nome.asc`,
      { headers }
    )

    return { success: true, data: jornadas || [] }
  } catch (error: any) {
    console.error('[GET JORNADAS] Erro:', error.message || error)
    throw createError({ 
      statusCode: error.statusCode || 500, 
      message: error.message || 'Erro ao buscar jornadas' 
    })
  }
})
