export default defineEventHandler(async (event) => {
  const client = await serverSupabaseClient(event)
  
  try {
    console.log('🔍 [TESTE ENOA] Iniciando teste específico para Enoa')
    
    // 1. Buscar dados do Enoa na tabela app_users
    const { data: appUserData, error: appUserError } = await client
      .from('app_users')
      .select('*')
      .eq('colaborador_id', '43678ebd-27ee-49f1-9192-327c6e434d68')
      .single()

    console.log('🔍 [TESTE ENOA] App User Data:', appUserData)
    console.log('🔍 [TESTE ENOA] App User Error:', appUserError)

    if (!appUserData) {
      return { 
        erro: 'Usuário Enoa não encontrado na tabela app_users',
        colaborador_id: '43678ebd-27ee-49f1-9192-327c6e434d68'
      }
    }

    // 2. Definir período (mês atual)
    const hoje = new Date()
    const mesAtual = hoje.getMonth() + 1
    const anoAtual = hoje.getFullYear()
    
    const dataInicio = `${anoAtual}-${String(mesAtual).padStart(2, '0')}-01`
    const ultimoDia = new Date(anoAtual, mesAtual, 0).getDate()
    const dataFim = `${anoAtual}-${String(mesAtual).padStart(2, '0')}-${ultimoDia}`

    console.log('🔍 [TESTE ENOA] Período:', dataInicio, 'até', dataFim)

    // 3. Buscar registros de ponto
    const { data: registros, error: registrosError } = await client
      .from('registros_ponto')
      .select('*')
      .eq('colaborador_id', appUserData.colaborador_id)
      .gte('data', dataInicio)
      .lte('data', dataFim)
      .order('data', { ascending: false })

    console.log('🔍 [TESTE ENOA] Registros encontrados:', registros?.length || 0)
    console.log('🔍 [TESTE ENOA] Registros Error:', registrosError)

    // 4. Buscar TODOS os registros (sem filtro de data)
    const { data: todosRegistros, error: todosError } = await client
      .from('registros_ponto')
      .select('*')
      .eq('colaborador_id', appUserData.colaborador_id)
      .order('data', { ascending: false })

    console.log('🔍 [TESTE ENOA] TODOS os registros:', todosRegistros?.length || 0)

    return {
      usuario: appUserData,
      periodo: { dataInicio, dataFim },
      registros_periodo: registros || [],
      todos_registros: todosRegistros || [],
      total_periodo: registros?.length || 0,
      total_geral: todosRegistros?.length || 0,
      erro_registros: registrosError,
      erro_todos: todosError
    }

  } catch (e: any) {
    console.error('❌ [TESTE ENOA] Erro:', e)
    return { 
      erro: e.message,
      stack: e.stack 
    }
  }
})