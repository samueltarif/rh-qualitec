import { serverSupabaseServiceRole } from '#supabase/server'

export default defineEventHandler(async (event) => {
  try {
    const supabase = serverSupabaseServiceRole(event)
    
    console.log('🧪 Teste simples de assinaturas...')

    // Consulta mais simples possível
    const { data: assinaturas, error } = await supabase
      .from('assinaturas_ponto')
      .select('*')
      .order('created_at', { ascending: false })

    console.log('📊 Resultado do teste:', {
      total: assinaturas?.length || 0,
      error: error?.message || null,
      primeiros3: assinaturas?.slice(0, 3) || []
    })

    if (error) {
      return {
        success: false,
        error: error.message,
        total: 0,
        assinaturas: []
      }
    }

    return {
      success: true,
      total: assinaturas?.length || 0,
      assinaturas: assinaturas || [],
      message: `Encontradas ${assinaturas?.length || 0} assinaturas`
    }

  } catch (error: any) {
    console.error('❌ Erro no teste:', error)
    return {
      success: false,
      error: error.message,
      total: 0,
      assinaturas: []
    }
  }
})