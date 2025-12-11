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

    const query = getQuery(event)
    const mes = parseInt(query.mes as string)
    const ano = parseInt(query.ano as string)

    if (!mes || !ano) {
      throw createError({
        statusCode: 400,
        message: 'Mês e ano são obrigatórios'
      })
    }

    // Buscar colaborador pelo auth_uid ou email
    let colaborador: any = null
    
    // Primeiro tenta buscar pelo auth_uid
    try {
      const { data: colaboradorByAuth } = await supabase
        .from('colaboradores')
        .select('id')
        .eq('auth_uid', user.id)
        .single()

      if (colaboradorByAuth) {
        colaborador = colaboradorByAuth
      }
    } catch (error) {
      // Ignora erro se não encontrar
    }

    // Se não encontrou pelo auth_uid, busca pelo email
    if (!colaborador) {
      try {
        const { data: colaboradorByEmail } = await supabase
          .from('colaboradores')
          .select('id')
          .eq('email_corporativo', user.email)
          .single()
        
        colaborador = colaboradorByEmail
      } catch (error) {
        // Ignora erro se não encontrar
      }
    }

    if (!colaborador) {
      throw createError({
        statusCode: 404,
        message: 'Colaborador não encontrado'
      })
    }

    // Buscar assinatura
    const { data: assinatura, error } = await supabase
      .from('assinaturas_ponto')
      .select('arquivo_csv')
      .eq('colaborador_id', colaborador.id)
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