/**
 * Endpoint para disparar jobs de e-mail manualmente
 * Em produção, isso seria chamado por um cron job externo
 */
import { executarTodosOsJobs } from '../../utils/email-jobs'

export default defineEventHandler(async (event) => {
  try {
    // Verificar se tem token de autorização (segurança básica)
    const authHeader = getHeader(event, 'authorization')
    const config = useRuntimeConfig()
    
    // Token simples para segurança (em produção, use JWT)
    const expectedToken = config.emailJobsToken || 'seu-token-secreto-aqui'
    
    if (!authHeader || !authHeader.includes(expectedToken)) {
      throw createError({ 
        statusCode: 401, 
        message: 'Token inválido' 
      })
    }

    console.log('🚀 Disparando jobs de e-mail...')
    
    await executarTodosOsJobs()
    
    return {
      success: true,
      message: 'Jobs executados com sucesso'
    }
  } catch (error: any) {
    console.error('❌ Erro ao executar jobs:', error)
    throw createError({
      statusCode: 500,
      message: error.message || 'Erro ao executar jobs'
    })
  }
})
