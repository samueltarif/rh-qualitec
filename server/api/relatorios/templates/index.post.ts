import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const supabase = await serverSupabaseClient(event)
  const user = await serverSupabaseUser(event)

  if (!user) {
    throw createError({ statusCode: 401, message: 'Não autenticado' })
  }

  try {
    const body = await readBody(event)

    // Buscar user_id
    const { data: appUser } = await supabase
      .from('app_users')
      .select('id, role')
      .eq('auth_uid', user.id)
      .single()

    if (!appUser || !['admin', 'rh'].includes(appUser.role)) {
      throw createError({ statusCode: 403, message: 'Sem permissão' })
    }

    // Criar template
    const { data: template, error } = await supabase
      .from('relatorios_templates')
      .insert({
        nome: body.nome,
        descricao: body.descricao,
        categoria: body.categoria,
        entidade_principal: body.entidade_principal,
        campos_selecionados: body.campos_selecionados,
        formato_padrao: body.formato_padrao || 'pdf',
        orientacao: body.orientacao || 'portrait',
        incluir_logo: body.incluir_logo !== false,
        incluir_cabecalho: body.incluir_cabecalho !== false,
        incluir_rodape: body.incluir_rodape !== false,
        ativo: body.ativo !== false,
        created_by: appUser.id
      })
      .select()
      .single()

    if (error) throw error

    return {
      success: true,
      data: template
    }
  } catch (error: any) {
    console.error('Erro ao criar template:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Erro ao criar template de relatório'
    })
  }
})
