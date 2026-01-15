import { serverSupabaseServiceRole } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  
  if (!id) {
    throw createError({
      statusCode: 400,
      message: 'ID do holerite não fornecido'
    })
  }

  const supabase = await serverSupabaseServiceRole(event)

  // Excluir holerite
  const { error } = await supabase
    .from('holerites')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Erro ao excluir holerite:', error)
    throw createError({
      statusCode: 500,
      message: 'Erro ao excluir holerite'
    })
  }

  return {
    success: true,
    message: 'Holerite excluído com sucesso'
  }
})
