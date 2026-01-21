export default defineEventHandler(async (event) => {
  try {
    const config = useRuntimeConfig()
    
    // Verificar variáveis de ambiente (sem expor valores)
    const envCheck = {
      supabaseUrl: !!config.public.supabaseUrl,
      supabaseKey: !!config.public.supabaseKey,
      supabaseServiceRoleKey: !!config.supabaseServiceRoleKey,
      nodeVersion: process.version,
      platform: process.platform,
      timestamp: new Date().toISOString()
    }
    
    return {
      status: 'ok',
      message: 'Health check passed',
      environment: envCheck,
      vercel: {
        region: process.env.VERCEL_REGION || 'unknown',
        env: process.env.VERCEL_ENV || 'unknown'
      }
    }
  } catch (error: any) {
    console.error('Health check failed:', error)
    return {
      status: 'error',
      message: error.message,
      stack: error.stack
    }
  }
})
