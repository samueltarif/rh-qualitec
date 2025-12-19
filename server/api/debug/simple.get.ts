// API super simples para testar se o problema é com imports/dependências
export default defineEventHandler(async (event) => {
  return {
    status: 'ok',
    message: 'API simples funcionando',
    timestamp: new Date().toISOString(),
    url: event.node.req.url
  }
})