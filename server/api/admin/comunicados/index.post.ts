import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const client = await serverSupabaseClient(event)
  const user = await serverSupabaseUser(event)
  const body = await readBody(event)

  if (!user) {
    throw createError({ statusCode: 401, message: 'Não autenticado' })
  }

  try {
    // Buscar app_user e empresa
    const { data: appUser } = await client
      .from('app_users')
      .select('id')
      .eq('auth_uid', user.id)
      .single()

    // Buscar empresa (primeira disponível)
    const { data: empresa } = await client
      .from('empresas')
      .select('id')
      .limit(1)
      .single()

    if (!empresa) {
      throw createError({ statusCode: 400, message: 'Nenhuma empresa cadastrada' })
    }

    const { data, error } = await client
      .from('comunicados')
      .insert({
        empresa_id: empresa.id,
        titulo: body.titulo,
        conteudo: body.conteudo,
        tipo: body.tipo || 'Informativo',
        destino: body.destino || 'todos',
        destino_ids: body.destino_ids || [],
        data_expiracao: body.data_expiracao || null,
        publicado_por: appUser?.id,
        ativo: true
      })
      .select()
      .single()

    if (error) {
      throw createError({ statusCode: 500, message: error.message })
    }

    return data
  } catch (e: any) {
    console.error('Erro ao criar comunicado:', e)
    throw createError({ statusCode: 500, message: e.message || 'Erro ao criar comunicado' })
  }
})
