import { serverSupabaseServiceRole } from '#supabase/server'

/**
 * API para excluir uma notificação específica
 * DELETE /api/notificacoes/[id]
 */
export default defineEventHandler(async (event) => {
  try {
    const supabase = serverSupabaseServiceRole(event)
    const notificacaoId = getRouterParam(event, 'id')

    if (!notificacaoId) {
      throw createError({
        statusCode: 400,
        message: 'ID da notificação é obrigatório'
      })
    }

    console.log(`🗑️ [NOTIFICACOES] Excluindo notificação: ${notificacaoId}`)

    // Verificar se a notificação existe
    const { data: notificacaoExistente, error: erroVerificacao } = await supabase
      .from('notificacoes')
      .select('id, titulo, tipo')
      .eq('id', notificacaoId)
      .single()

    if (erroVerificacao || !notificacaoExistente) {
      throw createError({
        statusCode: 404,
        message: 'Notificação não encontrada'
      })
    }

    // Excluir a notificação
    const { error: erroExclusao } = await supabase
      .from('notificacoes')
      .delete()
      .eq('id', notificacaoId)

    if (erroExclusao) {
      console.error('❌ Erro ao excluir notificação:', erroExclusao)
      throw erroExclusao
    }

    console.log(`✅ Notificação excluída: "${notificacaoExistente.titulo}"`)

    return {
      success: true,
      message: 'Notificação excluída com sucesso',
      notificacao_excluida: {
        id: notificacaoId,
        titulo: notificacaoExistente.titulo,
        tipo: notificacaoExistente.tipo
      }
    }

  } catch (error: any) {
    console.error('💥 Erro ao excluir notificação:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Erro ao excluir notificação'
    })
  }
})