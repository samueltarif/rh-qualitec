import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'

export default defineEventHandler(async (event) => {
  try {
    const supabase = await serverSupabaseClient(event)
    const user = await serverSupabaseUser(event)

    if (!user) {
      throw createError({
        statusCode: 401,
        message: 'Não autenticado'
      })
    }

    return {
      success: true,
      message: 'API funcionando',
      user: {
        id: user.id,
        email: user.email
      },
      timestamp: new Date().toISOString()
    }

  } catch (error: any) {
    console.error('❌ Erro na API de teste:', error)
    throw createError({
      statusCode: 500,
      message: 'Erro na API de teste: ' + error.message
    })
  }
})