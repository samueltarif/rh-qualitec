import { serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
  try {
    const id = getRouterParam(event, 'id')
    
    if (!id) {
      throw createError({
        statusCode: 400,
        message: 'ID do holerite é obrigatório'
      })
    }

    const supabase = await serverSupabaseClient(event)
    
    // Verificar autenticação
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      throw createError({
        statusCode: 401,
        message: 'Não autenticado'
      })
    }

    // Buscar o holerite antes de excluir (para log)
    const { data: holerite, error: errorBusca } = await supabase
      .from('holerites')
      .select('id, nome_colaborador, mes, ano, tipo, status')
      .eq('id', id)
      .single()

    if (errorBusca || !holerite) {
      throw createError({
        statusCode: 404,
        message: 'Holerite não encontrado'
      })
    }

    // Verificar se o holerite já foi enviado/pago
    if ((holerite as any).status === 'enviado' || (holerite as any).status === 'pago') {
      throw createError({
        statusCode: 400,
        message: 'Não é possível excluir holerite já enviado ou pago'
      })
    }

    // Excluir o holerite
    const { error: errorDelete } = await supabase
      .from('holerites')
      .delete()
      .eq('id', id)

    if (errorDelete) {
      console.error('Erro ao excluir holerite:', errorDelete)
      throw createError({
        statusCode: 500,
        message: 'Erro ao excluir holerite'
      })
    }

    return {
      success: true,
      message: `Holerite de ${(holerite as any).nome_colaborador} (${(holerite as any).mes}/${(holerite as any).ano}) excluído com sucesso`
    }
  } catch (error: any) {
    console.error('Erro ao excluir holerite:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Erro ao excluir holerite'
    })
  }
})
