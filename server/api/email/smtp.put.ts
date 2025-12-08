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

    // Buscar primeira empresa
    const empresa = await $fetch<any[]>(`${supabaseUrl}/rest/v1/empresa?select=id&limit=1`, { headers })
    
    if (!empresa || empresa.length === 0) {
      throw createError({ statusCode: 404, message: 'Empresa não encontrada' })
    }

    // Verificar se já existe configuração
    const existing = await $fetch<any[]>(
      `${supabaseUrl}/rest/v1/configuracoes_smtp?empresa_id=eq.${empresa[0].id}&select=id`,
      { headers }
    )

    let result
    if (existing && existing.length > 0) {
      // Atualizar
      result = await $fetch<any[]>(
        `${supabaseUrl}/rest/v1/configuracoes_smtp?id=eq.${existing[0].id}`,
        {
          method: 'PATCH',
          headers,
          body: {
            ...body,
            updated_at: new Date().toISOString()
          }
        }
      )
    } else {
      // Criar
      result = await $fetch<any[]>(
        `${supabaseUrl}/rest/v1/configuracoes_smtp`,
        {
          method: 'POST',
          headers,
          body: {
            ...body,
            empresa_id: empresa[0].id
          }
        }
      )
    }

    return result && result.length > 0 ? result[0] : result
  } catch (error: any) {
    console.error('[PUT SMTP] Erro:', error.message || error)
    throw createError({ 
      statusCode: error.statusCode || 500, 
      message: error.message || 'Erro ao salvar configurações SMTP' 
    })
  }
})
