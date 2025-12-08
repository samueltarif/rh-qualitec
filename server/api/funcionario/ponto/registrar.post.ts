import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const client = await serverSupabaseClient(event)
  const user = await serverSupabaseUser(event)
  const body = await readBody(event)

  // O Supabase retorna o ID no campo 'sub', não 'id'
  const userId = user?.id || user?.sub
  
  console.log('🔍 [PONTO] User object:', user)
  console.log('🔍 [PONTO] User ID (id):', user?.id)
  console.log('🔍 [PONTO] User ID (sub):', user?.sub)
  console.log('🔍 [PONTO] User ID final:', userId)

  if (!user || !userId) {
    console.error('❌ [PONTO] Usuário não autenticado ou sem ID')
    throw createError({ statusCode: 401, message: 'Não autenticado ou sessão inválida' })
  }

  // Validar que userId é um UUID válido
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  if (!uuidRegex.test(userId)) {
    console.error('❌ [PONTO] User ID inválido:', userId)
    throw createError({ statusCode: 401, message: 'ID de usuário inválido. Faça login novamente.' })
  }

  try {
    console.log('🔍 [PONTO] Iniciando registro de ponto')
    console.log('🔍 [PONTO] User ID:', userId)
    console.log('🔍 [PONTO] User email:', user.email)
    
    // Buscar colaborador_id do usuário
    const { data: appUserData, error: appUserError } = await client
      .from('app_users')
      .select('id, colaborador_id, role')
      .eq('auth_uid', userId)
      .single()

    console.log('🔍 [PONTO] App User Data:', appUserData)
    console.log('🔍 [PONTO] App User Error:', appUserError)

    const appUser = appUserData as { id: string; colaborador_id: string | null; role: string } | null

    if (appUserError) {
      console.error('❌ [PONTO] Erro ao buscar app_user:', appUserError)
      throw createError({ statusCode: 400, message: `Erro ao buscar dados do usuário: ${appUserError.message}` })
    }

    if (!appUser?.colaborador_id) {
      console.error('❌ [PONTO] Usuário sem colaborador_id')
      throw createError({ statusCode: 400, message: 'Usuário não vinculado a um colaborador. Contate o RH.' })
    }

    console.log('🔍 [PONTO] Colaborador ID:', appUser.colaborador_id)

    // Buscar empresa_id do colaborador
    const { data: colabData, error: colabError } = await client
      .from('colaboradores')
      .select('empresa_id, nome')
      .eq('id', appUser.colaborador_id)
      .single()

    console.log('🔍 [PONTO] Colaborador Data:', colabData)
    console.log('🔍 [PONTO] Colaborador Error:', colabError)

    const colaborador = colabData as { empresa_id: string; nome: string } | null

    if (colabError || !colaborador?.empresa_id) {
      console.error('❌ [PONTO] Erro ao buscar colaborador:', colabError)
      throw createError({ statusCode: 400, message: `Colaborador não vinculado a uma empresa: ${colabError?.message || 'empresa_id null'}` })
    }
    
    const empresaId = colaborador.empresa_id

    const hoje = new Date().toISOString().split('T')[0]
    const agora = new Date().toTimeString().split(' ')[0].substring(0, 5)

    // Verificar se já existe registro para hoje
    const { data: regData, error: fetchError } = await client
      .from('registros_ponto')
      .select('*')
      .eq('colaborador_id', appUser.colaborador_id)
      .eq('data', hoje)
      .maybeSingle()

    const registroExistente = regData as any

    if (fetchError) {
      console.error('Erro ao buscar registro existente:', fetchError)
      throw createError({ statusCode: 500, message: 'Erro ao verificar registros do dia' })
    }

    if (registroExistente) {
      // Atualizar registro existente
      const updates: Record<string, any> = {}
      let tipoRegistro = ''
      
      if (!registroExistente.entrada_1) {
        updates.entrada_1 = agora
        tipoRegistro = 'Entrada'
      } else if (!registroExistente.saida_1) {
        updates.saida_1 = agora
        tipoRegistro = 'Saída Intervalo'
      } else if (!registroExistente.entrada_2) {
        updates.entrada_2 = agora
        tipoRegistro = 'Retorno Intervalo'
      } else if (!registroExistente.saida_2) {
        updates.saida_2 = agora
        tipoRegistro = 'Saída'
      } else if (!registroExistente.entrada_3) {
        updates.entrada_3 = agora
        tipoRegistro = 'Entrada Extra'
      } else if (!registroExistente.saida_3) {
        updates.saida_3 = agora
        tipoRegistro = 'Saída Extra'
      } else {
        throw createError({ statusCode: 400, message: 'Todos os registros do dia já foram preenchidos (máximo 6 batidas)' })
      }

      if (body.ip) updates.ip_registro = body.ip
      if (body.localizacao) updates.localizacao = body.localizacao

      const { data, error } = await (client
        .from('registros_ponto') as any)
        .update(updates)
        .eq('id', registroExistente.id)
        .select()
        .single()

      if (error) {
        console.error('Erro ao atualizar ponto:', error)
        throw createError({ statusCode: 500, message: error.message })
      }

      return { 
        registro: data, 
        tipo: tipoRegistro,
        horario: agora,
        message: `${tipoRegistro} registrada às ${agora}` 
      }
    } else {
      // Criar novo registro
      const { data, error } = await (client
        .from('registros_ponto') as any)
        .insert({
          empresa_id: empresaId,
          colaborador_id: appUser.colaborador_id,
          data: hoje,
          entrada_1: agora,
          ip_registro: body.ip || null,
          localizacao: body.localizacao || null,
          status: 'Normal'
        })
        .select()
        .single()

      if (error) {
        console.error('Erro ao criar registro de ponto:', error)
        throw createError({ statusCode: 500, message: error.message })
      }

      return { 
        registro: data, 
        tipo: 'Entrada',
        horario: agora,
        message: `Entrada registrada às ${agora}` 
      }
    }
  } catch (e: any) {
    console.error('Erro ao registrar ponto:', e)
    throw createError({ statusCode: e.statusCode || 500, message: e.message || 'Erro ao registrar ponto' })
  }
})
