import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const supabase = await serverSupabaseClient(event)
  const user = await serverSupabaseUser(event)

  // O Supabase retorna o ID no campo 'sub', não 'id'
  const userId = user?.sub || user?.id

  if (!user || !userId) {
    throw createError({
      statusCode: 401,
      message: 'Não autenticado',
    })
  }

  try {
    console.log('🔍 [HOLERITES] Buscando para userId:', userId)
    
    // Buscar app_user com colaborador_id
    const { data: appUser, error: appUserError } = await supabase
      .from('app_users')
      .select('id, colaborador_id')
      .eq('auth_uid', userId)
      .single()

    console.log('🔍 [HOLERITES] App User:', appUser)
    console.log('🔍 [HOLERITES] Error:', appUserError)

    if (!appUser) {
      throw createError({
        statusCode: 404,
        message: 'Usuário não encontrado',
      })
    }

    // Verificar se tem colaborador_id
    const colaboradorId = (appUser as any).colaborador_id
    console.log('🔍 [HOLERITES] Colaborador ID:', colaboradorId)
    
    if (!colaboradorId) {
      throw createError({
        statusCode: 404,
        message: 'Colaborador não vinculado ao usuário',
      })
    }

    // Buscar holerites do colaborador
    const { data: holerites, error } = await supabase
      .from('holerites')
      .select('*')
      .eq('colaborador_id', colaboradorId)
      .order('ano', { ascending: false })
      .order('mes', { ascending: false })

    console.log('🔍 [HOLERITES] Holerites encontrados:', holerites?.length || 0)
    console.log('🔍 [HOLERITES] Erro ao buscar:', error)

    if (error) throw error

    return {
      success: true,
      data: holerites || [],
    }
  } catch (error: any) {
    console.error('❌ [HOLERITES] Erro:', error.message)
    throw createError({
      statusCode: 500,
      message: error.message || 'Erro ao buscar holerites',
    })
  }
})
