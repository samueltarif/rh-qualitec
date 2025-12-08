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

    // Atualizar campo
    const { data: campo, error } = await supabase
      .from('campos_customizados')
      .update({
        label: body.label,
        descricao: body.descricao,
        tipo_campo: body.tipo_campo,
        opcoes: body.opcoes,
        obrigatorio: body.obrigatorio,
        valor_padrao: body.valor_padrao,
        mascara: body.mascara,
        ordem: body.ordem,
        grupo: body.grupo,
        visivel: body.visivel,
        editavel: body.editavel,
        ativo: body.ativo
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    return {
      success: true,
      data: campo
    }
  } catch (error: any) {
    console.error('Erro ao atualizar campo customizado:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Erro ao atualizar campo customizado'
    })
  }
})
