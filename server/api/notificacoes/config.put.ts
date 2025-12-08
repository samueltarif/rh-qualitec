import { serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const client = await serverSupabaseClient(event) as any
  const body = await readBody(event)

  // Verificar se já existe configuração
  const { data: existing } = await client
    .from('configuracoes_notificacoes')
    .select('id, empresa_id')
    .limit(1)
    .single()

  if (existing) {
    // Atualizar existente
    const { data, error } = await client
      .from('configuracoes_notificacoes')
      .update({
        ...body,
        updated_at: new Date().toISOString(),
      })
      .eq('id', existing.id)
      .select()
      .single()

    if (error) {
      throw createError({ statusCode: 500, message: error.message })
    }

    return data
  } else {
    // Buscar empresa_id padrão
    const { data: empresa } = await client
      .from('empresas')
      .select('id')
      .limit(1)
      .single()

    // Criar nova configuração
    const { data, error } = await client
      .from('configuracoes_notificacoes')
      .insert({
        ...body,
        empresa_id: empresa?.id,
      })
      .select()
      .single()

    if (error) {
      throw createError({ statusCode: 500, message: error.message })
    }

    return data
  }
})
