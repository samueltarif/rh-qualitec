// API ultra básica sem nenhuma dependência
export default defineEventHandler(() => {
  return { message: 'OK', timestamp: Date.now() }
})