import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'

export default defineEventHandler(async (event) => {
  try {
    const user = await serverSupabaseUser(event)
    if (!user) {
      throw createError({ statusCode: 401, message: 'Não autenticado' })
    }

    const body = await readBody(event)
    const supabase = await serverSupabaseClient(event)

    // Registrar no histórico
    const { data, error } = await supabase
      .from('historico_exportacoes')
      .insert({
        tipo_entidade: body.tipoEntidade,
        formato: body.formato,
        filtros: body.filtros || {},
        status: 'processando',
        usuario_id: user.id,
        expira_em: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24h
      } as any)
      .select()
      .single()

    if (error) throw error

    // TODO: Implementar geração real do arquivo
    // Por enquanto, simula sucesso
    const arquivoNome = `${body.tipoEntidade}_${Date.now()}.${body.formato}`
    
    // @ts-ignore
    await supabase
      .from('historico_exportacoes')
      .update({
        status: 'concluido',
        arquivo_nome: arquivoNome,
        total_registros: 0,
        completed_at: new Date().toISOString(),
      } as any)
      .eq('id', (data as any).id)

    return {
      success: true,
      message: 'Exportação gerada com sucesso',
      data,
    }
  } catch (error: any) {
    console.error('Erro na exportação:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Erro ao processar exportação',
    })
  }
})
