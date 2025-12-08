/**
 * API para listar todos os usuários
 * Usa service key para bypassar RLS
 * Apenas admin pode acessar (verificado no middleware)
 */
export default defineEventHandler(async (event) => {
  try {
    const config = useRuntimeConfig()
    const supabaseUrl = config.public.supabaseUrl
    const serviceKey = config.supabaseServiceKey

    if (!serviceKey) {
      throw createError({ statusCode: 500, message: 'Service key não configurada' })
    }

    // Buscar todos os usuários usando service key (bypassa RLS)
    const response = await $fetch<any[]>(`${supabaseUrl}/rest/v1/app_users?select=*&order=created_at.desc`, {
      headers: { 
        'Authorization': `Bearer ${serviceKey}`, 
        'apikey': serviceKey 
      },
    })

    return { success: true, data: response || [] }
  } catch (error: any) {
    console.error('[LIST USERS] Erro:', error.message || error)
    throw createError({ 
      statusCode: error.statusCode || 500, 
      message: error.message || 'Erro ao listar usuários' 
    })
  }
})
