import { serverSupabaseServiceRole } from '#supabase/server'

/**
 * API para listar notificações do admin
 * GET /api/notificacoes
 */
export default defineEventHandler(async (event) => {
  try {
    const supabase = serverSupabaseServiceRole(event)
    const query = getQuery(event)
    
    // Parâmetros de filtro
    const limite = Number(query.limite) || 50
    const apenas_nao_lidas = query.apenas_nao_lidas === 'true'
    const tipo = query.tipo as string
    const origem = query.origem as string

    console.log('📬 [NOTIFICACOES] Buscando notificações...')
    console.log('📋 Filtros:', { limite, apenas_nao_lidas, tipo, origem })

    // Construir query
    let queryBuilder = supabase
      .from('notificacoes')
      .select('*')
      .order('importante', { ascending: false }) // Importantes primeiro
      .order('data_criacao', { ascending: false }) // Mais recentes primeiro
      .limit(limite)

    // Filtrar apenas não lidas
    if (apenas_nao_lidas) {
      queryBuilder = queryBuilder.eq('lida', false)
    }

    // Filtrar por tipo
    if (tipo) {
      queryBuilder = queryBuilder.eq('tipo', tipo)
    }

    // Filtrar por origem
    if (origem) {
      queryBuilder = queryBuilder.eq('origem', origem)
    }

    // Filtrar notificações não expiradas
    queryBuilder = queryBuilder.or('data_expiracao.is.null,data_expiracao.gt.' + new Date().toISOString())

    const { data: notificacoes, error } = await queryBuilder

    if (error) {
      console.error('❌ Erro ao buscar notificações:', error)
      throw error
    }

    // Buscar contadores diretamente
    const { data: contadoresData } = await supabase
      .from('notificacoes')
      .select('id', { count: 'exact' })
      .eq('lida', false)
      .or('data_expiracao.is.null,data_expiracao.gt.' + new Date().toISOString())

    const totalNaoLidas = contadoresData?.length || 0

    console.log(`✅ ${notificacoes?.length || 0} notificação(ões) encontrada(s)`)
    console.log(`📊 Total não lidas: ${totalNaoLidas}`)

    return {
      success: true,
      notificacoes: notificacoes || [],
      total: notificacoes?.length || 0,
      total_nao_lidas: totalNaoLidas,
      filtros: {
        limite,
        apenas_nao_lidas,
        tipo,
        origem
      }
    }

  } catch (error: any) {
    console.error('💥 Erro na API de notificações:', error)
    throw createError({
      statusCode: 500,
      message: error.message || 'Erro ao buscar notificações'
    })
  }
})