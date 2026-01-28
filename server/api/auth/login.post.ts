import { verifyPassword } from '../../utils/auth'

// Rate limiting simples (em produção, use Redis)
const loginAttempts = new Map<string, { count: number; lastAttempt: number }>()

export default defineEventHandler(async (event) => {
  const { email, senha } = await readBody(event)

  if (!email || !senha) {
    throw createError({
      statusCode: 400,
      message: 'Email e senha são obrigatórios'
    })
  }

  // Rate limiting básico
  const clientIP = getHeader(event, 'x-forwarded-for') || getHeader(event, 'x-real-ip') || 'unknown'
  const now = Date.now()
  const attempts = loginAttempts.get(clientIP)
  
  if (attempts && attempts.count >= 5 && now - attempts.lastAttempt < 15 * 60 * 1000) {
    throw createError({
      statusCode: 429,
      message: 'Muitas tentativas de login. Tente novamente em 15 minutos.'
    })
  }

  const config = useRuntimeConfig()
  const supabaseUrl = config.public.supabaseUrl
  const serviceRoleKey = config.supabaseServiceRoleKey || config.public.supabaseKey

  try {
    console.log('🔐 Tentativa de login:', { email, clientIP })
    
    // Buscar funcionário apenas pelo email (incluindo ambas as colunas de senha)
    const url = `${supabaseUrl}/rest/v1/funcionarios?email_login=eq.${encodeURIComponent(email)}&status=eq.ativo&select=id,nome_completo,email_login,tipo_acesso,status,cargo_id,departamento_id,senha,senha_hash`
    
    console.log('📡 URL da consulta:', url)

    const response = await fetch(url, {
      headers: {
        'apikey': serviceRoleKey,
        'Authorization': `Bearer ${serviceRoleKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      }
    })

    console.log('📊 Status da resposta:', response.status)
    
    const funcionarios = await response.json()
    console.log('👥 Funcionários encontrados:', funcionarios.length)

    if (!response.ok || !funcionarios || funcionarios.length === 0) {
      console.log('⚠️ Nenhum funcionário encontrado ou erro na resposta:', funcionarios)
      // Incrementar tentativas falhadas
      const currentAttempts = loginAttempts.get(clientIP) || { count: 0, lastAttempt: 0 }
      loginAttempts.set(clientIP, { count: currentAttempts.count + 1, lastAttempt: now })
      
      throw createError({
        statusCode: 401,
        message: 'Email ou senha incorretos'
      })
    }

    const funcionario = funcionarios[0]
    console.log('👤 Funcionário encontrado:', { id: funcionario.id, nome: funcionario.nome_completo })
    console.log('🔑 Tem senha_hash:', !!funcionario.senha_hash)
    console.log('🔑 Tem senha:', !!funcionario.senha)
    
    // Verificar senha com hash (prioriza senha_hash, fallback para senha)
    const senhaParaVerificar = funcionario.senha_hash || funcionario.senha
    console.log('🔍 Verificando senha com:', senhaParaVerificar ? 'hash/senha encontrada' : 'NENHUMA SENHA')
    
    const isValidPassword = await verifyPassword(senha, senhaParaVerificar)
    console.log('✅ Senha válida:', isValidPassword)
    
    if (!isValidPassword) {
      // Incrementar tentativas falhadas
      const currentAttempts = loginAttempts.get(clientIP) || { count: 0, lastAttempt: 0 }
      loginAttempts.set(clientIP, { count: currentAttempts.count + 1, lastAttempt: now })
      
      throw createError({
        statusCode: 401,
        message: 'Email ou senha incorretos'
      })
    }

    // Reset tentativas em caso de sucesso
    loginAttempts.delete(clientIP)

    // Retornar dados do usuário (sem a senha_hash)
    return {
      success: true,
      user: {
        id: funcionario.id,
        nome: funcionario.nome_completo,
        email: funcionario.email_login,
        tipo: funcionario.tipo_acesso,
        cargo: funcionario.cargo_id,
        departamento: funcionario.departamento_id
      }
    }
  } catch (error: any) {
    console.error('💥 Erro no login:', error)
    
    if (error.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      message: 'Erro interno do servidor'
    })
  }
})
