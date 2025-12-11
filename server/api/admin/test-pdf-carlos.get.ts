import { serverSupabaseServiceRole } from '#supabase/server'

export default defineEventHandler(async (event) => {
  try {
    console.log('🔧 Iniciando teste...')
    
    return {
      success: true,
      message: 'API funcionando!'
    }

  } catch (error: any) {
    console.error('Erro no teste:', error)
    return {
      success: false,
      error: error.message
    }
  }
})