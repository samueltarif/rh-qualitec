import { serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const client = await serverSupabaseClient(event)
  const id = getRouterParam(event, 'id')
  const body = await readBody(event)

  if (!id) {
    throw createError({ statusCode: 400, message: 'ID é obrigatório' })
  }

  try {
    const { data, error } = await client
      .from('comunicados')
      .update({
        titulo: body.titulo,
        conteudo: body.conteudo,
        tipo: body.tipo,
        destino: body.destino,
        destino_ids: body.destino_ids,
        data_expiracao: body.data_expiracao,
        ativo: body.ativo,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      throw createError({ statusCode: 500, message: error.message })
    }

    return data
  } catch (e: any) {
    console.error('Erro ao atualizar comunicado:', e)
    throw createError({ statusCode: 500, message: e.message || 'Erro ao atualizar comunicado' })
  }
})
