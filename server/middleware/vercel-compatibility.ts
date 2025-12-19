/**
 * Middleware para garantir compatibilidade com Vercel
 * Trata erros comuns que podem causar FUNCTION_INVOCATION_FAILED
 */

export default defineEventHandler(async (event) => {
  // TEMPORARIAMENTE DESABILITADO PARA DEBUG
  return
}