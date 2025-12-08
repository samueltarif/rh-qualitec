import { serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const client = await serverSupabaseClient(event)
  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({ statusCode: 400, message: 'ID é obrigatório' })
  }

  try {
    const { error } = await client
      .from('comunicados')
      .delete()
      .eq('id', id)

    if (error) {
      throw createError({ statusCode: 500, message: error.message })
    }

    return { success: true }
  } catch (e: any) {
    console.error('Erro ao excluir comunicado:', e)
    throw createError({ statusCode: 500, message: e.message || 'Erro ao excluir comunicado' })
  }
})
