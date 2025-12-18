import { serverSupabaseServiceRole } from '#supabase/server'

export default defineEventHandler(async (event) => {
  try {
    const supabaseAdmin = serverSupabaseServiceRole(event)
    const query = getQuery(event)
    
    // Permitir especificar colaborador via query parameter
    const colaboradorId = query.colaborador_id as string
    
    console.log('🔍 Gerando relatório HTML para colaborador:', colaboradorId || 'CARLOS (padrão)')

    // Se não especificar colaborador, usar CARLOS como padrão
    const targetColaboradorId = colaboradorId || 'c79f679a-147a-47c1-9344-83833507adb0'
    
    const { data: colaborador } = await supabaseAdmin
      .from('colaboradores')
      .select('id, nome, matricula, cargo:cargos(nome), departamento:departamentos(nome)')
      .eq('id', targetColaboradorId)
      .single()

    if (!colaborador) {
      throw createError({
        statusCode: 404,
        message: 'Colaborador não encontrado'
      })
    }

    // Buscar assinatura digital do período especificado ou atual
    const mesEspecificado = query.mes ? parseInt(query.mes as string) : new Date().getMonth() + 1
    const anoEspecificado = query.ano ? parseInt(query.ano as string) : new Date().getFullYear()
    
    const { data: assinatura } = await supabaseAdmin
      .from('assinaturas_ponto')
      .select('*')
      .eq('colaborador_id', colaborador.id)
      .eq('mes', mesEspecificado)
      .eq('ano', anoEspecificado)
      .single()

    console.log(`📋 Gerando relatório para: ${colaborador.nome} - ${mesEspecificado}/${anoEspecificado}`)

    // ✅ BUSCAR APENAS OS REGISTROS DO MÊS ESPECÍFICO
    const dataInicio = new Date(anoEspecificado, mesEspecificado - 1, 1).toISOString().split('T')[0]
    const dataFim = new Date(anoEspecificado, mesEspecificado, 0).toISOString().split('T')[0]

    const { data: registros } = await supabaseAdmin
      .from('registros_ponto')
      .select('*')
      .eq('colaborador_id', colaborador.id)
      .gte('data', dataInicio.toISOString().split('T')[0])
      .lte('data', dataFim.toISOString().split('T')[0])
      .order('data', { ascending: true })

    // ✅ PROCESSAR APENAS REGISTROS REAIS (não gerar dias fictícios)
    let totalDias = 0
    let totalMinutos = 0

    console.log(`📋 Registros encontrados na tabela: ${registros?.length || 0}`)

    // ✅ USAR APENAS REGISTROS QUE EXISTEM NA TABELA (NADA MAIS)
    const dadosTabela = registros?.map(registro => {
      const entrada = registro.entrada_1 || '-'
      const saida = registro.saida_2 || registro.saida_1 || '-'
      
      // Calcular intervalo apenas se houver saída e entrada de intervalo
      let intervalo = '-'
      if (registro.saida_1 && registro.entrada_2) {
        const inicio = new Date(`2000-01-01T${registro.saida_1}`)
        const fim = new Date(`2000-01-01T${registro.entrada_2}`)
        const diffMs = fim.getTime() - inicio.getTime()
        if (diffMs > 0) {
          const diffMin = Math.floor(diffMs / (1000 * 60))
          const horas = Math.floor(diffMin / 60)
          const minutos = diffMin % 60
          intervalo = `${horas.toString().padStart(2, '0')}:${minutos.toString().padStart(2, '0')}`
        }
      }
      
      // Calcular horas trabalhadas no dia
      let horasDia = '-'
      let minutosTrabalhadosDia = 0
      
      if (entrada !== '-' && saida !== '-') {
        const entradaTime = new Date(`2000-01-01T${entrada}`)
        const saidaTime = new Date(`2000-01-01T${saida}`)
        let diffMs = saidaTime.getTime() - entradaTime.getTime()
        
        // Subtrair intervalo se houver
        if (registro.saida_1 && registro.entrada_2) {
          const inicioIntervalo = new Date(`2000-01-01T${registro.saida_1}`)
          const fimIntervalo = new Date(`2000-01-01T${registro.entrada_2}`)
          const intervaloMs = fimIntervalo.getTime() - inicioIntervalo.getTime()
          if (intervaloMs > 0) {
            diffMs -= intervaloMs
          }
        }
        
        if (diffMs > 0) {
          minutosTrabalhadosDia = Math.floor(diffMs / (1000 * 60))
          totalMinutos += minutosTrabalhadosDia
          
          // Contar como dia trabalhado se trabalhou pelo menos 1 hora
          if (minutosTrabalhadosDia >= 60) {
            totalDias++
          }
          
          const horas = Math.floor(minutosTrabalhadosDia / 60)
          const minutos = minutosTrabalhadosDia % 60
          horasDia = `${horas}h${minutos.toString().padStart(2, '0')}`
        }
      }
      
      return {
        data: new Date(registro.data).toLocaleDateString('pt-BR'),
        entrada,
        intervalo,
        saida,
        horas: horasDia,
        valido: minutosTrabalhadosDia > 0
      }
    }).filter(item => item.valido) || [] // Mostrar apenas dias com registros válidos

    // Calcular total de horas
    const totalHoras = Math.floor(totalMinutos / 60)
    const totalMin = totalMinutos % 60
    const totalHorasFormatado = `${totalHoras.toString().padStart(2, '0')}:${totalMin.toString().padStart(2, '0')}`

    // Gerar HTML
    const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Relatório de Ponto - ${colaborador.nome}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { text-align: center; margin-bottom: 30px; }
        .info { margin-bottom: 20px; }
        .info p { margin: 5px 0; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
        .summary { margin-top: 20px; font-weight: bold; }
        .footer { margin-top: 30px; font-size: 12px; color: #666; }
        @media print {
            body { margin: 0; }
            .no-print { display: none; }
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>RELATÓRIO DE PONTO ELETRÔNICO</h1>
    </div>
    
    <div class="info">
        <p><strong>Funcionário:</strong> ${colaborador.nome}</p>
        <p><strong>Matrícula:</strong> ${colaborador.matricula}</p>
        <p><strong>Cargo:</strong> ${colaborador.cargo?.nome || 'N/A'}</p>
        <p><strong>Departamento:</strong> ${colaborador.departamento?.nome || 'N/A'}</p>
        <p><strong>Período:</strong> ${dataInicio.toLocaleDateString('pt-BR')} a ${dataFim.toLocaleDateString('pt-BR')}</p>
    </div>
    
    <table>
        <thead>
            <tr>
                <th>Data</th>
                <th>Entrada</th>
                <th>Intervalo</th>
                <th>Saída</th>
                <th>Horas Trabalhadas</th>
            </tr>
        </thead>
        <tbody>
            ${dadosTabela.map(item => `
                <tr>
                    <td>${item.data}</td>
                    <td>${item.entrada}</td>
                    <td>${item.intervalo}</td>
                    <td>${item.saida}</td>
                    <td>${item.horas}</td>
                </tr>
            `).join('')}
        </tbody>
    </table>
    
    <div class="summary">
        <p>Total de dias trabalhados: ${totalDias}</p>
        <p>Total de horas trabalhadas: ${totalHorasFormatado}</p>
    </div>
    
    <div style="margin-top: 30px; border-top: 2px solid #333; padding-top: 20px;">
        <h3>ASSINATURA DIGITAL</h3>
        ${assinatura ? `
            <div style="background: #e8f5e8; padding: 15px; border-radius: 5px; margin: 10px 0;">
                <p><strong>✅ Documento assinado digitalmente</strong></p>
                <p><strong>Data da Assinatura:</strong> ${new Date(assinatura.data_assinatura).toLocaleString('pt-BR')}</p>
                <p><strong>Período:</strong> ${String(assinatura.mes).padStart(2, '0')}/${assinatura.ano}</p>
                <p><strong>IP:</strong> ${assinatura.ip_assinatura || 'N/A'}</p>
                ${assinatura.hash_assinatura ? `
                    <p><strong>Hash de Verificação:</strong></p>
                    <p style="font-family: monospace; font-size: 10px; word-break: break-all; background: #f5f5f5; padding: 5px; border-radius: 3px;">
                        ${assinatura.hash_assinatura}
                    </p>
                ` : ''}
                <p style="font-style: italic; margin-top: 10px;">
                    Este documento possui validade jurídica conforme MP 2.200-2/2001.
                </p>
            </div>
        ` : `
            <div style="background: #fff3cd; padding: 15px; border-radius: 5px; margin: 10px 0;">
                <p><strong>⚠️ Este documento ainda não foi assinado digitalmente.</strong></p>
                <p>Para assinar, acesse o sistema e confirme seus registros de ponto.</p>
            </div>
        `}
    </div>
    
    <div class="footer">
        <p>Relatório gerado em: ${new Date().toLocaleString('pt-BR')}</p>
        <p>Sistema de Ponto Eletrônico - Qualitec</p>
    </div>
    
    <div class="no-print" style="margin-top: 30px; text-align: center;">
        <button onclick="window.print()" style="padding: 10px 20px; font-size: 16px; background: #007bff; color: white; border: none; border-radius: 5px; cursor: pointer;">
            Imprimir / Salvar como PDF
        </button>
    </div>
</body>
</html>
    `

    setResponseHeaders(event, {
      'Content-Type': 'text/html; charset=utf-8'
    })
    
    return html

  } catch (error: any) {
    console.error('Erro ao gerar relatório:', error)
    throw createError({
      statusCode: 500,
      message: 'Erro ao gerar relatório'
    })
  }
})