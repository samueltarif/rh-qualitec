/**
 * Middleware de otimização para Vercel
 * Reduz o tamanho do bundle Edge Function
 */

export default defineEventHandler(async (event) => {
  // Apenas aplicar otimizações em produção
  if (process.env.NODE_ENV !== 'production') {
    return
  }

  // Headers de otimização
  setHeader(event, 'Cache-Control', 'public, max-age=31536000, immutable')
  
  // Compressão para assets estáticos
  if (event.node.req.url?.match(/\.(js|css|png|jpg|jpeg|gif|svg|woff|woff2)$/)) {
    setHeader(event, 'Content-Encoding', 'gzip')
  }
})