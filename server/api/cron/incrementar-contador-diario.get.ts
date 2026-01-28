import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
  try {
    // Verificar se é uma chamada de cron válida
    const authHeader = getHeader(event, 'authorization')
    const cronSecret = process.env.CRON_SECRET
    
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Unauthorized'
      })
    }

    const supabaseUrl = process.env.SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseKey) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Configuração do Supabase não encontrada'
      })
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    // Verificar se ainda não chegamos em 2078
    const dataLimite = new Date('2078-12-31')
    const hoje = new Date()
    
    if (hoje >= dataLimite) {
      return {
        success: true,
        message: 'Contador finalizado - data limite atingida (2078)',
        data: null
      }
    }

    // Executar a função de incremento
    const { data, error } = await supabase.rpc('incrementar_contador_diario')

    if (error) {
      console.error('Erro ao incrementar contador:', error)
      throw createError({
        statusCode: 500,
        statusMessage: 'Erro ao incrementar contador diário'
      })
    }

    // Buscar o último número inserido para confirmação
    const { data: ultimoRegistro, error: errorConsulta } = await supabase
      .from('contador_diario')
      .select('numero, data_criacao')
      .order('id', { ascending: false })
      .limit(1)
      .single()

    if (errorConsulta) {
      console.error('Erro ao consultar último registro:', errorConsulta)
    }

    return {
      success: true,
      message: 'Contador incrementado com sucesso',
      data: {
        numero: ultimoRegistro?.numero || null,
        data_criacao: ultimoRegistro?.data_criacao || null,
        data_execucao: new Date().toISOString()
      }
    }

  } catch (error) {
    console.error('Erro no cron de contador diário:', error)
    
    return {
      success: false,
      message: 'Erro ao executar incremento diário',
      error: error.message || 'Erro desconhecido'
    }
  }
})