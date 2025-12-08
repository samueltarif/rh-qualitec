import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const client = await serverSupabaseClient(event) as any
  const user = await serverSupabaseUser(event)
  if (!user) throw createError({ statusCode: 401, message: 'Não autenticado' })

  const body = await readBody(event)

  // Buscar app_user pelo auth_uid
  let { data: appUser } = await client
    .from('app_users')
    .select('id, colaborador_id')
    .eq('auth_uid', user.id)
    .single()

  // Se não encontrou por auth_uid, tentar por email
  if (!appUser && user.email) {
    const { data: appUserByEmail } = await client
      .from('app_users')
      .select('id, colaborador_id')
      .eq('email', user.email)
      .single()
    
    if (appUserByEmail) {
      await client.from('app_users').update({ auth_uid: user.id }).eq('id', appUserByEmail.id)
      appUser = appUserByEmail
    }
  }

  if (!appUser?.colaborador_id) {
    throw createError({ statusCode: 400, message: 'Usuário não vinculado a colaborador' })
  }

  // Atualizar diretamente (não precisa aprovação)
  const { error } = await client
    .from('colaboradores')
    .update({
      cep: body.cep || null,
      logradouro: body.logradouro || null,
      numero: body.numero || null,
      complemento: body.complemento || null,
      bairro: body.bairro || null,
      cidade: body.cidade || null,
      estado: body.estado || null
    })
    .eq('id', appUser.colaborador_id)

  if (error) throw createError({ statusCode: 500, message: error.message })

  // Registrar atividade inline
  try {
    await client.rpc('fn_registrar_atividade', {
      p_tipo_acao: 'update',
      p_modulo: 'solicitacoes',
      p_descricao: 'Atualizou endereço',
      p_detalhes: JSON.stringify({ cidade: body.cidade, estado: body.estado })
    })
  } catch (e) {
    console.error('Erro ao registrar atividade:', e)
  }

  return { success: true, message: 'Endereço atualizado!' }
})
