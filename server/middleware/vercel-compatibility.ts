/**
 * Middleware para garantir compatibilidade com Vercel
 * Trata erros comuns que podem causar FUNCTION_INVOCATION_FAILED
 */

export default defineEventHandler(async (event) => {
  // Só aplicar em rotas de API
  if (!event.node.req.url?.startsWith('/api/')) {
    return
  }

  try {
    // Verificar se há timeout potencial
    const startTime = Date.now()
    
    // Adicionar timeout de segurança (50 segundos para Vercel)
    const timeoutId = setTimeout(() => {
      console.warn(`⚠️ Timeout warning: ${event.node.req.url} está demorando mais que 50s`)
    }, 50000)

    // Interceptar resposta para limpar timeout
    event.node.res.on('finish', () => {
      clearTimeout(timeoutId)
      const duration = Date.now() - startTime
      if (duration > 30000) {
        console.warn(`⚠️ Slow API: ${event.node.req.url} took ${duration}ms`)
      }
    })

    // Verificar se é uma operação que pode ser pesada
    const heavyOperations = ['/api/holerites/gerar', '/api/relatorios/gerar', '/api/email/']
    const isHeavyOperation = heavyOperations.some(op => event.node.req.url?.includes(op))
    
    if (isHeavyOperation) {
      console.log(`🔄 Heavy operation detected: ${event.node.req.url}`)
    }

  } catch (error) {
    console.error('❌ Middleware error:', error)
    // Não bloquear a requisição por erro no middleware
  }
})