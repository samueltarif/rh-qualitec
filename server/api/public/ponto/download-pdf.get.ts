import { serverSupabaseServiceRole } from '#supabase/server'

export default defineEventHandler(async (event) => {
  try {
    const supabaseAdmin = serverSupabaseServiceRole(event)
    const query = getQuery(event)
    
    // Permitir acesso público com parâmetros
    const colaboradorId = query.colaborador_id as string
    const mes = query.mes ? parseInt(query.mes as string) : new Date().getMonth() + 1
    const ano = query.ano ? parseInt(query.ano as string) : new Date().getFullYear()
    
    console.log('🔍 [PÚBLICO] Buscando dados para:', { colaboradorId, mes, ano })

    if (!colaboradorId) {
      throw createError({
        statusCode: 400,
        message: 'ID do colaborador é obrigatório'
      })
    }
    
    const { data: colaborador } = await supabaseAdmin
      .from('colaboradores')
      .select('id, nome, matricula, cargo:cargos(nome), departamento:departamentos(nome)')
      .eq('id', colaboradorId)
      .single()

    if (!colaborador) {
      throw createError({
        statusCode: 404,
        message: 'Colaborador não encontrado'
      })
    }

    // Buscar registros do mês especificado
    const dataInicio = new Date(ano, mes - 1, 1)
    const dataFim = new Date(ano, mes, 0)

    const { data: registros } = await supabaseAdmin
      .from('registros_ponto')
      .select('*')
      .eq('colaborador_id', colaborador.id)
      .gte('data', dataInicio.toISOString().split('T')[0])
      .lte('data', dataFim.toISOString().split('T')[0])
      .order('data', { ascending: true })

    // Buscar assinatura digital do período
    const { data: assinatura } = await supabaseAdmin
      .from('assinaturas_ponto')
      .select('*')
      .eq('colaborador_id', colaborador.id)
      .eq('mes', mes)
      .eq('ano', ano)
      .maybeSingle()

    // Processar registros
    let totalDias = 0
    let totalMinutos = 0

    const dadosTabela = registros?.map(registro => {
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
        if (intervalo !== '-') {
          const [h, m] = intervalo.split(':').map(Number)
          diffMs -= (h * 60 + m) * 60 * 1000
        }
        
        const diffMin = Math.floor(diffMs / (1000 * 60))
        totalMinutos += diffMin
        totalDias++
        
        const horas = Math.floor(diffMin / 60)
        const minutos = diffMin % 60
        horasDia = `${horas.toString().padStart(2, '0')}:${minutos.toString().padStart(2, '0')}`
      }
      
      return {
        data: new Date(registro.data).toLocaleDateString('pt-BR'),
        entrada,
        intervalo,
        saida,
        horas: horasDia
      }
    }) || []

    // Calcular total de horas
    const totalHoras = Math.floor(totalMinutos / 60)
    const totalMin = totalMinutos % 60
    const totalHorasFormatado = `${totalHoras.toString().padStart(2, '0')}:${totalMin.toString().padStart(2, '0')}`

    // Retornar dados JSON para o frontend processar
    return {
      colaborador: {
        nome: colaborador.nome,
        matricula: colaborador.matricula,
        cargo: colaborador.cargo?.nome || 'N/A',
        departamento: colaborador.departamento?.nome || 'N/A'
      },
      periodo: {
        mes,
        ano,
        mesAno: `${String(mes).padStart(2, '0')}/${ano}`
      },
      registros: dadosTabela,
      resumo: {
        totalDias,
        totalHoras: totalHorasFormatado,
        totalMinutos
      },
      assinatura: assinatura ? {
        dataAssinatura: assinatura.data_assinatura,
        ip: assinatura.ip_assinatura,
        hash: assinatura.hash_assinatura,
        assinado: true
      } : {
        assinado: false
      },
      geradoEm: new Date().toLocaleString('pt-BR')
    }

  } catch (error: any) {
    console.error('Erro ao buscar dados do ponto:', error)
    throw createError({
      statusCode: 500,
      message: 'Erro ao buscar dados: ' + error.message
    })
  }
})