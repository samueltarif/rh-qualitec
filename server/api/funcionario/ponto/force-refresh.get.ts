export default defineEventHandler(async (event) => {
  const client = await serverSupabaseClient(event)
  const user = await serverSupabaseUser(event)
  
  // Forçar headers para não cachear
  setHeader(event, 'Cache-Control', 'no-cache, no-store, must-revalidate')
  setHeader(event, 'Pragma', 'no-cache')
  setHeader(event, 'Expires', '0')
  
  const userId = user?.id || user?.sub

  if (!user || !userId) {
    throw createError({ statusCode: 401, message: 'Não autenticado' })
  }

  try {
    console.log('🔄 [FORCE REFRESH] User ID:', userId)
    
    // Buscar colaborador_id do usuário
    const { data: appUserData, error: appUserError } = await client
      .from('app_users')
      .select('colaborador_id, id, auth_uid')
      .eq('auth_uid', userId)
      .single()

    console.log('🔄 [FORCE REFRESH] App User:', appUserData)

    if (!appUserData?.colaborador_id) {
      return {
        erro: 'Colaborador não encontrado',
        user_id: userId,
        app_user: appUserData
      }
    }

    // Buscar TODOS os registros (sem filtro de data)
    const { data: todosRegistros, error: todosError } = await client
      .from('registros_ponto')
      .select('*')
      .eq('colaborador_id', appUserData.colaborador_id)
      .order('data', { ascending: false })

    console.log('🔄 [FORCE REFRESH] Total registros:', todosRegistros?.length || 0)

    // Buscar registros do mês atual
    const hoje = new Date()
    const mesAtual = hoje.getMonth() + 1
    const anoAtual = hoje.getFullYear()
    
    const dataInicio = `${anoAtual}-${String(mesAtual).padStart(2, '0')}-01`
    const ultimoDia = new Date(anoAtual, mesAtual, 0).getDate()
    const dataFim = `${anoAtual}-${String(mesAtual).padStart(2, '0')}-${ultimoDia}`

    const { data: registrosMes, error: mesError } = await client
      .from('registros_ponto')
      .select('*')
      .eq('colaborador_id', appUserData.colaborador_id)
      .gte('data', dataInicio)
      .lte('data', dataFim)
      .order('data', { ascending: false })

    console.log('🔄 [FORCE REFRESH] Registros do mês:', registrosMes?.length || 0)

    return {
      timestamp: new Date().toISOString(),
      usuario: appUserData,
      periodo: { dataInicio, dataFim },
      total_registros: todosRegistros?.length || 0,
      registros_mes: registrosMes?.length || 0,
      todos_registros: todosRegistros || [],
      registros_periodo: registrosMes || [],
      erros: {
        app_user: appUserError,
        todos: todosError,
        mes: mesError
      }
    }

  } catch (e: any) {
    console.error('❌ [FORCE REFRESH] Erro:', e)
    return { 
      erro: e.message,
      timestamp: new Date().toISOString()
    }
  }
})