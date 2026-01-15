export default defineEventHandler(async (event) => {
  const { email, senha } = await readBody(event)

  if (!email || !senha) {
    throw createError({
      statusCode: 400,
      message: 'Email e senha são obrigatórios'
    })
  }

  const config = useRuntimeConfig()
  const supabaseUrl = config.public.supabaseUrl
  // Usar SERVICE_ROLE_KEY para bypass do RLS durante login
  const serviceRoleKey = config.supabaseServiceRoleKey || config.public.supabaseKey

  console.log('🔧 Config check:')
  console.log('  - supabaseUrl:', supabaseUrl ? supabaseUrl.substring(0, 30) + '...' : 'UNDEFINED')
  console.log('  - serviceRoleKey LENGTH:', serviceRoleKey ? serviceRoleKey.length : 0)
  console.log('  - serviceRoleKey FULL:', serviceRoleKey) // DEBUG: ver chave completa
  console.log('  - supabaseKey LENGTH:', config.public.supabaseKey ? config.public.supabaseKey.length : 0)

  try {
    console.log('🔐 Tentando login:', { email, senha: '***' })
    console.log('🌐 Supabase URL:', supabaseUrl)

    // Buscar funcionário pelo email e senha usando fetch direto
    const url = `${supabaseUrl}/rest/v1/funcionarios?email_login=eq.${encodeURIComponent(email)}&senha=eq.${encodeURIComponent(senha)}&status=eq.ativo&select=id,nome_completo,email_login,tipo_acesso,status,cargo_id,departamento_id`
    
    console.log('📡 URL da requisição:', url)

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

    if (!response.ok) {
      console.error('❌ Erro na resposta do Supabase:', funcionarios)
      throw createError({
        statusCode: 401,
        message: 'Email ou senha incorretos'
      })
    }

    if (!funcionarios || funcionarios.length === 0) {
      console.log('⚠️ Nenhum funcionário encontrado com essas credenciais')
      throw createError({
        statusCode: 401,
        message: 'Email ou senha incorretos'
      })
    }

    const funcionario = funcionarios[0]
    console.log('✅ Login bem-sucedido:', funcionario.nome_completo)

    // Retornar dados do usuário (sem a senha)
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
    throw createError({
      statusCode: 401,
      message: 'Email ou senha incorretos'
    })
  }
})
