import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'

export default defineEventHandler(async (event) => {
  try {
    const supabase = await serverSupabaseClient(event)
    const user = await serverSupabaseUser(event)

    if (!user) {
      throw createError({
        statusCode: 401,
        message: 'Não autenticado'
      })
    }

    console.log('🔍 Gerando relatório para usuário:', user.id, user.email)

    // Buscar colaborador pelo usuário autenticado
    let colaborador: any = null
    
    // Primeiro tenta buscar pelo auth_uid
    try {
      const { data: colaboradorByAuth } = await supabase
        .from('colaboradores')
        .select('id, nome, matricula, cargo:cargos(nome), departamento:departamentos(nome)')
        .eq('auth_uid', user.id)
        .single()

      if (colaboradorByAuth) {
        colaborador = colaboradorByAuth
        console.log('✅ Colaborador encontrado por auth_uid:', colaborador.nome)
      }
    } catch (error) {
      console.log('⚠️ Não encontrado por auth_uid:', error)
    }

    // Se não encontrou pelo auth_uid, busca pelo email
    if (!colaborador && user.email) {
      try {
        const { data: colaboradorByEmail } = await supabase
          .from('colaboradores')
          .select('id, nome, matricula, cargo:cargos(nome), departamento:departamentos(nome)')
          .eq('email_corporativo', user.email)
          .single()
        
        if (colaboradorByEmail) {
          colaborador = colaboradorByEmail
          console.log('✅ Colaborador encontrado por email:', colaborador.nome)
        }
      } catch (error) {
        console.log('⚠️ Não encontrado por email:', error)
      }
    }
    if (!colaborador) {
      console.error('❌ Colaborador não encontrado')
      throw createError({
        statusCode: 404,
        message: 'Colaborador não encontrado'
      })
    }

    console.log('📋 Gerando relatório para colaborador:', colaborador.nome)

    // Buscar registros dos últimos 30 dias
    const dataFim = new Date()
    const dataInicio = new Date()
    dataInicio.setDate(dataFim.getDate() - 30)

    console.log('📅 Período:', dataInicio.toISOString().split('T')[0], 'até', dataFim.toISOString().split('T')[0])

    const { data: registros, error: registrosError } = await supabase
      .from('registros_ponto')
      .select('*')
      .eq('colaborador_id', colaborador.id)
      .gte('data', dataInicio.toISOString().split('T')[0])
      .lte('data', dataFim.toISOString().split('T')[0])
      .order('data', { ascending: true })

    if (registrosError) {
      console.error('❌ Erro ao buscar registros:', registrosError)
      throw createError({
        statusCode: 500,
        message: 'Erro ao buscar registros de ponto'
      })
    }

    console.log('📊 Registros encontrados:', registros?.length || 0)

    // Buscar assinatura digital do período atual
    const mesAtual = new Date().getMonth() + 1
    const anoAtual = new Date().getFullYear()
    
    const { data: assinatura } = await supabase
      .from('assinaturas_ponto')
      .select('*')
      .eq('colaborador_id', colaborador.id)
      .eq('mes', mesAtual)
      .eq('ano', anoAtual)
      .maybeSingle()
    
    console.log('📝 Assinatura encontrada:', !!assinatura)

    // Processar registros
    let totalDias = 0
    let totalMinutos = 0
    const dadosTabela: any[] = []

    if (registros && registros.length > 0) {
      registros.forEach((registro: any) => {
        const entrada = registro.entrada_1 || '-'
        const saida = registro.saida_2 || registro.saida_1 || '-'
        
        // Calcular intervalo
        let intervalo = '-'
        if (registro.saida_1 && registro.entrada_2) {
          const inicio = new Date(`2000-01-01T${registro.saida_1}`)
          const fim = new Date(`2000-01-01T${registro.entrada_2}`)
          const diffMs = fim.getTime() - inicio.getTime()
          const diffMin = Math.floor(diffMs / (1000 * 60))
          const horas = Math.floor(diffMin / 60)
          const minutos = diffMin % 60
          intervalo = `${horas.toString().padStart(2, '0')}:${minutos.toString().padStart(2, '0')}`
        }
        
        // Calcular horas trabalhadas no dia
        let horasDia = '-'
        if (entrada !== '-' && saida !== '-') {
          const entradaTime = new Date(`2000-01-01T${entrada}`)
          const saidaTime = new Date(`2000-01-01T${saida}`)
          let diffMs = saidaTime.getTime() - entradaTime.getTime()
          
          // Subtrair intervalo se houver
          if (registro.saida_1 && registro.entrada_2 && registro.saida_2) {
            const inicioIntervalo = new Date(`2000-01-01T${registro.saida_1}`)
            const fimIntervalo = new Date(`2000-01-01T${registro.entrada_2}`)
            const intervaloMs = fimIntervalo.getTime() - inicioIntervalo.getTime()
            diffMs -= intervaloMs
          }
          
          const diffMin = Math.floor(diffMs / (1000 * 60))
          
          // Se trabalhou pelo menos 1 hora, conta como dia trabalhado
          if (diffMin >= 60) {
            totalMinutos += diffMin
            totalDias++
          }
          
          const horas = Math.floor(diffMin / 60)
          const minutos = diffMin % 60
          horasDia = `${horas.toString().padStart(2, '0')}:${minutos.toString().padStart(2, '0')}`
        }
        
        dadosTabela.push({
          data: new Date(registro.data).toLocaleDateString('pt-BR'),
          entrada,
          intervalo,
          saida,
          horas: horasDia
        })
      })
    }

    // Calcular total de horas
    const totalHoras = Math.floor(totalMinutos / 60)
    const totalMin = totalMinutos % 60
    const totalHorasFormatado = `${totalHoras.toString().padStart(2, '0')}:${totalMin.toString().padStart(2, '0')}`

    console.log('✅ Dados processados:', { totalDias, totalHorasFormatado, registros: dadosTabela.length })

    // Retornar dados para o frontend processar
    return {
      success: true,
      colaborador: {
        nome: colaborador.nome,
        matricula: colaborador.matricula,
        cargo: colaborador.cargo?.nome || 'N/A',
        departamento: colaborador.departamento?.nome || 'N/A'
      },
      periodo: {
        inicio: dataInicio.toLocaleDateString('pt-BR'),
        fim: dataFim.toLocaleDateString('pt-BR')
      },
      resumo: {
        totalDias,
        totalHoras: totalHorasFormatado
      },
      registros: dadosTabela,
      assinatura: assinatura ? {
        dataAssinatura: new Date(assinatura.data_assinatura).toLocaleString('pt-BR'),
        mes: assinatura.mes,
        ano: assinatura.ano,
        ip: assinatura.ip_assinatura,
        hash: assinatura.hash_assinatura
      } : null
    }


  } catch (error: any) {
    console.error('❌ Erro ao processar relatório:', error)
    throw createError({
      statusCode: 500,
      message: 'Erro ao gerar relatório: ' + error.message
    })
  }
})