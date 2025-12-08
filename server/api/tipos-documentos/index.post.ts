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
      categoria_id: body.categoria_id,
      nome: body.nome,
      descricao: body.descricao,
      requer_periodo: body.requer_periodo || false,
      requer_horas: body.requer_horas || false,
      requer_aprovacao: body.requer_aprovacao || false,
      requer_arquivo: body.requer_arquivo !== undefined ? body.requer_arquivo : true,
      tem_validade: body.tem_validade || false,
      dias_validade: body.dias_validade,
      notificar_vencimento: body.notificar_vencimento || false,
      dias_aviso_vencimento: body.dias_aviso_vencimento || 30,
      campos_extras: body.campos_extras || [],
      ativo: body.ativo !== undefined ? body.ativo : true,
      ordem: body.ordem || 0,
    }

    const data = await $fetch<any>(
      `${supabaseUrl}/rest/v1/tipos_documentos?select=*,categoria:categorias_documentos(id,nome,cor,icone)`,
      { 
        method: 'POST',
        headers,
        body: payload
      }
    )

    return Array.isArray(data) ? data[0] : data
  } catch (error: any) {
    console.error('[POST TIPO] Erro:', error)
    throw createError({ 
      statusCode: error.statusCode || 500, 
      message: error.message || 'Erro ao criar tipo' 
    })
  }
})
