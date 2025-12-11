export default defineEventHandler(async (event) => {
  try {
    const supabase = await serverSupabaseServiceRole(event)
    
    console.log('🔍 Testando acesso à tabela assinaturas_ponto...')
    
    // Testar se a tabela existe
    const { data: tabelas, error: tabelaError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_name', 'assinaturas_ponto')
    
    if (tabelaError) {
      console.error('❌ Erro ao verificar tabela:', tabelaError)
      return { error: 'Erro ao verificar tabela', details: tabelaError }
    }
    
    console.log('📋 Tabelas encontradas:', tabelas)
    
    if (!tabelas || tabelas.length === 0) {
      return { 
        error: 'Tabela assinaturas_ponto não existe',
        suggestion: 'Execute a migration 31_assinatura_ponto.sql'
      }
    }
    
    // Testar acesso direto à tabela
    const { data: assinaturas, error: assinaturasError } = await supabase
      .from('assinaturas_ponto')
      .select('*')
      .limit(5)
    
    if (assinaturasError) {
      console.error('❌ Erro ao acessar assinaturas:', assinaturasError)
      return { error: 'Erro ao acessar tabela', details: assinaturasError }
    }
    
    console.log('✅ Assinaturas encontradas:', assinaturas?.length || 0)
    
    return {
      success: true,
      tabelaExiste: true,
      totalAssinaturas: assinaturas?.length || 0,
      assinaturas: assinaturas || []
    }
    
  } catch (error: any) {
    console.error('💥 Erro geral:', error)
    return { error: 'Erro geral', details: error.message }
  }
})