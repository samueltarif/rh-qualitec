/**
 * Middleware global para tratamento de erros no servidor
 * Captura e formata erros de todas as APIs
 */

export default defineEventHandler((event) => {
  // Hook para capturar erros
  event.node.res.on('finish', () => {
    const statusCode = event.node.res.statusCode

    // Log de erros 4xx e 5xx
    if (statusCode >= 400) {
      console.error(`🔴 [API ERROR] ${event.node.req.method} ${event.node.req.url} - Status: ${statusCode}`)
    }
  })

  // Adicionar headers de segurança
  setResponseHeaders(event, {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
  })
})
