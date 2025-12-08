/**
 * API para atualizar usuário
 * Permite editar: nome, email, senha, role, colaborador_id, ativo
 */
export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { id, nome, email, password, role, colaborador_id, ativo } = body

    if (!id) {
      throw createError({ statusCode: 400, message: 'ID do usuário é obrigatório' })
    }

    const config = useRuntimeConfig()
    const supabaseUrl = config.public.supabaseUrl
    const serviceKey = config.supabaseServiceKey

    if (!serviceKey) {
      throw createError({ statusCode: 500, message: 'Service key não configurada' })
    }

    // 1. Buscar usuário atual
    const currentUsers = await $fetch<any[]>(`${supabaseUrl}/rest/v1/app_users?id=eq.${id}&select=*`, {
      headers: { 'Authorization': `Bearer ${serviceKey}`, 'apikey': serviceKey },
    })

    if (!currentUsers || currentUsers.length === 0) {
      throw createError({ statusCode: 404, message: 'Usuário não encontrado' })
    }

    const currentUser = currentUsers[0]
    const normalizedEmail = email?.toLowerCase().trim()

    // 2. Validar role - só silvana pode ser admin
    let userRole = role || currentUser.role
    if (userRole === 'admin' && normalizedEmail !== 'silvana@qualitec.ind.br') {
      userRole = 'funcionario'
    }

    // 3. Se email mudou, verificar se já existe
    if (normalizedEmail && normalizedEmail !== currentUser.email) {
      const existingEmail = await $fetch<any[]>(`${supabaseUrl}/rest/v1/app_users?email=eq.${encodeURIComponent(normalizedEmail)}&id=neq.${id}&select=id`, {
        headers: { 'Authorization': `Bearer ${serviceKey}`, 'apikey': serviceKey },
      })

      if (existingEmail && existingEmail.length > 0) {
        throw createError({ statusCode: 400, message: 'Este email já está em uso por outro usuário' })
      }
    }

    // 4. Atualizar no Supabase Auth (se tiver auth_uid)
    if (currentUser.auth_uid) {
      const authUpdateBody: any = {}
      
      if (normalizedEmail && normalizedEmail !== currentUser.email) {
        authUpdateBody.email = normalizedEmail
      }
      
      if (password && password.length >= 6) {
        authUpdateBody.password = password
      }

      if (nome) {
        authUpdateBody.user_metadata = { nome }
      }

      if (Object.keys(authUpdateBody).length > 0) {
        try {
          await $fetch(`${supabaseUrl}/auth/v1/admin/users/${currentUser.auth_uid}`, {
            method: 'PUT',
            headers: {
              'Authorization': `Bearer ${serviceKey}`,
              'Content-Type': 'application/json',
              'apikey': serviceKey,
            },
            body: authUpdateBody,
          })
          console.log('[UPDATE USER] Auth atualizado com sucesso')
        } catch (authError: any) {
          console.error('[UPDATE USER] Erro ao atualizar Auth:', authError.message)
          // Se for erro de email duplicado no Auth
          if (authError.message?.includes('already') || authError.data?.message?.includes('already')) {
            throw createError({ statusCode: 400, message: 'Este email já existe no sistema de autenticação' })
          }
        }
      }
    }

    // 5. Atualizar em app_users
    const updateData: any = {
      updated_at: new Date().toISOString(),
    }

    if (nome) updateData.nome = nome.trim()
    if (normalizedEmail) updateData.email = normalizedEmail
    if (userRole) updateData.role = userRole
    if (typeof ativo === 'boolean') updateData.ativo = ativo
    if (colaborador_id !== undefined) updateData.colaborador_id = colaborador_id || null

    const updatedUser = await $fetch<any[]>(`${supabaseUrl}/rest/v1/app_users?id=eq.${id}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${serviceKey}`,
        'Content-Type': 'application/json',
        'apikey': serviceKey,
        'Prefer': 'return=representation',
      },
      body: updateData,
    })

    console.log('[UPDATE USER] Usuário atualizado:', updatedUser)
    return { success: true, data: updatedUser?.[0] || updatedUser }
  } catch (error: any) {
    console.error('[UPDATE USER] Erro:', error.message || error)
    throw createError({ 
      statusCode: error.statusCode || 500, 
      message: error.message || 'Erro ao atualizar usuário' 
    })
  }
})
