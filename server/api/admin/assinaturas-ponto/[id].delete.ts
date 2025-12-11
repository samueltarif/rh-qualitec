import { serverSupabaseServiceRole, serverSupabaseUser } from '#supabase/server'

export default defineEventHandler(async (event) => {
  try {
    const id = getRouterParam(event, 'id')
    
    if (!id) {
      throw createError({
        statusCode: 400,
        statusMessage: 'ID da assinatura é obrigatório'
      })
    }

    const supabase = await serverSupabaseServiceRole(event)
    
    // Verificar se a assinatura existe
    const { data: assinatura, error: fetchError } = await supabase
      .from('assinaturas_ponto')
      .select('*, colaborador:colaboradores(nome)')
      .eq('id', id)
      .single()

    if (fetchError || !assinatura) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Assinatura não encontrada'
      })
    }

    // Excluir a assinatura
    const { error: deleteError } = await supabase
      .from('assinaturas_ponto')
      .delete()
      .eq('id', id)

    if (deleteError) {
      console.error('Erro ao excluir assinatura:', deleteError)
      throw createError({
        statusCode: 500,
        statusMessage: 'Erro ao excluir assinatura'
      })
    }

    // Log da atividade
    try {
      const user = await serverSupabaseUser(event)
      console.log(`Assinatura excluída: ${(assinatura as any).colaborador?.nome} - ${user?.email}`)
    } catch (logError) {
      console.error('Erro ao registrar log:', logError)
    }

    return {
      success: true,
      message: 'Assinatura excluída com sucesso'
    }

  } catch (error: any) {
    console.error('Erro ao excluir assinatura:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Erro interno do servidor'
    })
  }
})