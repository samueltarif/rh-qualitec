import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'

export default defineEventHandler(async (event) => {
  try {
    const client = await serverSupabaseClient(event)
    const user = await serverSupabaseUser(event)
    const query = getQuery(event)
    const mes = parseInt(query.mes as string)
    const ano = parseInt(query.ano as string)

    // O Supabase retorna o ID no campo 'sub', não 'id'
    const userId = user?.id || user?.sub

    if (!user || !userId) {
      throw createError({
        statusCode: 401,
        message: 'Não autenticado'
      })
    }

    if (!mes || !ano) {
      throw createError({
        statusCode: 400,
        message: 'Mês e ano são obrigatórios'
      })
    }

    console.log('🔍 [CSV] User ID:', userId)
    console.log('🔍 [CSV] Query:', query)

    // ✅ BUSCA ROBUSTA DO COLABORADOR (igual às outras APIs)
    let colaboradorId: string | null = null
    
    // 1. Buscar por auth_uid na tabela colaboradores
    const { data: colaboradorByAuth } = await client
      .from('colaboradores')
      .select('id, nome')
      .eq('auth_uid', userId)
      .single()

    if (colaboradorByAuth) {
      colaboradorId = colaboradorByAuth.id
      console.log('✅ [CSV] Colaborador encontrado por auth_uid:', colaboradorByAuth.nome)
    } else {
      // 2. Buscar via app_users se não encontrou direto
      const { data: appUserData } = await client
        .from('app_users')
        .select('colaborador_id, nome')
        .eq('auth_uid', userId)
        .single()

      if (appUserData?.colaborador_id) {
        colaboradorId = appUserData.colaborador_id
        console.log('✅ [CSV] Colaborador encontrado via app_users:', appUserData.nome)
      }
    }

    if (!colaboradorId) {
      console.error('❌ [CSV] Colaborador não encontrado para user:', userId)
      throw createError({
        statusCode: 404,
        message: 'Colaborador não encontrado'
      })
    }

    // Buscar assinatura
    const { data: assinatura, error } = await client
      .from('assinaturas_ponto')
      .select('arquivo_csv')
      .eq('colaborador_id', colaboradorId)
      .eq('mes', mes)
      .eq('ano', ano)
      .single()

    if (error || !assinatura) {
      throw createError({
        statusCode: 404,
        message: 'Assinatura não encontrada para este período'
      })
    }

    const arquivoCsv = (assinatura as any).arquivo_csv
    if (!arquivoCsv) {
      throw createError({
        statusCode: 404,
        message: 'Arquivo CSV não disponível'
      })
    }

    // Decodificar CSV
    const csv = Buffer.from(arquivoCsv, 'base64').toString('utf-8')

    // Configurar headers para download
    setResponseHeaders(event, {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="ponto_${mes.toString().padStart(2, '0')}_${ano}.csv"`,
      'Cache-Control': 'no-cache'
    })

    return csv

  } catch (error: any) {
    console.error('Erro ao processar download CSV:', error)
    
    if (error.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      message: 'Erro interno do servidor'
    })
  }
})