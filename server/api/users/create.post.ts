export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { email, password, nome, role, colaborador_id } = body

    // Normalizar email
    const normalizedEmail = email?.toLowerCase().trim()

    // Validações básicas
    if (!normalizedEmail || !password || !nome) {
      throw createError({ statusCode: 400, message: 'Email, senha e nome são obrigatórios' })
    }

    if (password.length < 6) {
      throw createError({ statusCode: 400, message: 'Senha deve ter no mínimo 6 caracteres' })
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(normalizedEmail)) {
      throw createError({ statusCode: 400, message: 'Email inválido' })
    }

    // Validar role - só pode ser 'funcionario' (admin é restrito)
    const userRole = (role === 'admin' && normalizedEmail === 'silvana@qualitec.ind.br') ? 'admin' : 'funcionario'

    const config = useRuntimeConfig()
    const supabaseUrl = config.public.supabaseUrl
    const serviceKey = config.supabaseServiceKey

    if (!serviceKey) {
      throw createError({ statusCode: 500, message: 'Service key não configurada' })
    }

    console.log('[CREATE USER] Iniciando criação para:', normalizedEmail)

    // 1. Verificar se já existe em app_users
    const existingAppUsers = await $fetch<any[]>(`${supabaseUrl}/rest/v1/app_users?email=eq.${encodeURIComponent(normalizedEmail)}&select=id,email,auth_uid,ativo`, {
      headers: { 'Authorization': `Bearer ${serviceKey}`, 'apikey': serviceKey },
    })

    console.log('[CREATE USER] Usuários existentes em app_users:', existingAppUsers)

    if (existingAppUsers && existingAppUsers.length > 0) {
      const existingUser = existingAppUsers[0]
      if (existingUser.ativo) {
        throw createError({ statusCode: 400, message: `Este email (${normalizedEmail}) já está cadastrado no sistema. Verifique a lista de usuários.` })
      } else {
        // Usuário existe mas está inativo - reativar
        throw createError({ statusCode: 400, message: `Este email já existe mas está inativo. Use a opção de reativar usuário na lista.` })
      }
    }

    // 2. Verificar se existe no Supabase Auth
    let authUserId: string | null = null
    let authUserExists = false

    try {
      // Buscar usuário existente no Auth por email
      const searchResponse = await $fetch<any>(`${supabaseUrl}/auth/v1/admin/users`, {
        headers: { 'Authorization': `Bearer ${serviceKey}`, 'apikey': serviceKey },
      })
      
      console.log('[CREATE USER] Total de usuários no Auth:', searchResponse?.users?.length || 0)
      
      if (searchResponse?.users) {
        const existingAuthUser = searchResponse.users.find((u: any) => u.email?.toLowerCase() === normalizedEmail)
        if (existingAuthUser) {
          authUserId = existingAuthUser.id
          authUserExists = true
          console.log('[CREATE USER] Usuário já existe no Auth com ID:', authUserId)
        }
      }
    } catch (searchError: any) {
      console.error('[CREATE USER] Erro ao buscar usuários no Auth:', searchError.message)
    }

    // 3. Se não existe no Auth, criar
    if (!authUserId) {
      try {
        console.log('[CREATE USER] Criando novo usuário no Auth...')
        const authResponse = await $fetch<any>(`${supabaseUrl}/auth/v1/admin/users`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${serviceKey}`,
            'Content-Type': 'application/json',
            'apikey': serviceKey,
          },
          body: { 
            email: normalizedEmail, 
            password, 
            email_confirm: true, 
            user_metadata: { nome } 
          },
        })
        authUserId = authResponse.id
        console.log('[CREATE USER] Usuário criado no Auth com ID:', authUserId)
      } catch (authError: any) {
        const errorMsg = authError.data?.msg || authError.data?.message || authError.message || ''
        console.error('[CREATE USER] Erro ao criar no Auth:', errorMsg)
        
        // Se o erro for "já existe", tentar buscar novamente
        if (errorMsg.includes('already registered') || errorMsg.includes('already exists')) {
          // Tentar buscar de novo
          try {
            const retrySearch = await $fetch<any>(`${supabaseUrl}/auth/v1/admin/users`, {
              headers: { 'Authorization': `Bearer ${serviceKey}`, 'apikey': serviceKey },
            })
            const found = retrySearch?.users?.find((u: any) => u.email?.toLowerCase() === normalizedEmail)
            if (found) {
              authUserId = found.id
              authUserExists = true
              console.log('[CREATE USER] Encontrado após retry:', authUserId)
            }
          } catch {
            // Ignorar
          }
          
          if (!authUserId) {
            throw createError({ 
              statusCode: 400, 
              message: 'Email já existe no sistema de autenticação mas não foi possível vincular. Contate o administrador.' 
            })
          }
        } else {
          throw createError({ statusCode: 400, message: errorMsg || 'Erro ao criar usuário no sistema de autenticação' })
        }
      }
    } else if (authUserExists) {
      // Usuário existe no Auth mas não em app_users - atualizar senha
      console.log('[CREATE USER] Atualizando senha do usuário existente no Auth...')
      try {
        await $fetch<any>(`${supabaseUrl}/auth/v1/admin/users/${authUserId}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${serviceKey}`,
            'Content-Type': 'application/json',
            'apikey': serviceKey,
          },
          body: { 
            password,
            email_confirm: true,
            user_metadata: { nome }
          },
        })
        console.log('[CREATE USER] Senha atualizada com sucesso')
      } catch (updateError: any) {
        console.error('[CREATE USER] Erro ao atualizar senha:', updateError.message)
        // Continuar mesmo se falhar a atualização de senha
      }
    }

    if (!authUserId) {
      throw createError({ statusCode: 500, message: 'Falha ao obter ID do usuário' })
    }

    // 4. Verificar se auth_uid já está vinculado a outro usuário em app_users
    const existingByAuthUid = await $fetch<any[]>(`${supabaseUrl}/rest/v1/app_users?auth_uid=eq.${authUserId}&select=id,email`, {
      headers: { 'Authorization': `Bearer ${serviceKey}`, 'apikey': serviceKey },
    })

    if (existingByAuthUid && existingByAuthUid.length > 0) {
      throw createError({ 
        statusCode: 400, 
        message: `Este usuário de autenticação já está vinculado ao email ${existingByAuthUid[0].email}. Contate o administrador.` 
      })
    }

    // 5. Criar registro em app_users
    console.log('[CREATE USER] Criando registro em app_users...')
    try {
      const appUserResponse = await $fetch<any>(`${supabaseUrl}/rest/v1/app_users`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${serviceKey}`,
          'Content-Type': 'application/json',
          'apikey': serviceKey,
          'Prefer': 'return=representation',
        },
        body: {
          auth_uid: authUserId,
          email: normalizedEmail,
          nome: nome.trim(),
          role: userRole,
          colaborador_id: colaborador_id || null,
          ativo: true,
        },
      })

      console.log('[CREATE USER] Usuário criado com sucesso:', appUserResponse)
      return { success: true, data: appUserResponse }
    } catch (dbError: any) {
      const dbErrorMsg = dbError.data?.message || dbError.message || ''
      console.error('[CREATE USER] Erro ao criar em app_users:', dbErrorMsg)
      
      // Se falhou ao criar em app_users, verificar se é duplicata
      if (dbErrorMsg.includes('duplicate') || dbErrorMsg.includes('unique') || dbErrorMsg.includes('already exists')) {
        throw createError({ 
          statusCode: 400, 
          message: 'Este email ou usuário já existe no sistema. Verifique a lista de usuários.' 
        })
      }
      
      // Se é erro de constraint (admin)
      if (dbErrorMsg.includes('chk_admin_email')) {
        throw createError({ 
          statusCode: 400, 
          message: 'Apenas silvana@qualitec.ind.br pode ter role de admin.' 
        })
      }
      
      throw createError({ statusCode: 500, message: dbErrorMsg || 'Erro ao salvar usuário no banco de dados' })
    }
  } catch (error: any) {
    console.error('[CREATE USER] Erro geral:', error.message || error)
    const msg = error.message || error.statusMessage || error.data?.message || 'Erro ao criar usuário'
    throw createError({ statusCode: error.statusCode || 500, message: msg })
  }
})
