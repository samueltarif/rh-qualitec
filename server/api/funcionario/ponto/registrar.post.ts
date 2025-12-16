import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const client = await serverSupabaseClient(event)
  const user = await serverSupabaseUser(event)
  const body = await readBody(event)

  const userId = user?.sub || user?.id

  if (!user || !userId) {
    throw createError({ statusCode: 401, message: 'Não autenticado ou sessão inválida' })
  }

  // Validar UUID
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  if (!uuidRegex.test(userId)) {
    throw createError({ statusCode: 401, message: 'ID de usuário inválido. Faça login novamente.' })
  }

  try {
    // Validação de GPS
    if (!body.latitude || !body.longitude) {
      throw createError({ 
        statusCode: 400, 
        message: 'GPS obrigatório. Ative a localização e tente novamente.' 
      })
    }

    // Verificar local permitido
    const { data: verificacao, error: verificacaoError } = await client
      .rpc('verificar_local_permitido', {
        p_latitude: body.latitude,
        p_longitude: body.longitude
      })

    if (verificacaoError) {
      console.error('Erro ao verificar localização:', verificacaoError)
      throw createError({ 
        statusCode: 500, 
        message: 'Erro ao verificar localização. Tente novamente.' 
      })
    }

    const localInfo = verificacao?.[0]
    
    if (!localInfo || !localInfo.dentro_raio) {
      const distancia = localInfo?.distancia || 'desconhecida'
      const localNome = localInfo?.local_nome || 'local cadastrado'
      throw createError({ 
        statusCode: 403, 
        message: `Você está fora do local permitido. Distância: ${distancia}m do ${localNome}. Aproxime-se para bater ponto.` 
      })
    }
    
    // Buscar colaborador_id do usuário
    const { data: appUserData, error: appUserError } = await client
      .from('app_users')
      .select('id, colaborador_id')
      .eq('auth_uid', userId)
      .single()

    if (appUserError || !appUserData) {
      throw createError({ 
        statusCode: 400, 
        message: 'Usuário não encontrado no sistema'
      })
    }

    const appUser = appUserData as { id: string; colaborador_id: string | null }

    if (!appUser.colaborador_id) {
      throw createError({ 
        statusCode: 400, 
        message: 'Usuário não vinculado a um colaborador.' 
      })
    }

    // Horário de São Paulo
    const agoraUTC = new Date()
    const agoraSP = new Date(agoraUTC.toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' }))
    const hoje = agoraSP.toISOString().split('T')[0]
    const agora = agoraSP.toTimeString().split(' ')[0].substring(0, 5)

    // Verificar registro existente
    const { data: regData, error: fetchError } = await client
      .from('registros_ponto')
      .select('*')
      .eq('colaborador_id', appUser.colaborador_id)
      .eq('data', hoje)
      .maybeSingle()

    if (fetchError) {
      throw createError({ statusCode: 500, message: 'Erro ao verificar registros do dia' })
    }

    const registroExistente = regData as any

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
      updates.latitude = body.latitude
      updates.longitude = body.longitude
      updates.local_id = localInfo.local_id
      updates.distancia_metros = localInfo.distancia
      updates.fora_do_raio = false

      const { data, error } = await (client
        .from('registros_ponto') as any)
        .update(updates)
        .eq('id', registroExistente.id)
        .select()
        .single()

      if (error) {
        throw createError({ statusCode: 500, message: error.message })
      }

      return { 
        registro: data, 
        tipo: tipoRegistro,
        horario: agora,
        message: `${tipoRegistro} registrada às ${agora}` 
      }
    } else {
      // Criar novo registro (SEM empresa_id - sistema single-tenant)
      const { data, error } = await (client
        .from('registros_ponto') as any)
        .insert({
          colaborador_id: appUser.colaborador_id,
          data: hoje,
          entrada_1: agora,
          ip_registro: body.ip || null,
          localizacao: body.localizacao || null,
          latitude: body.latitude,
          longitude: body.longitude,
          local_id: localInfo.local_id,
          distancia_metros: localInfo.distancia,
          fora_do_raio: false,
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
    throw createError({ 
      statusCode: e.statusCode || 500, 
      message: e.message || 'Erro ao registrar ponto',
      data: e.data
    })
  }
})