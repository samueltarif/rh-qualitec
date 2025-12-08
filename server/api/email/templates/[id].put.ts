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

    const id = event.context.params?.id
    const body = await readBody(event)

    // Verifica se é template do sistema
    const template = await $fetch<any[]>(
      `${supabaseUrl}/rest/v1/templates_email?id=eq.${id}&select=sistema`,
      { headers }
    )

    let updateData = { ...body }

    // Se for template do sistema, permite apenas editar alguns campos
    if (template && template.length > 0 && template[0].sistema) {
      // Permite editar apenas: nome, descricao, assunto, corpo_html, corpo_texto, ativo
      updateData = {
        nome: body.nome,
        descricao: body.descricao,
        assunto: body.assunto,
        corpo_html: body.corpo_html,
        corpo_texto: body.corpo_texto,
        ativo: body.ativo,
        prioridade: body.prioridade,
        variaveis_disponiveis: body.variaveis_disponiveis,
        requer_confirmacao_leitura: body.requer_confirmacao_leitura
      }
      // Não permite alterar: codigo, categoria, sistema
    }

    const updated = await $fetch<any[]>(
      `${supabaseUrl}/rest/v1/templates_email?id=eq.${id}`,
      {
        method: 'PATCH',
        headers,
        body: {
          ...updateData,
          updated_at: new Date().toISOString()
        }
      }
    )

    return updated && updated.length > 0 ? updated[0] : updated
  } catch (error: any) {
    console.error('[PUT TEMPLATE] Erro:', error.message || error)
    throw createError({ 
      statusCode: error.statusCode || 500, 
      message: error.message || 'Erro ao atualizar template' 
    })
  }
})
