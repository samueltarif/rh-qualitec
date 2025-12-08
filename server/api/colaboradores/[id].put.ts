import { serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const client = await serverSupabaseClient(event) as any
  
  // Obter sessão
  const { data: { session } } = await client.auth.getSession()
  
  if (!session?.user) {
    throw createError({ statusCode: 401, message: 'Não autenticado' })
  }

  const authUid = session.user.id
  const id = getRouterParam(event, 'id')
  const body = await readBody(event)

  // Verificar se é admin
  const { data: appUser } = await client
    .from('app_users')
    .select('id, role')
    .eq('auth_uid', authUid)
    .single()

  if (!appUser || appUser.role !== 'admin') {
    throw createError({ statusCode: 403, message: 'Apenas administradores podem editar colaboradores' })
  }

  // Campos permitidos para atualização
  const camposPermitidos = [
    // Identificação
    'nome', 'cpf', 'rg', 'orgao_emissor', 'data_emissao', 'data_nascimento', 
    'sexo', 'estado_civil', 'escolaridade', 'matricula', 'foto_url',
    
    // Profissional
    'cargo_id', 'departamento_id', 'unidade', 'tipo_contrato', 
    'jornada_trabalho', 'salario', 'data_admissao', 'data_desligamento', 
    'status', 'regime_pagamento',
    
    // Contato
    'email_corporativo', 'email_pessoal', 'email_alternativo', 
    'telefone', 'celular', 'contato_emergencia_nome', 
    'contato_emergencia_telefone', 'contato_emergencia_parentesco',
    
    // Endereço
    'cep', 'endereco', 'numero', 'complemento', 'bairro', 'cidade', 'estado',
    
    // Dados Bancários
    'banco_codigo', 'banco_nome', 'agencia', 'conta', 'tipo_conta', 'pix',
    
    // Documentos
    'pis_pasep', 'ctps', 'serie_ctps',
    
    // Benefícios
    'recebe_vt', 'valor_vt', 'recebe_va_vr', 'valor_va_vr', 
    'desconto_inss_padrao',
    
    // RH
    'observacoes_rh'
  ]

  // Filtrar apenas campos permitidos
  const dadosParaAtualizar: Record<string, any> = {}
  for (const campo of camposPermitidos) {
    if (campo in body) {
      dadosParaAtualizar[campo] = body[campo]
    }
  }

  // Validações básicas
  if (dadosParaAtualizar.cpf && !/^\d{11}$/.test(dadosParaAtualizar.cpf.replace(/\D/g, ''))) {
    throw createError({ statusCode: 400, message: 'CPF inválido' })
  }

  if (dadosParaAtualizar.salario && dadosParaAtualizar.salario < 0) {
    throw createError({ statusCode: 400, message: 'Salário não pode ser negativo' })
  }

  // Atualizar colaborador
  const { data, error } = await client
    .from('colaboradores')
    .update(dadosParaAtualizar)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Erro ao atualizar colaborador:', error)
    throw createError({ statusCode: 500, message: error.message })
  }

  // Se solicitou criar usuário, criar na tabela app_users
  if (body.criar_usuario && body.usuario_email && body.usuario_senha) {
    try {
      // Criar usuário no Supabase Auth
      const { data: authData, error: authError } = await client.auth.admin.createUser({
        email: body.usuario_email,
        password: body.usuario_senha,
        email_confirm: true
      })

      if (authError) throw authError

      // Criar registro em app_users
      const { error: userError } = await client
        .from('app_users')
        .insert({
          auth_uid: authData.user.id,
          nome: data.nome,
          email: body.usuario_email,
          role: body.usuario_role || 'funcionario',
          ativo: body.usuario_ativo !== false
        })

      if (userError) throw userError

      // Vincular colaborador ao usuário
      await client
        .from('colaboradores')
        .update({ user_id: authData.user.id })
        .eq('id', id)

    } catch (err: any) {
      console.error('Erro ao criar usuário:', err)
      // Não falhar a atualização do colaborador se falhar criar usuário
    }
  }

  return { success: true, data }
})
