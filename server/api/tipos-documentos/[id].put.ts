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
      categoria_id: body.categoria_id,
      nome: body.nome,
      descricao: body.descricao,
      requer_periodo: body.requer_periodo,
      requer_horas: body.requer_horas,
      requer_aprovacao: body.requer_aprovacao,
      requer_arquivo: body.requer_arquivo,
      tem_validade: body.tem_validade,
      dias_validade: body.dias_validade,
      notificar_vencimento: body.notificar_vencimento,
      dias_aviso_vencimento: body.dias_aviso_vencimento,
      campos_extras: body.campos_extras,
      ativo: body.ativo,
      ordem: body.ordem,
      updated_at: new Date().toISOString(),
    }

    const data = await $fetch<any>(
      `${supabaseUrl}/rest/v1/tipos_documentos?id=eq.${id}&select=*,categoria:categorias_documentos(id,nome,cor,icone)`,
      { 
        method: 'PATCH',
        headers,
        body: payload
      }
    )

    return Array.isArray(data) ? data[0] : data
  } catch (error: any) {
    console.error('[PUT TIPO] Erro:', error)
    throw createError({ 
      statusCode: error.statusCode || 500, 
      message: error.message || 'Erro ao atualizar tipo' 
    })
  }
})
