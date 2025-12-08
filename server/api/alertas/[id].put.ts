import { serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const client = await serverSupabaseClient(event)
  const id = getRouterParam(event, 'id')
  const body = await readBody(event)

  if (!id) {
    throw createError({ statusCode: 400, message: 'ID do alerta é obrigatório' })
  }

  const updateData: Record<string, unknown> = {
    ...body,
    updated_at: new Date().toISOString(),
  }

  // Se marcando como lido
  if (body.status === 'lido' && !body.lido_em) {
    updateData.lido_em = new Date().toISOString()
  }

  // Se marcando como resolvido
  if (body.status === 'resolvido' && !body.resolvido_em) {
    updateData.resolvido_em = new Date().toISOString()
  }

  const { data, error } = await client
    .from('alertas')
    .update(updateData)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    throw createError({ statusCode: 500, message: error.message })
  }

  return data
})
