/**
 * Utilitários para tratamento de erros no servidor
 * Fornece funções padronizadas para APIs
 */

interface ApiError {
  statusCode: number
  message: string
  details?: any
  timestamp: string
  path?: string
}

/**
 * Cria erro padronizado de API
 */
export const createApiError = (
  statusCode: number,
  message: string,
  details?: any
): ApiError => {
  return {
    statusCode,
    message,
    details,
    timestamp: new Date().toISOString(),
  }
}

/**
 * Trata erro de banco de dados
 */
export const handleDatabaseError = (error: any, context?: string) => {
  console.error('🔴 [DATABASE ERROR]', {
    context,
    error: error.message,
    code: error.code,
    details: error.details,
  })

  // Erros específicos do Supabase/PostgreSQL
  if (error.code === '23505') {
    throw createError({
      statusCode: 409,
      message: 'Registro duplicado. Este item já existe.',
    })
  }

  if (error.code === '23503') {
    throw createError({
      statusCode: 400,
      message: 'Operação inválida. Verifique as dependências.',
    })
  }

  if (error.code === '42P01') {
    throw createError({
      statusCode: 500,
      message: 'Erro de configuração do banco de dados.',
    })
  }

  // Erro genérico de banco
  throw createError({
    statusCode: 500,
    message: 'Erro ao acessar banco de dados. Tente novamente.',
  })
}

/**
 * Trata erro de autenticação
 */
export const handleAuthError = (error: any) => {
  console.error('🔴 [AUTH ERROR]', error)

  if (error.message?.includes('JWT')) {
    throw createError({
      statusCode: 401,
      message: 'Sessão expirada. Faça login novamente.',
    })
  }

  throw createError({
    statusCode: 401,
    message: 'Não autenticado. Faça login para continuar.',
  })
}

/**
 * Trata erro de permissão
 */
export const handlePermissionError = (requiredRole: string, userRole: string) => {
  console.error('🔴 [PERMISSION ERROR]', {
    required: requiredRole,
    current: userRole,
  })

  throw createError({
    statusCode: 403,
    message: `Acesso negado. Necessário perfil: ${requiredRole}`,
  })
}

/**
 * Trata erro de validação
 */
export const handleValidationError = (errors: Record<string, string[]>) => {
  console.error('🔴 [VALIDATION ERROR]', errors)

  const firstError = Object.values(errors)[0]?.[0]

  throw createError({
    statusCode: 400,
    message: firstError || 'Dados inválidos',
    data: { errors },
  })
}

/**
 * Wrapper para executar operação com tratamento de erro
 */
export const withErrorHandling = async <T>(
  fn: () => Promise<T>,
  context?: string
): Promise<T> => {
  try {
    return await fn()
  } catch (error: any) {
    console.error(`🔴 [ERROR in ${context}]`, error)

    // Se já é um erro HTTP, apenas repassa
    if (error.statusCode) {
      throw error
    }

    // Trata erros de banco de dados
    if (error.code || error.details) {
      handleDatabaseError(error, context)
    }

    // Erro genérico
    throw createError({
      statusCode: 500,
      message: error.message || 'Erro interno do servidor',
    })
  }
}

/**
 * Valida campos obrigatórios
 */
export const validateRequiredFields = (
  data: any,
  requiredFields: string[]
): void => {
  const missingFields: string[] = []

  for (const field of requiredFields) {
    if (!data[field] && data[field] !== 0 && data[field] !== false) {
      missingFields.push(field)
    }
  }

  if (missingFields.length > 0) {
    throw createError({
      statusCode: 400,
      message: `Campos obrigatórios ausentes: ${missingFields.join(', ')}`,
    })
  }
}

/**
 * Valida formato de email
 */
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Valida formato de CPF
 */
export const validateCPF = (cpf: string): boolean => {
  const cleanCPF = cpf.replace(/\D/g, '')
  
  if (cleanCPF.length !== 11) return false
  if (/^(\d)\1{10}$/.test(cleanCPF)) return false

  let sum = 0
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleanCPF.charAt(i)) * (10 - i)
  }
  let digit = 11 - (sum % 11)
  if (digit >= 10) digit = 0
  if (digit !== parseInt(cleanCPF.charAt(9))) return false

  sum = 0
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleanCPF.charAt(i)) * (11 - i)
  }
  digit = 11 - (sum % 11)
  if (digit >= 10) digit = 0
  if (digit !== parseInt(cleanCPF.charAt(10))) return false

  return true
}

/**
 * Sanitiza entrada de usuário
 */
export const sanitizeInput = (input: string): string => {
  return input
    .trim()
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<[^>]+>/g, '')
}

/**
 * Log de operação bem-sucedida
 */
export const logSuccess = (operation: string, details?: any) => {
  console.log(`✅ [SUCCESS] ${operation}`, details || '')
}

/**
 * Log de operação com warning
 */
export const logWarning = (operation: string, details?: any) => {
  console.warn(`⚠️  [WARNING] ${operation}`, details || '')
}
