/**
 * API para atualizar parâmetros de folha
 */
export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    console.log('[UPDATE PARAMETROS FOLHA] Body recebido:', JSON.stringify(body, null, 2))
    
    const { id, ...dadosParametros } = body

    if (!id) {
      throw createError({ statusCode: 400, message: 'ID dos parâmetros é obrigatório' })
    }

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

    // Remover campos que não devem ser atualizados
    const { created_at, vigencia_inicio, vigencia_fim, ativo, ...camposAtualizaveis } = dadosParametros

    // Atualizar dados
    const updateData = {
      ...camposAtualizaveis,
      updated_at: new Date().toISOString()
    }

    console.log('[UPDATE PARAMETROS FOLHA] Dados para atualizar:', JSON.stringify(updateData, null, 2))

    const parametrosAtualizados = await $fetch<any[]>(
      `${supabaseUrl}/rest/v1/parametros_folha?id=eq.${id}`,
      {
        method: 'PATCH',
        headers,
        body: updateData
      }
    )

    console.log('[UPDATE PARAMETROS FOLHA] Resposta:', parametrosAtualizados)

    if (!parametrosAtualizados || parametrosAtualizados.length === 0) {
      throw createError({ statusCode: 404, message: 'Parâmetros não encontrados' })
    }

    return { success: true, data: parametrosAtualizados[0] }
  } catch (error: any) {
    console.error('[UPDATE PARAMETROS FOLHA] Erro completo:', error)
    console.error('[UPDATE PARAMETROS FOLHA] Erro data:', error.data)
    throw createError({ 
      statusCode: error.statusCode || 500, 
      message: error.data?.message || error.message || 'Erro ao atualizar parâmetros de folha' 
    })
  }
})
