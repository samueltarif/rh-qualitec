import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'

export default defineEventHandler(async (event) => {
  try {
    const user = await serverSupabaseUser(event)
    if (!user) {
      throw createError({ statusCode: 401, message: 'Não autenticado' })
    }

    const id = getRouterParam(event, 'id')
    const body = await readBody(event)
    const supabase = await serverSupabaseClient(event)

    const { data, error } = await supabase
      .from('templates_importacao')
      .update({
        nome: body.nome,
        descricao: body.descricao,
        tipo_entidade: body.tipo_entidade,
        formato: body.formato,
        ativo: body.ativo,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    return {
      success: true,
      data,
    }
  } catch (error: any) {
    console.error('Erro ao atualizar template:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Erro ao atualizar template',
    })
  }
})
