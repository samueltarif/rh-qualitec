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

    const body = await readBody(event)
    const { mes, ano, assinaturaDigital, observacoes } = body

    if (!mes || !ano || !assinaturaDigital) {
      throw createError({
        statusCode: 400,
        message: 'Mês, ano e assinatura são obrigatórios'
      })
    }

    // Buscar colaborador pelo auth_uid ou email
    let colaborador: any = null
    
    // Primeiro tenta buscar pelo auth_uid
    try {
      const { data: colaboradorByAuth } = await supabase
        .from('colaboradores')
        .select('id, nome')
        .eq('auth_uid', user.id)
        .single()

      if (colaboradorByAuth) {
        colaborador = colaboradorByAuth
      }
    } catch (error) {
      // Ignora erro se não encontrar
    }

    // Se não encontrou pelo auth_uid, busca pelo email
    if (!colaborador) {
      try {
        const { data: colaboradorByEmail } = await supabase
          .from('colaboradores')
          .select('id, nome')
          .eq('email_corporativo', user.email)
          .single()
        
        colaborador = colaboradorByEmail
      } catch (error) {
        // Ignora erro se não encontrar
      }
    }

    if (!colaborador) {
      throw createError({
        statusCode: 404,
        message: 'Colaborador não encontrado'
      })
    }

    // Buscar registros de ponto do mês para calcular totais
    const dataInicio = new Date(ano, mes - 1, 1).toISOString().split('T')[0]
    const dataFim = new Date(ano, mes, 0).toISOString().split('T')[0]

    const { data: registros } = await supabase
      .from('registros_ponto')
      .select('*')
      .eq('colaborador_id', colaborador.id)
      .gte('data', dataInicio)
      .lte('data', dataFim)
      .order('data', { ascending: true })

    // Calcular totais
    const diasTrabalhados = registros ? new Set(registros.map((r: any) => r.data)).size : 0
    
    // Calcular total de horas (simplificado)
    let totalMinutos = 0
    if (registros) {
      const registrosPorDia: Record<string, any[]> = {}
      
      registros.forEach((registro: any) => {
        if (!registrosPorDia[registro.data]) {
          registrosPorDia[registro.data] = []
        }
        registrosPorDia[registro.data].push(registro)
      })

      Object.values(registrosPorDia).forEach((registrosDia: any[]) => {
        if (registrosDia.length >= 2) {
          const entrada = new Date(`${registrosDia[0].data}T${registrosDia[0].hora}`)
          const saida = new Date(`${registrosDia[registrosDia.length - 1].data}T${registrosDia[registrosDia.length - 1].hora}`)
          const diff = saida.getTime() - entrada.getTime()
          totalMinutos += Math.max(0, diff / (1000 * 60))
        }
      })
    }

    const horas = Math.floor(totalMinutos / 60)
    const minutos = Math.floor(totalMinutos % 60)
    const totalHoras = `${horas.toString().padStart(2, '0')}:${minutos.toString().padStart(2, '0')}`

    // Gerar CSV dos registros
    const csvHeader = 'Data,Hora,Tipo,Observações\n'
    const csvContent = registros ? registros.map((r: any) => 
      `${r.data},${r.hora},${r.tipo || 'Entrada/Saída'},${r.observacoes || ''}`
    ).join('\n') : ''
    const csvCompleto = csvHeader + csvContent
    const csvBase64 = Buffer.from(csvCompleto, 'utf-8').toString('base64')

    // Obter IP do usuário
    const ip = getHeader(event, 'x-forwarded-for') || getHeader(event, 'x-real-ip') || 'Não identificado'

    // Gerar hash da assinatura para integridade
    const hashData = `${colaborador.id}-${mes}-${ano}-${Date.now()}`
    const hashAssinatura = Buffer.from(hashData).toString('base64').substring(0, 64)

    // Inserir ou atualizar assinatura
    const { data: assinatura, error } = await supabase
      .from('assinaturas_ponto')
      .upsert({
        colaborador_id: colaborador.id,
        mes: parseInt(mes),
        ano: parseInt(ano),
        assinatura_digital: assinaturaDigital,
        hash_assinatura: hashAssinatura,
        arquivo_csv: csvBase64,
        total_dias: diasTrabalhados,
        total_horas: totalHoras,
        observacoes: observacoes || null,
        ip_assinatura: ip,
        data_assinatura: new Date().toISOString()
      }, {
        onConflict: 'colaborador_id,mes,ano'
      })
      .select()
      .single()

    if (error) {
      console.error('Erro ao salvar assinatura:', error)
      throw createError({
        statusCode: 500,
        message: 'Erro ao salvar assinatura: ' + error.message
      })
    }

    return {
      success: true,
      message: 'Assinatura salva com sucesso!',
      assinatura: {
        id: assinatura?.id,
        data_assinatura: assinatura?.data_assinatura,
        total_dias: assinatura?.total_dias,
        total_horas: assinatura?.total_horas
      }
    }

  } catch (error: any) {
    console.error('Erro ao processar assinatura:', error)
    
    if (error.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      message: 'Erro interno do servidor'
    })
  }
})