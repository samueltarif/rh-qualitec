import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'

export default defineEventHandler(async (event) => {
  try {
    console.log('🔍 [PDF] Iniciando geração de relatório')
    
    const client = await serverSupabaseClient(event)
    const user = await serverSupabaseUser(event)
    const query = getQuery(event)

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

    // ✅ BUSCA ROBUSTA DO COLABORADOR (igual à API de ponto que funciona)
    let colaboradorId: string | null = null
    
    // 1. Buscar por auth_uid na tabela colaboradores
    const { data: colaboradorByAuth } = await client
      .from('colaboradores')
      .select('id, nome, matricula')
      .eq('auth_uid', userId)
      .single()

    if (colaboradorByAuth) {
      colaboradorId = colaboradorByAuth.id
      console.log('✅ [PDF] Colaborador encontrado por auth_uid:', colaboradorByAuth.nome)
    } else {
      // 2. Buscar via app_users se não encontrou direto
      const { data: appUserData } = await client
        .from('app_users')
        .select('colaborador_id, nome')
        .eq('auth_uid', userId)
        .single()

      if (appUserData?.colaborador_id) {
        colaboradorId = appUserData.colaborador_id
        console.log('✅ [PDF] Colaborador encontrado via app_users:', appUserData.nome)
      }
    }

    if (!colaboradorId) {
      console.error('❌ [PDF] Colaborador não encontrado para user:', userId)
      throw createError({
        statusCode: 404,
        message: 'Colaborador não encontrado'
      })
    }

    // Buscar dados completos do colaborador
    const { data: colaborador } = await client
      .from('colaboradores')
      .select('id, nome, matricula')
      .eq('id', colaboradorId)
      .single()

    if (!colaborador) {
      console.error('❌ [PDF] Dados do colaborador não encontrados')
      throw createError({
        statusCode: 404,
        message: 'Dados do colaborador não encontrados'
      })
    }

    console.log('✅ [PDF] Colaborador encontrado:', colaborador.nome)
    console.log('📅 [PDF] Jornada:', colaborador.jornada)

    // ✅ USAR MÊS/ANO SELECIONADO (não últimos 30 dias)
    const hoje = new Date()
    const mes = query.mes ? parseInt(query.mes as string) : hoje.getMonth() + 1
    const ano = query.ano ? parseInt(query.ano as string) : hoje.getFullYear()
    
    // Calcular primeiro e último dia do mês
    const primeiroDia = new Date(ano, mes - 1, 1)
    const ultimoDia = new Date(ano, mes, 0)
    
    const dataInicio = `${ano}-${String(mes).padStart(2, '0')}-01`
    const dataFim = `${ano}-${String(mes).padStart(2, '0')}-${ultimoDia.getDate()}`

    console.log('📅 [PDF] Período selecionado:', { mes, ano })
    console.log('📅 [PDF] Buscando registros de', dataInicio, 'até', dataFim)

    const { data: registros } = await client
      .from('registros_ponto')
      .select('*')
      .eq('colaborador_id', colaborador.id)
      .gte('data', dataInicio)
      .lte('data', dataFim)
      .order('data', { ascending: true })

    console.log('📊 [PDF] Registros encontrados:', registros?.length || 0)

    // Buscar assinatura digital do período selecionado
    console.log('🔍 [PDF] Buscando assinatura para:', { mes, ano })
    
    const { data: assinatura } = await client
      .from('assinaturas_ponto')
      .select('*')
      .eq('colaborador_id', colaborador.id)
      .eq('mes', mes)
      .eq('ano', ano)
      .maybeSingle()
    
    console.log('📝 [PDF] Assinatura encontrada:', !!assinatura)

    // ✅ PROCESSAR APENAS OS REGISTROS EXISTENTES (não criar dias fictícios)
    const dadosProcessados: any[] = []
    let totalDias = 0
    let totalMinutos = 0
    
    registros?.forEach(reg => {
      const dataReg = new Date(reg.data)
      const diaSemana = dataReg.getDay() // 0=Dom, 1=Seg, ..., 6=Sab
      
      // Formatar data com dia da semana
      const diasSemanaLabel = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
      const dataFormatada = `${diasSemanaLabel[diaSemana]}, ${dataReg.getDate().toString().padStart(2, '0')}/${(dataReg.getMonth() + 1).toString().padStart(2, '0')}`
      
      const entrada = reg.entrada_1 || '-'
      const saida = reg.saida_2 || reg.saida_1 || '-'
      
      let horasDia = '-'
      let status = 'normal'
      
      if (entrada !== '-') {
        if (saida !== '-') {
          // Calcular horas trabalhadas
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
          
          if (diffMin > 0) {
            totalMinutos += diffMin
            totalDias++
          }
          
          const horas = Math.floor(diffMin / 60)
          const minutos = diffMin % 60
          horasDia = `${horas}h${minutos.toString().padStart(2, '0')}`
        } else {
          // Só tem entrada (em andamento ou incompleto)
          horasDia = 'Em andamento'
          status = 'incompleto'
          totalDias++ // Conta como dia trabalhado
        }
      }
      
      dadosProcessados.push({
        data: dataFormatada,
        entrada,
        saida,
        horas: horasDia,
        status
      })
    })

    // Calcular total de horas
    const totalHoras = Math.floor(totalMinutos / 60)
    const totalMin = totalMinutos % 60
    const totalHorasFormatado = `${totalHoras}h${totalMin.toString().padStart(2, '0')}`

    console.log('✅ [PDF] Dados processados:', { totalDias, totalHorasFormatado, diasGerados: dadosProcessados.length })

    return {
      success: true,
      colaborador: {
        nome: colaborador.nome,
        matricula: colaborador.matricula
      },
      periodo: {
        inicio: primeiroDia.toLocaleDateString('pt-BR'),
        fim: ultimoDia.toLocaleDateString('pt-BR')
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