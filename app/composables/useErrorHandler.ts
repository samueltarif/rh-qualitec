/**
 * Composable centralizado para tratamento de erros
 * Fornece funções padronizadas para captura, log e exibição de erros
 */

interface ErrorLog {
  timestamp: string
  type: string
  message: string
  stack?: string
  context?: any
  userId?: string
}

export const useErrorHandler = () => {
  // Tipos de erro conhecidos
  const ERROR_TYPES = {
    NETWORK: 'network',
    AUTH: 'auth',
    VALIDATION: 'validation',
    DATABASE: 'database',
    PERMISSION: 'permission',
    NOT_FOUND: 'not_found',
    SERVER: 'server',
    UNKNOWN: 'unknown',
  }

  // Mensagens amigáveis por tipo de erro
  const FRIENDLY_MESSAGES: Record<string, string> = {
    network: 'Erro de conexão. Verifique sua internet e tente novamente.',
    auth: 'Sessão expirada. Faça login novamente.',
    validation: 'Dados inválidos. Verifique os campos e tente novamente.',
    database: 'Erro ao acessar dados. Tente novamente em instantes.',
    permission: 'Você não tem permissão para esta ação.',
    not_found: 'Recurso não encontrado.',
    server: 'Erro no servidor. Nossa equipe foi notificada.',
    unknown: 'Erro inesperado. Tente novamente.',
  }

  /**
   * Identifica o tipo de erro baseado no erro recebido
   */
  const identifyErrorType = (error: any): string => {
    // Erro de rede
    if (error.message?.includes('fetch') || error.message?.includes('network')) {
      return ERROR_TYPES.NETWORK
    }

    // Erro de autenticação
    if (error.statusCode === 401 || error.status === 401) {
      return ERROR_TYPES.AUTH
    }

    // Erro de permissão
    if (error.statusCode === 403 || error.status === 403) {
      return ERROR_TYPES.PERMISSION
    }

    // Erro de não encontrado
    if (error.statusCode === 404 || error.status === 404) {
      return ERROR_TYPES.NOT_FOUND
    }

    // Erro de validação
    if (error.statusCode === 400 || error.status === 400) {
      return ERROR_TYPES.VALIDATION
    }

    // Erro de banco de dados
    if (error.message?.includes('database') || error.message?.includes('query')) {
      return ERROR_TYPES.DATABASE
    }

    // Erro de servidor
    if (error.statusCode >= 500 || error.status >= 500) {
      return ERROR_TYPES.SERVER
    }

    return ERROR_TYPES.UNKNOWN
  }

  /**
   * Extrai mensagem de erro de diferentes formatos
   */
  const extractErrorMessage = (error: any): string => {
    if (typeof error === 'string') return error
    if (error.data?.message) return error.data.message
    if (error.message) return error.message
    if (error.statusMessage) return error.statusMessage
    return 'Erro desconhecido'
  }

  /**
   * Registra erro no console com contexto
   */
  const logError = (error: any, context?: string) => {
    const errorLog: ErrorLog = {
      timestamp: new Date().toISOString(),
      type: identifyErrorType(error),
      message: extractErrorMessage(error),
      stack: error.stack,
      context,
    }

    console.error('🔴 [ERROR]', errorLog)

    // Em produção, enviar para serviço de monitoramento
    if (process.env.NODE_ENV === 'production') {
      // TODO: Integrar com Sentry, LogRocket, etc.
      // sendToMonitoring(errorLog)
    }
  }

  /**
   * Exibe notificação de erro para o usuário
   */
  const showErrorNotification = (error: any, customMessage?: string) => {
    const errorType = identifyErrorType(error)
    const message = customMessage || FRIENDLY_MESSAGES[errorType] || FRIENDLY_MESSAGES.unknown
    const details = extractErrorMessage(error)

    // Log no console
    console.error('❌', message, details)
    
    // Exibir alert para o usuário
    if (typeof window !== 'undefined') {
      alert(`${message}\n\nDetalhes: ${details}`)
    }
  }

  /**
   * Trata erro de forma completa: log + notificação
   */
  const handleError = (error: any, context?: string, customMessage?: string) => {
    logError(error, context)
    showErrorNotification(error, customMessage)
  }

  /**
   * Wrapper para executar função com tratamento de erro
   */
  const withErrorHandling = async <T>(
    fn: () => Promise<T>,
    context?: string,
    customMessage?: string
  ): Promise<T | null> => {
    try {
      return await fn()
    } catch (error) {
      handleError(error, context, customMessage)
      return null
    }
  }

  /**
   * Valida resposta de API
   */
  const validateApiResponse = (response: any, expectedFields: string[] = []) => {
    if (!response) {
      throw new Error('Resposta vazia da API')
    }

    if (response.error) {
      throw new Error(response.error)
    }

    for (const field of expectedFields) {
      if (!(field in response)) {
        throw new Error(`Campo obrigatório ausente: ${field}`)
      }
    }

    return true
  }

  /**
   * Trata erro de validação de formulário
   */
  const handleValidationError = (errors: Record<string, string[]>) => {
    const firstError = Object.values(errors)[0]?.[0]
    if (firstError) {
      showErrorNotification(
        { message: firstError },
        'Corrija os erros no formulário'
      )
    }
  }

  /**
   * Retry com backoff exponencial
   */
  const retryWithBackoff = async <T>(
    fn: () => Promise<T>,
    maxRetries = 3,
    initialDelay = 1000
  ): Promise<T> => {
    let lastError: any
    
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await fn()
      } catch (error) {
        lastError = error
        
        if (i < maxRetries - 1) {
          const delay = initialDelay * Math.pow(2, i)
          console.log(`⏳ Tentativa ${i + 1} falhou. Tentando novamente em ${delay}ms...`)
          await new Promise(resolve => setTimeout(resolve, delay))
        }
      }
    }
    
    throw lastError
  }

  /**
   * Verifica se erro é recuperável
   */
  const isRecoverableError = (error: any): boolean => {
    const errorType = identifyErrorType(error)
    return [ERROR_TYPES.NETWORK, ERROR_TYPES.SERVER].includes(errorType)
  }

  /**
   * Formata erro para exibição
   */
  const formatErrorForDisplay = (error: any): string => {
    const type = identifyErrorType(error)
    const message = extractErrorMessage(error)
    const timestamp = new Date().toLocaleString('pt-BR')
    
    return `[${timestamp}] ${FRIENDLY_MESSAGES[type]}\nDetalhes: ${message}`
  }

  return {
    ERROR_TYPES,
    identifyErrorType,
    extractErrorMessage,
    logError,
    showErrorNotification,
    handleError,
    withErrorHandling,
    validateApiResponse,
    handleValidationError,
    retryWithBackoff,
    isRecoverableError,
    formatErrorForDisplay,
  }
}
