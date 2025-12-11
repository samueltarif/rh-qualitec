import { serverSupabaseServiceRole } from '#supabase/server'

export default defineEventHandler(async (event) => {
  try {
    const supabaseAdmin = serverSupabaseServiceRole(event)
    console.log('🔍 Gerando relatório HTML para colaborador CARLOS...')

    // Dados do colaborador (fixos por enquanto)
    const colaborador = {
      id: 'c79f679a-147a-47c1-9344-83833507adb0',
      nome: 'CARLOS',
      matricula: '001',
      cargo: { nome: 'MOTORISTA' },
      departamento: { nome: 'Operações' }
    }

    // Buscar assinatura digital do período atual
    const mesAtual = new Date().getMonth() + 1
    const anoAtual = new Date().getFullYear()
    
    const { data: assinatura } = await supabaseAdmin
      .from('assinaturas_ponto')
      .select('*')
      .eq('colaborador_id', colaborador.id)
      .eq('mes', mesAtual)
      .eq('ano', anoAtual)
      .single()

    console.log('📋 Gerando relatório para colaborador:', colaborador.nome)

    // Dados dos registros (baseados nos dados reais inseridos)
    const dataFim = new Date()
    const dataInicio = new Date()
    dataInicio.setDate(dataFim.getDate() - 30)

    const dadosTabela = [
      {
        data: '10/12/2025',
        entrada: '08:00',
        intervalo: '01:00',
        saida: '17:00',
        horas: '08:00'
      },
      {
        data: '09/12/2025',
        entrada: '08:15',
        intervalo: '01:00',
        saida: '17:15',
        horas: '08:00'
      },
      {
        data: '08/12/2025',
        entrada: '08:00',
        intervalo: '01:00',
        saida: '17:00',
        horas: '08:00'
      }
    ]

    const totalDias = 3
    const totalHorasFormatado = '24:00'

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