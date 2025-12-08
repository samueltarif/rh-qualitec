export default defineEventHandler(async (event) => {
  try {
    const config = useRuntimeConfig()
    const supabaseUrl = config.public.supabaseUrl
    const serviceKey = config.supabaseServiceKey
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
      cor: body.cor || 'blue',
      icone: body.icone || 'heroicons:document-text',
      ativo: body.ativo !== undefined ? body.ativo : true,
      ordem: body.ordem || 0,
    }

    const data = await $fetch<any>(
      `${supabaseUrl}/rest/v1/categorias_documentos`,
      { 
        method: 'POST',
        headers,
        body: payload
      }
    )

    return Array.isArray(data) ? data[0] : data
  } catch (error: any) {
    console.error('[POST CATEGORIA] Erro:', error)
    throw createError({ 
      statusCode: error.statusCode || 500, 
      message: error.message || 'Erro ao criar categoria' 
    })
  }
})
