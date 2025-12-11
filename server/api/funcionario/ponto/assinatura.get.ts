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
    try {
      const { data: assinatura } = await supabase
        .from('assinaturas_ponto')
        .select('*')
        .eq('colaborador_id', colaborador.id)
        .eq('mes', mes)
        .eq('ano', ano)
        .single()

      return assinatura || null
    } catch (error) {
      // Se não encontrar assinatura, retorna null
      return null
    }

  } catch (error: any) {
    console.error('Erro na API de assinatura:', error)
    
    if (error.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      message: 'Erro interno do servidor'
    })
  }
})