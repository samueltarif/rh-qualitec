/**
 * API para atualizar dados da empresa
 */
export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { id, ...dadosEmpresa } = body

    if (!id) {
      throw createError({ statusCode: 400, message: 'ID da empresa é obrigatório' })
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

    // Atualizar dados
    const updateData = {
      ...dadosEmpresa,
      updated_at: new Date().toISOString()
    }

    const empresaAtualizada = await $fetch<any[]>(
      `${supabaseUrl}/rest/v1/empresa?id=eq.${id}`,
      {
        method: 'PATCH',
        headers,
        body: updateData
      }
    )

    if (!empresaAtualizada || empresaAtualizada.length === 0) {
      throw createError({ statusCode: 404, message: 'Empresa não encontrada' })
    }

    return { success: true, data: empresaAtualizada[0] }
  } catch (error: any) {
    console.error('[UPDATE EMPRESA] Erro:', error.message || error)
    throw createError({ 
      statusCode: error.statusCode || 500, 
      message: error.message || 'Erro ao atualizar dados da empresa' 
    })
  }
})
