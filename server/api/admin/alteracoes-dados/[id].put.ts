import { serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const client = await serverSupabaseClient(event) as any
  
  // Obter sessão diretamente
  const { data: { session } } = await client.auth.getSession()
  
  console.log('🔍 [AUTH] Session:', session)
  
  if (!session?.user) {
    console.error('❌ [AUTH] Sessão não encontrada')
    throw createError({ statusCode: 401, message: 'Não autenticado' })
  }

  const authUid = session.user.id
  console.log('✅ [AUTH] Auth UID:', authUid)

  const id = getRouterParam(event, 'id')
  const body = await readBody(event)

  // Buscar app_user para pegar o ID
  const { data: appUser, error: appUserError } = await client
    .from('app_users')
    .select('id, role, nome, email')
    .eq('auth_uid', authUid)
    .single()

  console.log('🔍 [AUTH] App User:', appUser)
  console.log('🔍 [AUTH] App User Error:', appUserError)

  if (!appUser) {
    console.error('❌ [AUTH] App user não encontrado para auth_uid:', authUid)
    throw createError({ statusCode: 403, message: 'Usuário não encontrado no sistema' })
  }

  if (!['admin', 'gestor'].includes(appUser.role)) {
    console.error('❌ [AUTH] Usuário sem permissão. Role:', appUser.role)
    throw createError({ statusCode: 403, message: 'Sem permissão' })
  }

  console.log('✅ [AUTH] Usuário autorizado:', appUser.nome, '- Role:', appUser.role)

  // Buscar a solicitação
  const { data: solicitacao } = await client
    .from('solicitacoes_alteracao_dados')
    .select('*')
    .eq('id', id)
    .single()

  if (!solicitacao) {
    throw createError({ statusCode: 404, message: 'Solicitação não encontrada' })
  }

  if (solicitacao.status !== 'pendente') {
    throw createError({ statusCode: 400, message: 'Solicitação já foi processada' })
  }

  if (body.acao === 'aprovar') {
    // Atualizar os dados do colaborador baseado no tipo
    let updateError = null
    
    if (solicitacao.tipo === 'dados_bancarios') {
      const { error } = await client
        .from('colaboradores')
        .update({
          banco_nome: solicitacao.dados_novos.banco_nome,
          banco_codigo: solicitacao.dados_novos.banco_codigo,
          agencia: solicitacao.dados_novos.agencia,
          conta: solicitacao.dados_novos.conta,
          tipo_conta: solicitacao.dados_novos.tipo_conta,
          pix: solicitacao.dados_novos.pix
        })
        .eq('id', solicitacao.colaborador_id)
      updateError = error
    } else if (solicitacao.tipo === 'endereco') {
      const { error } = await client
        .from('colaboradores')
        .update({
          endereco: solicitacao.dados_novos.endereco,
          numero: solicitacao.dados_novos.numero,
          complemento: solicitacao.dados_novos.complemento,
          bairro: solicitacao.dados_novos.bairro,
          cidade: solicitacao.dados_novos.cidade,
          estado: solicitacao.dados_novos.estado,
          cep: solicitacao.dados_novos.cep
        })
        .eq('id', solicitacao.colaborador_id)
      updateError = error
    } else if (solicitacao.tipo === 'contato_emergencia') {
      const { error } = await client
        .from('colaboradores')
        .update({
          contato_emergencia_nome: solicitacao.dados_novos.contato_emergencia_nome,
          contato_emergencia_telefone: solicitacao.dados_novos.contato_emergencia_telefone,
          contato_emergencia_parentesco: solicitacao.dados_novos.contato_emergencia_parentesco
        })
        .eq('id', solicitacao.colaborador_id)
      updateError = error
    } else if (solicitacao.tipo === 'dados_pessoais') {
      const { error } = await client
        .from('colaboradores')
        .update({
          telefone: solicitacao.dados_novos.telefone,
          email: solicitacao.dados_novos.email,
          estado_civil: solicitacao.dados_novos.estado_civil
        })
        .eq('id', solicitacao.colaborador_id)
      updateError = error
    } else if (solicitacao.tipo === 'documentos') {
      const { error } = await client
        .from('colaboradores')
        .update({
          rg: solicitacao.dados_novos.rg,
          orgao_emissor: solicitacao.dados_novos.orgao_emissor,
          data_emissao: solicitacao.dados_novos.data_emissao,
          ctps: solicitacao.dados_novos.ctps,
          serie_ctps: solicitacao.dados_novos.serie_ctps,
          pis_pasep: solicitacao.dados_novos.pis_pasep
        })
        .eq('id', solicitacao.colaborador_id)
      updateError = error
    }

    if (updateError) throw createError({ statusCode: 500, message: updateError.message })

    // Marcar como aprovada
    const { error } = await client
      .from('solicitacoes_alteracao_dados')
      .update({
        status: 'aprovada',
        aprovado_por: appUser.id,
        aprovado_em: new Date().toISOString()
      })
      .eq('id', id)

    if (error) throw createError({ statusCode: 500, message: error.message })

    return { success: true, message: 'Alteração aprovada e aplicada!' }
  } else if (body.acao === 'rejeitar') {
    const { error } = await client
      .from('solicitacoes_alteracao_dados')
      .update({
        status: 'rejeitada',
        motivo_rejeicao: body.motivo || 'Não informado',
        aprovado_por: appUser.id,
        aprovado_em: new Date().toISOString()
      })
      .eq('id', id)

    if (error) throw createError({ statusCode: 500, message: error.message })

    return { success: true, message: 'Alteração rejeitada!' }
  }

  throw createError({ statusCode: 400, message: 'Ação inválida' })
})
