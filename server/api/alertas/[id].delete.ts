import { serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const client = (await serverSupabaseClient(event)) as any
  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({ statusCode: 400, message: 'ID do alerta é obrigatório' })
  }

  const { error } = await client.from('alertas').delete().eq('id', id)

  if (error) {
    throw createError({ statusCode: 500, message: error.message })
  }

  return { success: true }
})
