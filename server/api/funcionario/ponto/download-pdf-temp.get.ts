import { serverSupabaseServiceRole } from '#supabase/server'

export default defineEventHandler(async (event) => {
  try {
    console.log('🔧 Testando API simples...')
    
    return {
      success: true,
      message: 'API funcionando!'
    }

  } catch (error: any) {
    console.error('Erro:', error)
    return {
      success: false,
      error: error.message
    }
  }
})