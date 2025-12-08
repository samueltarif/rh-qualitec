import { serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const client = await serverSupabaseClient(event)
  const id = getRouterParam(event, 'id')
  const body = await readBody(event)

  if (!id) {
    throw createError({ statusCode: 400, message: 'ID é obrigatório' })
  }

  const updateData: Record<string, any> = {}

  // Campos que podem ser atualizados
  const allowedFields = [
    'data_inicio', 'data_fim', 'dias_gozo', 'dias_abono',
    'tipo', 'vender_dias', 'adiantamento_13', 'observacoes',
    'valor_ferias', 'valor_terco', 'valor_abono', 'valor_total'
  ]

  for (const field of allowedFields) {
    if (body[field] !== undefined) {
      updateData[field] = body[field]
    }
  }

  const { data, error } = await client
    .from('ferias')
    .update(updateData)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Erro ao atualizar férias:', error)
    throw createError({ statusCode: 500, message: error.message })
  }

  return data
})
