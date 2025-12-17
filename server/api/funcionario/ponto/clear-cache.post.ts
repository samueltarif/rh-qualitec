export default defineEventHandler(async (event) => {
  // Forçar headers para limpar cache
  setHeader(event, 'Cache-Control', 'no-cache, no-store, must-revalidate, max-age=0')
  setHeader(event, 'Pragma', 'no-cache')
  setHeader(event, 'Expires', '0')
  setHeader(event, 'Clear-Site-Data', '"cache", "storage"')
  
  return {
    success: true,
    message: 'Cache limpo com sucesso',
    timestamp: new Date().toISOString()
  }
})