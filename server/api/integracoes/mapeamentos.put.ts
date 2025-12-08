import { serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const client = (await serverSupabaseClient(event)) as any
  const body = await readBody(event)

  if (!body.id) {
    throw createError({ statusCode: 400, message: 'ID é obrigatório' })
  }

  const { data, error } = await client
    .from('mapeamento_contas_contabeis')
    .update({
      conta_debito: body.conta_debito,
      conta_credito: body.conta_credito,
      centro_custo: body.centro_custo,
      historico_padrao: body.historico_padrao,
      updated_at: new Date().toISOString(),
    })
    .eq('id', body.id)
    .select()
    .single()

  if (error) {
    throw createError({ statusCode: 500, message: error.message })
  }

  return data
})
