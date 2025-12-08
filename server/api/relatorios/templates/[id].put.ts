import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const supabase = await serverSupabaseClient(event)
  const user = await serverSupabaseUser(event)

  if (!user) {
    throw createError({ statusCode: 401, message: 'Não autenticado' })
  }

  try {
    const id = getRouterParam(event, 'id')
    const body = await readBody(event)

    // Verificar permissão
    const { data: appUser } = await supabase
      .from('app_users')
      .select('role')
      .eq('auth_uid', user.id)
      .single()

    if (!appUser || !['admin', 'rh'].includes(appUser.role)) {
      throw createError({ statusCode: 403, message: 'Sem permissão' })
    }

    // Atualizar template
    const { data: template, error } = await supabase
      .from('relatorios_templates')
      .update({
        nome: body.nome,
        descricao: body.descricao,
        categoria: body.categoria,
        entidade_principal: body.entidade_principal,
        campos_selecionados: body.campos_selecionados,
        formato_padrao: body.formato_padrao,
        orientacao: body.orientacao,
        incluir_logo: body.incluir_logo,
        incluir_cabecalho: body.incluir_cabecalho,
        incluir_rodape: body.incluir_rodape,
        ativo: body.ativo,
        favorito: body.favorito
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    return {
      success: true,
      data: template
    }
  } catch (error: any) {
    console.error('Erro ao atualizar template:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Erro ao atualizar template'
    })
  }
})
