export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    
    // Validações básicas obrigatórias
    if (!body.nome || !body.cpf) {
      throw createError({ 
        statusCode: 400, 
        statusMessage: 'Nome e CPF são obrigatórios' 
      })
    }

    // Validar formato do nome
    if (typeof body.nome !== 'string' || body.nome.trim().length < 2) {
      throw createError({ 
        statusCode: 400, 
        statusMessage: 'Nome deve ter pelo menos 2 caracteres' 
      })
    }

    // Validar CPF básico
    const cpfLimpo = body.cpf.replace(/\D/g, '')
    if (cpfLimpo.length !== 11) {
      throw createError({ 
        statusCode: 400, 
        statusMessage: 'CPF deve ter 11 dígitos' 
      })
    }

    const config = useRuntimeConfig()
    const supabaseUrl = config.public.supabaseUrl
    const serviceKey = config.supabaseServiceKey

    if (!serviceKey) {
      throw createError({ 
        statusCode: 500, 
        statusMessage: 'Service key não configurada' 
      })
    }

    // GARANTIR EMPRESA PADRÃO - Buscar em ambas as tabelas possíveis
    let empresaId = body.empresa_id
    if (!empresaId) {
      try {
        // Tentar tabela empresas primeiro
        let empresaResponse
        try {
          empresaResponse = await $fetch<any[]>(`${supabaseUrl}/rest/v1/empresas?select=id&limit=1`, {
            headers: { 
              'Authorization': `Bearer ${serviceKey}`, 
              'apikey': serviceKey 
            },
          })
        } catch (err) {
          // Se falhar, tentar tabela empresa (singular)
          empresaResponse = await $fetch<any[]>(`${supabaseUrl}/rest/v1/empresa?select=id&limit=1`, {
            headers: { 
              'Authorization': `Bearer ${serviceKey}`, 
              'apikey': serviceKey 
            },
          })
        }
        
        empresaId = empresaResponse?.[0]?.id
        
        // Se ainda não tem empresa, criar uma padrão via função SQL
        if (!empresaId) {
          const { data: empresaPadrao } = await $fetch(`${supabaseUrl}/rest/v1/rpc/garantir_empresa_padrao`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${serviceKey}`,
              'Content-Type': 'application/json',
              'apikey': serviceKey,
            },
          })
          empresaId = empresaPadrao
        }
      } catch (err) {
        console.error('Erro ao buscar/criar empresa padrão:', err)
      }
    }

    if (!empresaId) {
      throw createError({ 
        statusCode: 500, 
        statusMessage: 'Não foi possível garantir empresa padrão. Verifique a configuração do sistema.' 
      })
    }

    // Preparar dados para inserção - remover campos que não devem ser inseridos
    const colaboradorData: any = {
      empresa_id: empresaId,
      nome: body.nome.trim(),
      cpf: body.cpf.replace(/\D/g, ''), // Remover caracteres não numéricos
    }

    // Adicionar campos opcionais apenas se fornecidos e não vazios
    const camposOpcionais = [
      'matricula', 'email_corporativo', 'email_pessoal', 'telefone', 'celular',
      'data_nascimento', 'data_admissao', 'salario', 'tipo_contrato', 'status',
      'cargo_id', 'departamento_id', 'rg', 'sexo', 'estado_civil',
      'cep', 'logradouro', 'numero', 'complemento', 'bairro', 'cidade', 'estado',
      'banco_codigo', 'banco_nome', 'agencia', 'conta', 'tipo_conta', 'pix',
      'pis', 'ctps', 'ctps_serie', 'jornada_trabalho', 'observacoes_rh'
    ]

    camposOpcionais.forEach(campo => {
      if (body[campo] !== undefined && body[campo] !== null && body[campo] !== '') {
        colaboradorData[campo] = body[campo]
      }
    })

    console.log('[CREATE COLABORADOR] Dados para inserção:', colaboradorData)

    // Inserir colaborador - NÃO incluir o campo 'id' para deixar o PostgreSQL gerar automaticamente
    const { data: colaborador, error: createError } = await $fetch<any>(`${supabaseUrl}/rest/v1/colaboradores`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${serviceKey}`,
        'Content-Type': 'application/json',
        'apikey': serviceKey,
        'Prefer': 'return=representation',
      },
      body: colaboradorData,
    })

    if (createError) {
      console.error('[CREATE COLABORADOR] Erro ao criar:', createError)
      throw createError
    }

    console.log('[CREATE COLABORADOR] Colaborador criado com sucesso:', colaborador)

    const colaboradorId = colaborador[0]?.id || colaborador.id

    // GARANTIR VINCULAÇÃO AUTOMÁTICA - Criar app_user se não existir
    if (colaboradorId) {
      try {
        // Verificar se já existe app_user para este colaborador
        const { data: existingAppUser } = await $fetch<any[]>(`${supabaseUrl}/rest/v1/app_users?colaborador_id=eq.${colaboradorId}&select=id`, {
          headers: { 
            'Authorization': `Bearer ${serviceKey}`, 
            'apikey': serviceKey 
          },
        })

        if (!existingAppUser || existingAppUser.length === 0) {
          // Criar app_user básico para garantir vinculação
          const appUserData = {
            colaborador_id: colaboradorId,
            nome: body.nome,
            email: body.email_corporativo || body.email_pessoal || `${body.nome.toLowerCase().replace(/\s+/g, '.')}@temp.com`,
            empresa_id: empresaId
          }

          console.log('[CREATE COLABORADOR] Criando app_user para vinculação:', appUserData)

          await $fetch(`${supabaseUrl}/rest/v1/app_users`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${serviceKey}`,
              'Content-Type': 'application/json',
              'apikey': serviceKey,
            },
            body: appUserData,
          })

          console.log('[CREATE COLABORADOR] App_user criado para vinculação automática')
        }
      } catch (appUserError: any) {
        console.error('[CREATE COLABORADOR] Erro ao criar app_user para vinculação:', appUserError)
        // Não falhar a operação, mas logar
      }
    }

    // Se foi solicitado criar usuário junto
    if (body.criar_usuario && body.usuario_email && body.usuario_senha) {
      try {
        console.log('[CREATE COLABORADOR] Criando usuário para colaborador:', colaborador[0]?.id || colaborador.id)
        
        const userResponse = await $fetch('/api/users/create', {
          method: 'POST',
          body: {
            nome: body.nome,
            email: body.usuario_email,
            password: body.usuario_senha,
            role: body.usuario_role || 'funcionario',
            colaborador_id: colaboradorId,
          },
        })

        if (!userResponse.success) {
          console.error('[CREATE COLABORADOR] Falha ao criar usuário:', userResponse.error)
          // Não falhar a operação toda, mas logar o erro
        } else {
          console.log('[CREATE COLABORADOR] Usuário criado com sucesso:', userResponse.data)
        }
      } catch (userError: any) {
        console.error('[CREATE COLABORADOR] Erro ao criar usuário:', userError.message || userError)
        // Não falhar a operação toda, mas logar o erro
      }
    }

    return { 
      success: true, 
      data: Array.isArray(colaborador) ? colaborador[0] : colaborador 
    }

  } catch (error: any) {
    console.error('[CREATE COLABORADOR] Erro geral:', error)
    
    // Tratar erros específicos do PostgreSQL
    if (error.message?.includes('null value in column "id"')) {
      throw createError({ 
        statusCode: 500, 
        statusMessage: 'Erro interno: problema na geração do ID. Verifique a configuração da tabela colaboradores.' 
      })
    }
    
    if (error.message?.includes('duplicate key') || error.message?.includes('unique constraint')) {
      if (error.message.includes('cpf')) {
        throw createError({ 
          statusCode: 400, 
          statusMessage: 'Este CPF já está cadastrado para esta empresa' 
        })
      }
      if (error.message.includes('email')) {
        throw createError({ 
          statusCode: 400, 
          statusMessage: 'Este email já está cadastrado para esta empresa' 
        })
      }
      if (error.message.includes('matricula')) {
        throw createError({ 
          statusCode: 400, 
          statusMessage: 'Esta matrícula já está cadastrada para esta empresa' 
        })
      }
      throw createError({ 
        statusCode: 400, 
        statusMessage: 'Dados duplicados: verifique CPF, email ou matrícula' 
      })
    }

    const statusCode = error.statusCode || 500
    const message = error.statusMessage || error.message || 'Erro ao criar colaborador'
    
    throw createError({ statusCode, statusMessage: message })
  }
})