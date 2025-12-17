import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'

export default defineEventHandler(async (event) => {
  try {
    const client = await serverSupabaseClient(event)
    const user = await serverSupabaseUser(event)
    const query = getQuery(event)
    const { mes, ano } = query

    // Validar parâmetros
    if (!mes || !ano) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Mês e ano são obrigatórios'
      })
    }

    // O Supabase retorna o ID no campo 'sub', não 'id'
    const userId = user?.id || user?.sub

    if (!user || !userId) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Usuário não autenticado'
      })
    }

    console.log('🔍 [ASSINATURA PONTO] User ID:', userId)
    console.log('🔍 [ASSINATURA PONTO] Query:', query)

    // Buscar colaborador_id do usuário
    const { data: appUserData, error: appUserError } = await client
      .from('app_users')
      .select('colaborador_id')
      .eq('auth_uid', userId)
      .single()

    console.log('🔍 [ASSINATURA PONTO] App User:', appUserData)
    console.log('🔍 [ASSINATURA PONTO] Error:', appUserError)

    const appUser = appUserData as any
    if (!appUser?.colaborador_id) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Usuário não encontrado no sistema'
      })
    }

    // Buscar assinatura do ponto para o mês/ano
    try {
      const { data: assinatura, error } = await client
        .from('assinaturas_ponto')
        .select('*')
        .eq('colaborador_id', appUser.colaborador_id)
        .eq('mes', mes)
        .eq('ano', ano)
        .single()

      console.log('🔍 [ASSINATURA PONTO] Assinatura encontrada:', assinatura)
      console.log('🔍 [ASSINATURA PONTO] Erro:', error)

      return {
        success: true,
        data: assinatura || null
      }
    } catch (error: any) {
      // Se a tabela não existir ou houver erro, retornar null
      console.warn('Tabela assinaturas_ponto não encontrada ou erro:', error.message)
      return {
        success: true,
        data: null
      }
    }

  } catch (error: any) {
    console.error('Erro ao buscar assinatura:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Erro interno do servidor'
    })
  }
})