import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'

export default defineEventHandler(async (event) => {
  try {
    console.log('🔍 [PDF] Iniciando geração de relatório')
    
    const client = await serverSupabaseClient(event)
    const user = await serverSupabaseUser(event)

    // O Supabase retorna o ID no campo 'sub', não 'id'
    const userId = user?.id || user?.sub

    if (!user || !userId) {
      console.error('❌ [PDF] Usuário não autenticado')
      throw createError({
        statusCode: 401,
        message: 'Não autenticado'
      })
    }

    console.log('✅ [PDF] Usuário autenticado:', user.email)
    console.log('🔍 [PDF] User ID:', userId)

    // Buscar colaborador_id do usuário
    const { data: appUserData, error: appUserError } = await client
      .from('app_users')
      .select('colaborador_id')
      .eq('auth_uid', userId)
      .single()

    console.log('🔍 [PDF] App User:', appUserData)
    console.log('🔍 [PDF] Error:', appUserError)

    const appUser = appUserData as any
    if (!appUser?.colaborador_id) {
      console.error('❌ [PDF] Colaborador não encontrado')
      throw createError({
        statusCode: 404,
        message: 'Colaborador não encontrado'
      })
    }

    // Buscar dados do colaborador
    const { data: colaborador } = await client
      .from('colaboradores')
      .select('id, nome, matricula')
      .eq('id', appUser.colaborador_id)
      .single()

    if (!colaborador) {
      console.error('❌ [PDF] Dados do colaborador não encontrados')
      throw createError({
        statusCode: 404,
        message: 'Dados do colaborador não encontrados'
      })
    }

    console.log('✅ [PDF] Colaborador encontrado:', colaborador.nome)

    // Buscar registros dos últimos 30 dias
    const dataFim = new Date()
    const dataInicio = new Date()
    dataInicio.setDate(dataFim.getDate() - 30)

    console.log('📅 [PDF] Buscando registros de', dataInicio.toISOString().split('T')[0], 'até', dataFim.toISOString().split('T')[0])

    const { data: registros } = await client
      .from('registros_ponto')
      .select('*')
      .eq('colaborador_id', colaborador.id)
      .gte('data', dataInicio.toISOString().split('T')[0])
      .lte('data', dataFim.toISOString().split('T')[0])
      .order('data', { ascending: true })

    console.log('📊 [PDF] Registros encontrados:', registros?.length || 0)

    // Buscar assinatura digital do período atual
    const mesAtual = new Date().getMonth() + 1
    const anoAtual = new Date().getFullYear()
    
    console.log('🔍 [PDF] Buscando assinatura para:', { mes: mesAtual, ano: anoAtual })
    
    const { data: assinatura } = await client
      .from('assinaturas_ponto')
      .select('*')
      .eq('colaborador_id', colaborador.id)
      .eq('mes', mesAtual)
      .eq('ano', anoAtual)
      .maybeSingle()
    
    console.log('📝 [PDF] Assinatura encontrada:', !!assinatura)

    // Processar dados com cálculo de horas
    let totalDias = 0
    let totalMinutos = 0
    
    const dadosProcessados = registros?.map(reg => {
      const entrada = reg.entrada_1 || '-'
      const saida = reg.saida_2 || reg.saida_1 || '-'
      
      // Calcular horas trabalhadas no dia
      let horasDia = '-'
      if (entrada !== '-' && saida !== '-') {
        const entradaTime = new Date(`2000-01-01T${entrada}`)
        const saidaTime = new Date(`2000-01-01T${saida}`)
        let diffMs = saidaTime.getTime() - entradaTime.getTime()
        
        // Subtrair intervalo se houver
        if (reg.saida_1 && reg.entrada_2 && reg.saida_2) {
          const inicioIntervalo = new Date(`2000-01-01T${reg.saida_1}`)
          const fimIntervalo = new Date(`2000-01-01T${reg.entrada_2}`)
          const intervaloMs = fimIntervalo.getTime() - inicioIntervalo.getTime()
          diffMs -= intervaloMs
        }
        
        const diffMin = Math.floor(diffMs / (1000 * 60))
        
        if (diffMin >= 60) {
          totalMinutos += diffMin
          totalDias++
        }
        
        const horas = Math.floor(diffMin / 60)
        const minutos = diffMin % 60
        horasDia = `${horas}h${minutos.toString().padStart(2, '0')}`
      }
      
      return {
        data: new Date(reg.data).toLocaleDateString('pt-BR'),
        entrada,
        saida,
        horas: horasDia
      }
    }) || []

    // Calcular total de horas
    const totalHoras = Math.floor(totalMinutos / 60)
    const totalMin = totalMinutos % 60
    const totalHorasFormatado = `${totalHoras}h${totalMin.toString().padStart(2, '0')}`

    console.log('✅ [PDF] Dados processados:', { totalDias, totalHorasFormatado })

    return {
      success: true,
      colaborador: {
        nome: colaborador.nome,
        matricula: colaborador.matricula
      },
      periodo: {
        inicio: dataInicio.toLocaleDateString('pt-BR'),
        fim: dataFim.toLocaleDateString('pt-BR')
      },
      resumo: {
        totalDias,
        totalHoras: totalHorasFormatado
      },
      registros: dadosProcessados,
      assinatura: assinatura ? {
        dataAssinatura: new Date(assinatura.data_assinatura).toLocaleString('pt-BR'),
        mes: assinatura.mes,
        ano: assinatura.ano,
        ip: assinatura.ip_assinatura,
        hash: assinatura.hash_assinatura,
        observacoes: assinatura.observacoes
      } : null
    }

  } catch (error: any) {
    console.error('❌ [PDF] Erro completo:', error)
    console.error('❌ [PDF] Stack:', error.stack)
    
    if (error.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      message: 'Erro interno: ' + error.message
    })
  }
})