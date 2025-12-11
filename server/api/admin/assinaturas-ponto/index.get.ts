import { serverSupabaseServiceRole } from '#supabase/server'

export default defineEventHandler(async (event) => {
  try {
    const supabase = serverSupabaseServiceRole(event)
    
    console.log('🔍 [ADMIN ASSINATURAS] Iniciando busca...')

    const query = getQuery(event)
    const mes = query.mes ? parseInt(query.mes as string) : null
    const ano = query.ano ? parseInt(query.ano as string) : null
    const colaboradorId = query.colaborador_id as string

    console.log('📋 [ADMIN ASSINATURAS] Filtros:', { mes, ano, colaboradorId })

    // Consulta mais simples possível primeiro
    const { data: assinaturas, error } = await supabase
      .from('assinaturas_ponto')
      .select(`
        id,
        colaborador_id,
        mes,
        ano,
        data_assinatura,
        ip_assinatura,
        user_agent,
        hash_assinatura,
        total_dias,
        total_horas,
        observacoes,
        created_at,
        colaborador:colaboradores(
          id,
          nome,
          cpf
        )
      `)
      .order('data_assinatura', { ascending: false })

    console.log('📊 [ADMIN ASSINATURAS] Resultado bruto:', {
      total: assinaturas?.length || 0,
      error: error?.message || null,
      primeiraAssinatura: assinaturas?.[0] || null
    })

    if (error) {
      console.error('❌ [ADMIN ASSINATURAS] Erro SQL:', error)
      return {
        success: false,
        error: error.message,
        data: []
      }
    }

    // Aplicar filtros manualmente se necessário
    let assinaturasFiltradas = assinaturas || []
    
    if (mes) {
      assinaturasFiltradas = assinaturasFiltradas.filter(a => a.mes === mes)
    }
    
    if (ano) {
      assinaturasFiltradas = assinaturasFiltradas.filter(a => a.ano === ano)
    }
    
    if (colaboradorId) {
      assinaturasFiltradas = assinaturasFiltradas.filter(a => a.colaborador_id === colaboradorId)
    }

    console.log('✅ [ADMIN ASSINATURAS] Retornando:', assinaturasFiltradas.length, 'assinaturas')
    
    return assinaturasFiltradas

  } catch (error: any) {
    console.error('❌ [ADMIN ASSINATURAS] Erro geral:', error)
    return {
      success: false,
      error: error.message,
      data: []
    }
  }
})