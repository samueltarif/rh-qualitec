import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const client = await serverSupabaseClient(event)
  const user = await serverSupabaseUser(event)
  const query = getQuery(event)

  // O Supabase retorna o ID no campo 'sub', não 'id'
  const userId = user?.id || user?.sub

  if (!user || !userId) {
    throw createError({ statusCode: 401, message: 'Não autenticado' })
  }

  try {
    console.log('🔍 [FUNCIONARIO PONTO] User ID:', userId)
    console.log('🔍 [FUNCIONARIO PONTO] Query:', query)
    
    // Buscar colaborador_id do usuário
    const { data: appUserData, error: appUserError } = await client
      .from('app_users')
      .select('colaborador_id')
      .eq('auth_uid', userId)
      .single()

    console.log('🔍 [FUNCIONARIO PONTO] App User:', appUserData)
    console.log('🔍 [FUNCIONARIO PONTO] Error:', appUserError)

    const appUser = appUserData as any
    if (!appUser?.colaborador_id) {
      return []
    }

    // Definir período (padrão: mês atual)
    const hoje = new Date()
    const mesAtual = query.mes ? parseInt(query.mes as string) : hoje.getMonth() + 1
    const anoAtual = query.ano ? parseInt(query.ano as string) : hoje.getFullYear()
    
    const dataInicio = `${anoAtual}-${String(mesAtual).padStart(2, '0')}-01`
    const ultimoDia = new Date(anoAtual, mesAtual, 0).getDate()
    const dataFim = `${anoAtual}-${String(mesAtual).padStart(2, '0')}-${ultimoDia}`

    console.log('🔍 [FUNCIONARIO PONTO] Buscando registros de', dataInicio, 'até', dataFim)
    console.log('🔍 [FUNCIONARIO PONTO] Colaborador ID:', appUser.colaborador_id)

    const { data, error } = await client
      .from('registros_ponto')
      .select('*')
      .eq('colaborador_id', appUser.colaborador_id)
      .gte('data', dataInicio)
      .lte('data', dataFim)
      .order('data', { ascending: false })

    console.log('🔍 [FUNCIONARIO PONTO] Registros encontrados:', data?.length || 0)
    console.log('🔍 [FUNCIONARIO PONTO] Erro:', error)

    if (error) {
      console.error('❌ [FUNCIONARIO PONTO] Erro ao buscar:', error)
      throw createError({ statusCode: 500, message: error.message })
    }

    return data || []
  } catch (e: any) {
    console.error('Erro ao buscar registros de ponto:', e)
    throw createError({ statusCode: 500, message: e.message || 'Erro ao buscar registros' })
  }
})
