/**
 * API para criar jornada de trabalho
 */
export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    
    if (!body.nome) {
      throw createError({ statusCode: 400, message: 'Nome da jornada é obrigatório' })
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

    // Criar jornada
    const jornada = await $fetch<any[]>(
      `${supabaseUrl}/rest/v1/jornadas_trabalho`,
      {
        method: 'POST',
        headers,
        body
      }
    )

    return { success: true, data: jornada?.[0] }
  } catch (error: any) {
    console.error('[CREATE JORNADA] Erro:', error.message || error)
    throw createError({ 
      statusCode: error.statusCode || 500, 
      message: error.message || 'Erro ao criar jornada' 
    })
  }
})
