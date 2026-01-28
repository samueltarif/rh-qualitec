export default defineEventHandler(async (event) => {
  // Esta API só deve funcionar em desenvolvimento ou com token especial
  const query = getQuery(event)
  const debugToken = query.token
  const funcionarioId = query.funcionarioId
  
  // Token de segurança para produção
  const isAuthorized = process.env.NODE_ENV === 'development' || 
                      debugToken === 'qualitec-debug-2026-secure'
  
  if (!isAuthorized) {
    throw createError({
      statusCode: 403,
      message: 'Acesso negado - Token de debug necessário'
    })
  }

  if (!funcionarioId) {
    throw createError({
      statusCode: 400,
      message: 'funcionarioId é obrigatório'
    })
  }

  const config = useRuntimeConfig()
  
  console.log('🔍 [DEBUG-HOLERITES] === INÍCIO DO DEBUG ===')
  console.log('🔍 [DEBUG-HOLERITES] Timestamp:', new Date().toISOString())
  console.log('🔍 [DEBUG-HOLERITES] Funcionário ID:', funcionarioId)
  console.log('🔍 [DEBUG-HOLERITES] Environment:', process.env.NODE_ENV)
  console.log('🔍 [DEBUG-HOLERITES] Vercel URL:', process.env.VERCEL_URL)
  
  // Verificar todas as configurações
  const configuracoes = {
    // Runtime Config
    'config.public.supabaseUrl': config.public.supabaseUrl || 'MISSING',
    'config.public.supabaseKey': config.public.supabaseKey ? 'PRESENTE' : 'MISSING',
    'config.supabaseServiceRoleKey': config.supabaseServiceRoleKey ? 'PRESENTE' : 'MISSING',
    
    // Variáveis de Ambiente
    'SUPABASE_URL': process.env.SUPABASE_URL ? 'PRESENTE' : 'MISSING',
    'NUXT_PUBLIC_SUPABASE_URL': process.env.NUXT_PUBLIC_SUPABASE_URL ? 'PRESENTE' : 'MISSING',
    'SUPABASE_SERVICE_ROLE_KEY': process.env.SUPABASE_SERVICE_ROLE_KEY ? 'PRESENTE' : 'MISSING',
    'SUPABASE_ANON_KEY': process.env.SUPABASE_ANON_KEY ? 'PRESENTE' : 'MISSING',
    'NUXT_PUBLIC_SUPABASE_KEY': process.env.NUXT_PUBLIC_SUPABASE_KEY ? 'PRESENTE' : 'MISSING'
  }
  
  console.log('🔍 [DEBUG-HOLERITES] Configurações:', configuracoes)
  
  // Determinar URL e chave a usar
  const supabaseUrl = config.public.supabaseUrl || 
                     process.env.NUXT_PUBLIC_SUPABASE_URL || 
                     process.env.SUPABASE_URL
                     
  const serviceRoleKey = config.supabaseServiceRoleKey || 
                        process.env.SUPABASE_SERVICE_ROLE_KEY ||
                        config.public.supabaseKey
  
  console.log('🔍 [DEBUG-HOLERITES] URL final:', supabaseUrl ? `${supabaseUrl.substring(0, 30)}...` : 'MISSING')
  console.log('🔍 [DEBUG-HOLERITES] Key final:', serviceRoleKey ? 'PRESENTE' : 'MISSING')
  
  if (!supabaseUrl || !serviceRoleKey) {
    return {
      success: false,
      error: 'Configurações do Supabase faltando',
      configuracoes,
      supabaseUrl: supabaseUrl ? 'PRESENTE' : 'MISSING',
      serviceRoleKey: serviceRoleKey ? 'PRESENTE' : 'MISSING'
    }
  }
  
  try {
    // Testar múltiplas queries
    const queries = [
      {
        nome: 'Todos os holerites',
        url: `${supabaseUrl}/rest/v1/holerites?funcionario_id=eq.${funcionarioId}&select=*&order=periodo_inicio.desc`
      },
      {
        nome: 'Holerites não gerados',
        url: `${supabaseUrl}/rest/v1/holerites?funcionario_id=eq.${funcionarioId}&status=neq.gerado&select=*&order=periodo_inicio.desc`
      },
      {
        nome: 'Holerites enviados/visualizados',
        url: `${supabaseUrl}/rest/v1/holerites?funcionario_id=eq.${funcionarioId}&status=in.(enviado,visualizado)&select=*&order=periodo_inicio.desc`
      }
    ]
    
    const resultados = []
    
    for (const query of queries) {
      console.log(`🧪 [DEBUG-HOLERITES] Testando: ${query.nome}`)
      console.log(`🧪 [DEBUG-HOLERITES] URL: ${query.url}`)
      
      const headers = {
        'apikey': serviceRoleKey,
        'Authorization': `Bearer ${serviceRoleKey}`,
        'Content-Type': 'application/json',
        'User-Agent': 'Debug-Holerites-API'
      }
      
      try {
        const startTime = Date.now()
        const response = await fetch(query.url, { headers })
        const endTime = Date.now()
        
        console.log(`📊 [DEBUG-HOLERITES] ${query.nome} - Status:`, response.status)
        console.log(`⏱️ [DEBUG-HOLERITES] ${query.nome} - Tempo:`, `${endTime - startTime}ms`)
        
        if (response.ok) {
          const data = await response.json()
          console.log(`✅ [DEBUG-HOLERITES] ${query.nome} - Encontrados:`, data?.length || 0)
          
          resultados.push({
            nome: query.nome,
            status: response.status,
            tempo: `${endTime - startTime}ms`,
            quantidade: data?.length || 0,
            dados: data?.slice(0, 2) || [], // Primeiros 2 para debug
            sucesso: true
          })
        } else {
          const errorText = await response.text()
          console.error(`❌ [DEBUG-HOLERITES] ${query.nome} - Erro:`, errorText)
          
          resultados.push({
            nome: query.nome,
            status: response.status,
            tempo: `${endTime - startTime}ms`,
            erro: errorText,
            sucesso: false
          })
        }
      } catch (fetchError: any) {
        console.error(`💥 [DEBUG-HOLERITES] ${query.nome} - Erro de fetch:`, fetchError)
        
        resultados.push({
          nome: query.nome,
          erro: fetchError.message,
          sucesso: false
        })
      }
    }
    
    // Verificar se o funcionário existe
    console.log('👤 [DEBUG-HOLERITES] Verificando se funcionário existe...')
    try {
      const funcionarioUrl = `${supabaseUrl}/rest/v1/funcionarios?id=eq.${funcionarioId}&select=id,nome_completo,email_login`
      const funcionarioResponse = await fetch(funcionarioUrl, {
        headers: {
          'apikey': serviceRoleKey,
          'Authorization': `Bearer ${serviceRoleKey}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (funcionarioResponse.ok) {
        const funcionarios = await funcionarioResponse.json()
        console.log('👤 [DEBUG-HOLERITES] Funcionário encontrado:', funcionarios?.length > 0)
        
        resultados.push({
          nome: 'Verificação do funcionário',
          status: funcionarioResponse.status,
          quantidade: funcionarios?.length || 0,
          dados: funcionarios || [],
          sucesso: true
        })
      }
    } catch (error) {
      console.error('👤 [DEBUG-HOLERITES] Erro ao verificar funcionário:', error)
    }
    
    console.log('✅ [DEBUG-HOLERITES] === FIM DO DEBUG ===')
    
    return {
      success: true,
      timestamp: new Date().toISOString(),
      funcionarioId,
      ambiente: process.env.NODE_ENV,
      configuracoes,
      resultados
    }
    
  } catch (error: any) {
    console.error('💥 [DEBUG-HOLERITES] Erro geral:', error)
    
    return {
      success: false,
      error: error.message,
      stack: error.stack,
      configuracoes
    }
  }
})