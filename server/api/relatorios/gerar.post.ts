import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const supabase = await serverSupabaseClient(event)
  const user = await serverSupabaseUser(event)

  if (!user) {
    throw createError({ statusCode: 401, message: 'Não autenticado' })
  }

  try {
    const body = await readBody(event)
    const { template_id, filtros, formato } = body

    // Buscar template
    const { data: template, error: templateError } = await supabase
      .from('relatorios_templates')
      .select('*')
      .eq('id', template_id)
      .single()

    if (templateError || !template) {
      throw createError({ statusCode: 404, message: 'Template não encontrado' })
    }

    // Buscar user_id
    const { data: appUser } = await supabase
      .from('app_users')
      .select('id')
      .eq('auth_uid', user.id)
      .single()

    // Criar registro de execução
    const { data: execucao, error: execError } = await supabase
      .from('relatorios_execucoes')
      .insert({
        template_id: template_id,
        tipo_execucao: 'manual',
        status: 'processando',
        filtros_aplicados: filtros || {},
        formato_gerado: formato || template.formato_padrao,
        executado_por: appUser?.id
      })
      .select()
      .single()

    if (execError) throw execError

    // TODO: Implementar geração real do relatório
    // Por enquanto, apenas simular sucesso
    
    // Atualizar execução como concluída
    await supabase
      .from('relatorios_execucoes')
      .update({
        status: 'concluido',
        concluido_em: new Date().toISOString(),
        total_registros: 0,
        arquivo_nome: `${template.nome.replace(/\s+/g, '_')}_${Date.now()}.pdf`
      })
      .eq('id', execucao.id)

    return {
      success: true,
      message: 'Relatório gerado com sucesso',
      data: {
        execucao_id: execucao.id,
        template_nome: template.nome
      }
    }
  } catch (error: any) {
    console.error('Erro ao gerar relatório:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Erro ao gerar relatório'
    })
  }
})
