/**
 * Utilitários para diagnóstico de problemas no Vercel
 */

interface VercelError {
  type: 'timeout' | 'memory' | 'import' | 'runtime' | 'unknown'
  message: string
  suggestion: string
}

/**
 * Analisa um erro e sugere soluções específicas para Vercel
 */
export function analyzeVercelError(error: any): VercelError {
  const errorMessage = error?.message || error?.toString() || 'Unknown error'
  
  // Timeout errors
  if (errorMessage.includes('timeout') || errorMessage.includes('TIMEOUT')) {
    return {
      type: 'timeout',
      message: 'Function execution timeout',
      suggestion: 'Reduce processing time or move heavy operations to client-side'
    }
  }
  
  // Memory errors
  if (errorMessage.includes('memory') || errorMessage.includes('ENOMEM')) {
    return {
      type: 'memory',
      message: 'Out of memory error',
      suggestion: 'Optimize data processing and reduce memory usage'
    }
  }
  
  // Import/Module errors
  if (errorMessage.includes('Cannot resolve') || errorMessage.includes('MODULE_NOT_FOUND')) {
    return {
      type: 'import',
      message: 'Module import error',
      suggestion: 'Check if all dependencies are properly installed and compatible with serverless'
    }
  }
  
  // Runtime errors
  if (errorMessage.includes('Runtime') || errorMessage.includes('FUNCTION_INVOCATION_FAILED')) {
    return {
      type: 'runtime',
      message: 'Runtime execution error',
      suggestion: 'Check for Edge Runtime incompatibilities or switch to Node.js runtime'
    }
  }
  
  return {
    type: 'unknown',
    message: errorMessage,
    suggestion: 'Check Vercel function logs for more details'
  }
}

/**
 * Cria um wrapper seguro para operações que podem falhar no Vercel
 */
export async function safeVercelOperation<T>(
  operation: () => Promise<T>,
  fallback: T,
  operationName: string
): Promise<T> {
  try {
    const startTime = Date.now()
    const result = await operation()
    const duration = Date.now() - startTime
    
    if (duration > 30000) {
      console.warn(`⚠️ Slow operation: ${operationName} took ${duration}ms`)
    }
    
    return result
  } catch (error) {
    const analysis = analyzeVercelError(error)
    console.error(`❌ Vercel operation failed: ${operationName}`)
    console.error(`Error type: ${analysis.type}`)
    console.error(`Message: ${analysis.message}`)
    console.error(`Suggestion: ${analysis.suggestion}`)
    
    return fallback
  }
}

/**
 * Verifica se estamos rodando no Vercel
 */
export function isVercelEnvironment(): boolean {
  return !!(process.env.VERCEL || process.env.VERCEL_ENV)
}

/**
 * Obtém informações do ambiente Vercel
 */
export function getVercelInfo() {
  if (!isVercelEnvironment()) {
    return null
  }
  
  return {
    env: process.env.VERCEL_ENV,
    region: process.env.VERCEL_REGION,
    url: process.env.VERCEL_URL,
    runtime: process.env.AWS_EXECUTION_ENV ? 'edge' : 'nodejs'
  }
}

/**
 * Log estruturado para Vercel
 */
export function logVercelInfo(message: string, data?: any) {
  const info = getVercelInfo()
  console.log(`[VERCEL] ${message}`, {
    timestamp: new Date().toISOString(),
    environment: info,
    data
  })
}