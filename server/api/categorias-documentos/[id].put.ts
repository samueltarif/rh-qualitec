export default defineEventHandler(async (event) => {
  try {
    const config = useRuntimeConfig()
    const supabaseUrl = config.public.supabaseUrl
    const serviceKey = config.supabaseServiceKey
    const id = getRouterParam(event, 'id')
    const body = await readBody(event)

    if (!serviceKey) {
      throw createError({ statusCode: 500, message: 'Service key não configurada' })
    }

    const headers = { 
      'Authorization': `Bearer ${serviceKey}`, 
      'apikey': serviceKey,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation'
    }

    const payload = {
      nome: body.nome,
      descricao: body.descricao,
      cor: body.cor,
      icone: body.icone,
      ativo: body.ativo,
      ordem: body.ordem,
      updated_at: new Date().toISOString(),
    }

    const data = await $fetch<any>(
      `${supabaseUrl}/rest/v1/categorias_documentos?id=eq.${id}`,
      { 
        method: 'PATCH',
        headers,
        body: payload
      }
    )

    return Array.isArray(data) ? data[0] : data
  } catch (error: any) {
    console.error('[PUT CATEGORIA] Erro:', error)
    throw createError({ 
      statusCode: error.statusCode || 500, 
      message: error.message || 'Erro ao atualizar categoria' 
    })
  }
})
