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

    // Calcular totais corretamente usando a estrutura real dos registros
    let diasTrabalhados = 0
    let totalMinutos = 0
    
    if (registros && registros.length > 0) {
      registros.forEach((registro: any) => {
        // Verificar se tem pelo menos entrada_1 e uma saída (saida_2 ou saida_1)
        const entrada = registro.entrada_1
        const saida = registro.saida_2 || registro.saida_1
        
        if (entrada && saida) {
          // Calcular horas trabalhadas no dia
          const entradaTime = new Date(`${registro.data}T${entrada}`)
          const saidaTime = new Date(`${registro.data}T${saida}`)
          let diffMs = saidaTime.getTime() - entradaTime.getTime()
          
          // Se tem intervalo (saida_1 e entrada_2), descontar
          if (registro.saida_1 && registro.entrada_2 && registro.saida_2) {
            const inicioIntervalo = new Date(`${registro.data}T${registro.saida_1}`)
            const fimIntervalo = new Date(`${registro.data}T${registro.entrada_2}`)
            const intervaloMs = fimIntervalo.getTime() - inicioIntervalo.getTime()
            diffMs -= intervaloMs
          }
          
          if (diffMs > 0) {
            const minutosTrabalhadosDia = Math.floor(diffMs / (1000 * 60))
            
            // Se trabalhou pelo menos 1 hora, conta como dia trabalhado
            if (minutosTrabalhadosDia >= 60) {
              diasTrabalhados++
              totalMinutos += minutosTrabalhadosDia
            }
          }
        }
      })
    }

    const horas = Math.floor(totalMinutos / 60)
    const minutos = Math.floor(totalMinutos % 60)
    const totalHoras = `${horas}h${minutos.toString().padStart(2, '0')}`

    // Gerar CSV dos registros com estrutura correta
    // Usar fuso horário de São Paulo para a data de assinatura
    const dataAssinaturaBR = new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })
    
    const csvLinhas: string[] = []
    csvLinhas.push('REGISTRO DE PONTO ELETRÔNICO')
    csvLinhas.push(`Colaborador: ${colaborador.nome}`)
    csvLinhas.push(`Período: ${mes.toString().padStart(2, '0')}/${ano}`)
    csvLinhas.push(`Data de Assinatura: ${dataAssinaturaBR}`)
    csvLinhas.push('')
    csvLinhas.push('Data;Entrada 1;Saída 1;Entrada 2;Saída 2;Entrada 3;Saída 3;Total Horas')
    
    if (registros && registros.length > 0) {
      // Agrupar por data e processar
      const registrosPorDia: Record<string, any> = {}
      
      registros.forEach((registro: any) => {
        if (!registrosPorDia[registro.data]) {
          registrosPorDia[registro.data] = registro
        }
      })
      
      Object.values(registrosPorDia).forEach((reg: any) => {
        // Calcular total de horas do dia
        let totalHorasDia = '0h00'
        if (reg.entrada_1 && reg.saida_2) {
          const entrada = new Date(`${reg.data}T${reg.entrada_1}`)
          const saida = new Date(`${reg.data}T${reg.saida_2}`)
          const diffMs = saida.getTime() - entrada.getTime()
          
          if (diffMs > 0) {
            const totalMin = Math.floor(diffMs / (1000 * 60))
            const horas = Math.floor(totalMin / 60)
            const minutos = totalMin % 60
            totalHorasDia = `${horas}h${minutos.toString().padStart(2, '0')}`
          }
        }
        
        csvLinhas.push([
          new Date(reg.data).toLocaleDateString('pt-BR'),
          reg.entrada_1 || '-',
          reg.saida_1 || '-',
          reg.entrada_2 || '-',
          reg.saida_2 || '-',
          reg.entrada_3 || '-',
          reg.saida_3 || '-',
          totalHorasDia
        ].join(';'))
      })
    }
    
    csvLinhas.push('')
    csvLinhas.push('RESUMO')
    csvLinhas.push(`Dias Trabalhados: ${diasTrabalhados}`)
    csvLinhas.push(`Total de Horas: ${totalHoras}`)
    csvLinhas.push('')
    csvLinhas.push('DECLARAÇÃO')
    csvLinhas.push('Declaro que os registros acima estão corretos e conferidos.')
    csvLinhas.push(`Assinado digitalmente em ${dataAssinaturaBR}`)
    
    const csvCompleto = csvLinhas.join('\n')
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