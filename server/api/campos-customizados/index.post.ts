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

    // Criar campo
    const { data: campo, error } = await supabase
      .from('campos_customizados')
      .insert({
        nome: body.nome,
        label: body.label,
        descricao: body.descricao,
        entidade: body.entidade,
        tipo_campo: body.tipo_campo,
        opcoes: body.opcoes,
        obrigatorio: body.obrigatorio || false,
        valor_padrao: body.valor_padrao,
        mascara: body.mascara,
        ordem: body.ordem || 0,
        grupo: body.grupo,
        visivel: body.visivel !== false,
        editavel: body.editavel !== false,
        ativo: body.ativo !== false,
        created_by: appUser.id
      })
      .select()
      .single()

    if (error) throw error

    return {
      success: true,
      data: campo
    }
  } catch (error: any) {
    console.error('Erro ao criar campo customizado:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Erro ao criar campo customizado'
    })
  }
})
