// API de diagnóstico para identificar erro 500
export default defineEventHandler(async (event) => {
  try {
    console.log('🟢 Health check iniciado')
    
    // Teste 1: Variáveis de ambiente
    const envCheck = {
      SUPABASE_URL: !!process.env.SUPABASE_URL,
      SUPABASE_ANON_KEY: !!process.env.SUPABASE_ANON_KEY,
      SUPABASE_SERVICE_ROLE_KEY: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      JWT_SECRET: !!process.env.JWT_SECRET,
      NODE_ENV: process.env.NODE_ENV
    }
    
    console.log('🔍 Env vars:', envCheck)
    
    // Teste 2: Supabase connection
    let supabaseStatus = 'unknown'
    try {
      const { serverSupabaseClient } = await import('#supabase/server')
      const supabase = await serverSupabaseClient(event)
      const { data, error } = await supabase.from('colaboradores').select('count').limit(1)
      supabaseStatus = error ? `error: ${error.message}` : 'connected'
    } catch (err) {
      supabaseStatus = `connection_failed: ${err.message}`
    }
    
    console.log('🔍 Supabase:', supabaseStatus)
    
    // Teste 3: Runtime info
    const runtimeInfo = {
      platform: process.platform,
      nodeVersion: process.version,
      memoryUsage: process.memoryUsage(),
      uptime: process.uptime()
    }
    
    console.log('🔍 Runtime:', runtimeInfo)
    
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment: envCheck,
      supabase: supabaseStatus,
      runtime: runtimeInfo,
      message: 'Health check passou - servidor funcionando'
    }
    
  } catch (error) {
    console.error('❌ Erro no health check:', error)
    
    return {
      status: 'error',
      timestamp: new Date().toISOString(),
      error: {
        message: error.message,
        stack: error.stack,
        name: error.name
      },
      message: 'Health check falhou - este é o problema!'
    }
  }
})