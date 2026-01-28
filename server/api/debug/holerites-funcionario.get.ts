export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const query = getQuery(event)
  const funcionarioId = query.funcionarioId

  console.log('🔍 [DEBUG-HOLERITES] === INÍCIO DEBUG ===')
  console.log('🔍 [DEBUG-HOLERITES] Timestamp:', new Date().toISOString())
  console.log('🔍 [DEBUG-HOLERITES] Funcionário ID:', funcionarioId)
  console.log('🔍 [DEBUG-HOLERITES] Query completa:', query)
  console.log('🔍 [DEBUG-HOLERITES] Environment:', process.env.NODE_ENV)
  console.log('🔍 [DEBUG-HOLERITES] Vercel URL:', process.env.VERCEL_URL)

  // Headers CORS
  setHeader(event, 'Access-Control-Allow-Origin', '*')
  setHeader(event, 'Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  setHeader(event, 'Access-Control-Allow-Headers', 'Content-Type, Authorization')

  if (!funcionarioId) {
    return {
      error: 'Funcionário ID não fornecido',
      query,
      timestamp: new Date().toISOString()
    }
  }

  try {
    const supabaseUrl = config.public.supabaseUrl
    const serviceRoleKey = config.supabaseServiceRoleKey || config.public.supabaseKey

    console.log('🔧 [DEBUG-HOLERITES] Configurações:')
    console.log('   Supabase URL:', supabaseUrl ? `${supabaseUrl.substring(0, 30)}...` : 'MISSING')
    console.log('   Service Role Key:', serviceRoleKey ? 'PRESENTE' : 'MISSING')

    if (!supabaseUrl || !serviceRoleKey) {
      return {
        error: 'Configurações do Supabase faltando',
        config: {
          supabaseUrl: supabaseUrl ? 'OK' : 'MISSING',
          serviceRoleKey: serviceRoleKey ? 'OK' : 'MISSING'
        },
        envVars: Object.keys(process.env).filter(k => k.includes('SUPABASE')),
        timestamp: new Date().toISOString()
      }
    }

    // Testar conexão básica primeiro
    console.log('🧪 [DEBUG-HOLERITES] Testando conexão básica...')
    const testUrl = `${supabaseUrl}/rest/v1/funcionarios?id=eq.${funcionarioId}&select=id,nome_completo`
    
    const testResponse = await fetch(testUrl, {
      headers: {
        'apikey': serviceRoleKey,
        'Authorization': `Bearer ${serviceRoleKey}`,
        'Content-Type': 'application/json'
      }
    })

    console.log('📊 [DEBUG-HOLERITES] Teste conexão - Status:', testResponse.status)

    if (!testResponse.ok) {
      const errorText = await testResponse.text()
      return {
        error: 'Erro na conexão com Supabase',
        status: testResponse.status,
        statusText: testResponse.statusText,
        errorBody: errorText,
        testUrl,
        timestamp: new Date().toISOString()
      }
    }

    const funcionarios = await testResponse.json()
    console.log('👤 [DEBUG-HOLERITES] Funcionários encontrados:', funcionarios.length)

    if (funcionarios.length === 0) {
      return {
        error: 'Funcionário não encontrado',
        funcionarioId,
        funcionarios,
        timestamp: new Date().toISOString()
      }
    }

    const funcionario = funcionarios[0]
    console.log('👤 [DEBUG-HOLERITES] Funcionário:', funcionario.nome_completo)

    // Agora testar holerites
    console.log('📋 [DEBUG-HOLERITES] Testando holerites...')
    const holeritesUrl = `${supabaseUrl}/rest/v1/holerites?funcionario_id=eq.${funcionarioId}&select=*&order=periodo_inicio.desc`
    
    const holeritesResponse = await fetch(holeritesUrl, {
      headers: {
        'apikey': serviceRoleKey,
        'Authorization': `Bearer ${serviceRoleKey}`,
        'Content-Type': 'application/json'
      }
    })

    console.log('📊 [DEBUG-HOLERITES] Holerites - Status:', holeritesResponse.status)

    if (!holeritesResponse.ok) {
      const errorText = await holeritesResponse.text()
      return {
        error: 'Erro ao buscar holerites',
        status: holeritesResponse.status,
        statusText: holeritesResponse.statusText,
        errorBody: errorText,
        holeritesUrl,
        funcionario,
        timestamp: new Date().toISOString()
      }
    }

    const holerites = await holeritesResponse.json()
    console.log('📋 [DEBUG-HOLERITES] Holerites encontrados:', holerites.length)

    // Filtrar apenas os relevantes
    const holeritesRelevantes = holerites.filter(h => 
      h.status === 'enviado' || h.status === 'visualizado'
    )

    console.log('📋 [DEBUG-HOLERITES] Holerites relevantes:', holeritesRelevantes.length)

    return {
      success: true,
      funcionario,
      totalHolerites: holerites.length,
      holeritesRelevantes: holeritesRelevantes.length,
      holerites: holeritesRelevantes.slice(0, 5), // Primeiros 5 para debug
      todosStatus: [...new Set(holerites.map(h => h.status))],
      config: {
        supabaseUrl: supabaseUrl ? 'OK' : 'MISSING',
        serviceRoleKey: serviceRoleKey ? 'OK' : 'MISSING'
      },
      timestamp: new Date().toISOString()
    }

  } catch (error: any) {
    console.error('💥 [DEBUG-HOLERITES] Erro:', error)
    
    return {
      error: 'Erro interno do servidor',
      message: error.message,
      stack: error.stack,
      funcionarioId,
      timestamp: new Date().toISOString()
    }
  }
})