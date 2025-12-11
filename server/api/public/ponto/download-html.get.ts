import { serverSupabaseServiceRole } from '#supabase/server'

export default defineEventHandler(async (event) => {
  try {
    const supabaseAdmin = serverSupabaseServiceRole(event)
    const query = getQuery(event)
    
    // Permitir acesso público com parâmetros
    const colaboradorId = query.colaborador_id as string
    const mes = query.mes ? parseInt(query.mes as string) : new Date().getMonth() + 1
    const ano = query.ano ? parseInt(query.ano as string) : new Date().getFullYear()
    
    console.log('🔍 [PÚBLICO HTML] Gerando relatório para:', { colaboradorId, mes, ano })

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

    // Buscar assinatura digital do período
    const { data: assinatura } = await supabaseAdmin
      .from('assinaturas_ponto')
      .select('*')
      .eq('colaborador_id', colaborador.id)
      .eq('mes', mes)
      .eq('ano', ano)
      .maybeSingle()

    console.log('📋 Gerando relatório para colaborador:', colaborador.nome)

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

    // Processar registros para o HTML
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
        .assinatura-valida { background: #e8f5e8; padding: 15px; border-radius: 5px; margin: 10px 0; }
        .assinatura-pendente { background: #fff3cd; padding: 15px; border-radius: 5px; margin: 10px 0; }
        .hash-box { font-family: monospace; font-size: 10px; word-break: break-all; background: #f5f5f5; padding: 5px; border-radius: 3px; }
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
        <p><strong>Período:</strong> ${String(mes).padStart(2, '0')}/${ano}</p>
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
            <div class="assinatura-valida">
                <p><strong>✅ Documento assinado digitalmente</strong></p>
                <p><strong>Data da Assinatura:</strong> ${new Date(assinatura.data_assinatura).toLocaleString('pt-BR')}</p>
                <p><strong>Período:</strong> ${String(assinatura.mes).padStart(2, '0')}/${assinatura.ano}</p>
                <p><strong>IP:</strong> ${assinatura.ip_assinatura || 'N/A'}</p>
                ${assinatura.hash_assinatura ? `
                    <p><strong>Hash de Verificação:</strong></p>
                    <div class="hash-box">
                        ${assinatura.hash_assinatura}
                    </div>
                ` : ''}
                <p style="font-style: italic; margin-top: 10px;">
                    Este documento possui validade jurídica conforme MP 2.200-2/2001.
                </p>
            </div>
        ` : `
            <div class="assinatura-pendente">
                <p><strong>⚠️ Este documento ainda não foi assinado digitalmente.</strong></p>
                <p>Para assinar, acesse o sistema e confirme seus registros de ponto.</p>
            </div>
        `}
    </div>
    
    <div class="footer">
        <p>Relatório gerado em: ${new Date().toLocaleString('pt-BR')}</p>
        <p>Sistema de Ponto Eletrônico - Qualitec</p>
        <p>🔓 Acesso público autorizado</p>
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
      'Content-Type': 'text/html; charset=utf-8',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET',
      'Access-Control-Allow-Headers': 'Content-Type'
    })
    
    return html

  } catch (error: any) {
    console.error('Erro ao gerar relatório HTML público:', error)
    throw createError({
      statusCode: 500,
      message: 'Erro ao gerar relatório HTML: ' + error.message
    })
  }
})