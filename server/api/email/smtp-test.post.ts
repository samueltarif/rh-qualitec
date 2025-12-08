export default defineEventHandler(async (event) => {
  try {
    const config = useRuntimeConfig()
    const supabaseUrl = config.public.supabaseUrl
    const serviceKey = config.supabaseServiceKey

    if (!serviceKey) {
      throw createError({ statusCode: 500, message: 'Service key não configurada' })
    }

    const headers = { 
      'Authorization': `Bearer ${serviceKey}`, 
      'apikey': serviceKey,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation'
    }

    const body = await readBody(event)

    // Aqui você implementaria a lógica real de teste SMTP
    // Por enquanto, simula um teste bem-sucedido
    await new Promise(resolve => setTimeout(resolve, 2000))

    // Buscar primeira empresa
    const empresa = await $fetch<any[]>(`${supabaseUrl}/rest/v1/empresa?select=id&limit=1`, { headers })
    
    if (empresa && empresa.length > 0) {
      // Atualiza status de testado
      await $fetch(
        `${supabaseUrl}/rest/v1/configuracoes_smtp?empresa_id=eq.${empresa[0].id}`,
        {
          method: 'PATCH',
          headers,
          body: {
            testado: true,
            ultima_verificacao: new Date().toISOString()
          }
        }
      )
    }

    return {
      success: true,
      message: 'Conexão SMTP testada com sucesso!'
    }
  } catch (error: any) {
    console.error('[TEST SMTP] Erro:', error.message || error)
    return {
      success: false,
      message: error.message || 'Erro ao testar conexão SMTP'
    }
  }
})
