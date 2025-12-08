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

  // Buscar empresa_id do colaborador
  const { data: colab } = await client
    .from('colaboradores')
    .select('empresa_id')
    .eq('id', appUser.colaborador_id)
    .single()

  if (!colab?.empresa_id) {
    throw createError({ statusCode: 400, message: 'Empresa não encontrada' })
  }

  const empresaId = colab.empresa_id

  // Buscar dados atuais para guardar como "anteriores"
  const { data: colaborador } = await client
    .from('colaboradores')
    .select('banco_nome, banco_codigo, agencia, conta, tipo_conta, pix')
    .eq('id', appUser.colaborador_id)
    .single()

  // Criar solicitação de alteração (precisa aprovação)
  const { error } = await client
    .from('solicitacoes_alteracao_dados')
    .insert({
      empresa_id: empresaId,
      colaborador_id: appUser.colaborador_id,
      tipo: 'dados_bancarios',
      dados_anteriores: colaborador || {},
      dados_novos: {
        banco_nome: body.banco_nome,
        banco_codigo: body.banco_codigo,
        agencia: body.agencia,
        conta: body.conta,
        tipo_conta: body.tipo_conta,
        pix: body.pix
      },
      requer_aprovacao: true,
      status: 'pendente'
    })

  if (error) throw createError({ statusCode: 500, message: error.message })

  // Registrar atividade inline
  try {
    await client.rpc('fn_registrar_atividade', {
      p_tipo_acao: 'create',
      p_modulo: 'solicitacoes',
      p_descricao: 'Solicitou alteração de dados bancários',
      p_detalhes: JSON.stringify({ banco: body.banco_nome })
    })
  } catch (e) {
    console.error('Erro ao registrar atividade:', e)
  }

  return { success: true, message: 'Solicitação enviada para aprovação!' }
})
