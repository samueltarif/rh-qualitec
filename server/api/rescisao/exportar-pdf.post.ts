export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { form, colaborador, resultado } = body

    // Gerar HTML do relatório
    const html = gerarHTMLRescisao(form, colaborador, resultado)

    // Retornar HTML (pode ser convertido para PDF no frontend ou usar biblioteca como puppeteer)
    return {
      html,
      filename: `rescisao_${colaborador.nome.replace(/\s+/g, '_')}_${Date.now()}.pdf`
    }
  } catch (error: any) {
    console.error('Erro ao exportar PDF:', error)
    throw createError({
      statusCode: 500,
      message: 'Erro ao exportar PDF de rescisão'
    })
  }
})

function gerarHTMLRescisao(form: any, colaborador: any, resultado: any): string {
  const formatarMoeda = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor || 0)
  }

  const formatarData = (data: string) => {
    return new Date(data + 'T00:00:00').toLocaleDateString('pt-BR')
  }

  const getTipoRescisaoLabel = (tipo: string) => {
    const labels: Record<string, string> = {
      'dispensa_sem_justa_causa': 'Dispensa sem Justa Causa',
      'dispensa_com_justa_causa': 'Dispensa com Justa Causa',
      'pedido_demissao': 'Pedido de Demissão',
      'acordo_mutuo': 'Acordo Mútuo (Art. 484-A)',
      'termino_experiencia': 'Término de Experiência',
      'termino_determinado': 'Término de Contrato',
      'rescisao_indireta': 'Rescisão Indireta',
      'morte': 'Morte do Empregado',
      'aposentadoria': 'Aposentadoria'
    }
    return labels[tipo] || tipo
  }

  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Simulação de Rescisão - ${colaborador.nome}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: Arial, sans-serif;
      font-size: 12px;
      line-height: 1.6;
      color: #333;
      padding: 40px;
    }
    
    .header {
      text-align: center;
      margin-bottom: 30px;
      border-bottom: 3px solid #f59e0b;
      padding-bottom: 20px;
    }
    
    .header h1 {
      color: #f59e0b;
      font-size: 24px;
      margin-bottom: 10px;
    }
    
    .header .subtitle {
      color: #666;
      font-size: 14px;
    }
    
    .info-box {
      background: #f9fafb;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      padding: 20px;
      margin-bottom: 20px;
    }
    
    .info-box h2 {
      color: #1f2937;
      font-size: 16px;
      margin-bottom: 15px;
      border-bottom: 2px solid #f59e0b;
      padding-bottom: 5px;
    }
    
    .info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
    }
    
    .info-item {
      display: flex;
      justify-content: space-between;
      padding: 5px 0;
    }
    
    .info-label {
      color: #6b7280;
      font-weight: 600;
    }
    
    .info-value {
      color: #1f2937;
      font-weight: bold;
    }
    
    .section {
      margin-bottom: 25px;
    }
    
    .section-title {
      background: #f59e0b;
      color: white;
      padding: 10px 15px;
      font-size: 14px;
      font-weight: bold;
      border-radius: 5px 5px 0 0;
    }
    
    .section-content {
      border: 1px solid #e5e7eb;
      border-top: none;
      border-radius: 0 0 5px 5px;
    }
    
    .item-row {
      display: flex;
      justify-content: space-between;
      padding: 10px 15px;
      border-bottom: 1px solid #f3f4f6;
    }
    
    .item-row:last-child {
      border-bottom: none;
    }
    
    .item-row.total {
      background: #fef3c7;
      font-weight: bold;
      font-size: 14px;
      border-top: 2px solid #f59e0b;
    }
    
    .valor-positivo {
      color: #059669;
      font-weight: bold;
    }
    
    .valor-negativo {
      color: #dc2626;
      font-weight: bold;
    }
    
    .valor-liquido {
      background: linear-gradient(135deg, #f59e0b 0%, #ea580c 100%);
      color: white;
      padding: 20px;
      border-radius: 8px;
      text-align: center;
      margin: 30px 0;
    }
    
    .valor-liquido .label {
      font-size: 14px;
      opacity: 0.9;
      margin-bottom: 5px;
    }
    
    .valor-liquido .valor {
      font-size: 32px;
      font-weight: bold;
    }
    
    .observacoes {
      background: #eff6ff;
      border-left: 4px solid #3b82f6;
      padding: 15px;
      border-radius: 5px;
      margin-top: 20px;
    }
    
    .observacoes h3 {
      color: #1e40af;
      font-size: 14px;
      margin-bottom: 10px;
    }
    
    .observacoes ul {
      list-style: none;
      padding-left: 0;
    }
    
    .observacoes li {
      padding: 5px 0;
      padding-left: 20px;
      position: relative;
    }
    
    .observacoes li:before {
      content: "•";
      color: #3b82f6;
      font-weight: bold;
      position: absolute;
      left: 0;
    }
    
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 2px solid #e5e7eb;
      text-align: center;
      color: #6b7280;
      font-size: 11px;
    }
    
    .warning {
      background: #fef2f2;
      border: 1px solid #fecaca;
      border-left: 4px solid #dc2626;
      padding: 15px;
      border-radius: 5px;
      margin-bottom: 20px;
    }
    
    .warning strong {
      color: #991b1b;
    }
    
    @media print {
      body {
        padding: 20px;
      }
      
      .info-box, .section, .observacoes {
        page-break-inside: avoid;
      }
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>SIMULAÇÃO DE RESCISÃO CONTRATUAL</h1>
    <p class="subtitle">Documento gerado em ${new Date().toLocaleString('pt-BR')}</p>
  </div>

  <div class="warning">
    <strong>⚠️ ATENÇÃO:</strong> Este documento é uma SIMULAÇÃO e não possui validade legal. 
    Os valores apresentados são estimativas e não substituem o cálculo oficial da rescisão.
  </div>

  <div class="info-box">
    <h2>Dados do Colaborador</h2>
    <div class="info-grid">
      <div class="info-item">
        <span class="info-label">Nome:</span>
        <span class="info-value">${colaborador.nome}</span>
      </div>
      <div class="info-item">
        <span class="info-label">Cargo:</span>
        <span class="info-value">${colaborador.cargo?.nome || 'N/A'}</span>
      </div>
      <div class="info-item">
        <span class="info-label">Salário Base:</span>
        <span class="info-value">${formatarMoeda(colaborador.salario_base)}</span>
      </div>
      <div class="info-item">
        <span class="info-label">Data Admissão:</span>
        <span class="info-value">${formatarData(colaborador.data_admissao)}</span>
      </div>
    </div>
  </div>

  <div class="info-box">
    <h2>Dados da Rescisão</h2>
    <div class="info-grid">
      <div class="info-item">
        <span class="info-label">Tipo:</span>
        <span class="info-value">${getTipoRescisaoLabel(form.tipo_rescisao)}</span>
      </div>
      <div class="info-item">
        <span class="info-label">Data Desligamento:</span>
        <span class="info-value">${formatarData(form.data_desligamento)}</span>
      </div>
      <div class="info-item">
        <span class="info-label">Tempo de Casa:</span>
        <span class="info-value">${resultado.tempo_casa}</span>
      </div>
      <div class="info-item">
        <span class="info-label">Aviso Prévio:</span>
        <span class="info-value">${form.aviso_previo === 'trabalhado' ? 'Trabalhado' : form.aviso_previo === 'indenizado' ? 'Indenizado' : 'Não Aplicável'}</span>
      </div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">PROVENTOS (Valores a Receber)</div>
    <div class="section-content">
      ${resultado.proventos.map((item: any) => `
        <div class="item-row">
          <span>${item.descricao}</span>
          <span class="valor-positivo">${formatarMoeda(item.valor)}</span>
        </div>
      `).join('')}
      <div class="item-row total">
        <span>TOTAL PROVENTOS</span>
        <span class="valor-positivo">${formatarMoeda(resultado.total_proventos)}</span>
      </div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">DESCONTOS</div>
    <div class="section-content">
      ${resultado.descontos.length > 0 ? resultado.descontos.map((item: any) => `
        <div class="item-row">
          <span>${item.descricao}</span>
          <span class="valor-negativo">${formatarMoeda(item.valor)}</span>
        </div>
      `).join('') : '<div class="item-row"><span>Nenhum desconto</span><span>R$ 0,00</span></div>'}
      <div class="item-row total">
        <span>TOTAL DESCONTOS</span>
        <span class="valor-negativo">${formatarMoeda(resultado.total_descontos)}</span>
      </div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">FGTS</div>
    <div class="section-content">
      ${resultado.fgts.map((item: any) => `
        <div class="item-row">
          <span>${item.descricao}</span>
          <span style="color: #2563eb; font-weight: bold;">${formatarMoeda(item.valor)}</span>
        </div>
      `).join('')}
      <div class="item-row total">
        <span>TOTAL FGTS</span>
        <span style="color: #2563eb; font-weight: bold;">${formatarMoeda(resultado.total_fgts)}</span>
      </div>
    </div>
  </div>

  <div class="valor-liquido">
    <div class="label">VALOR LÍQUIDO A RECEBER</div>
    <div class="valor">${formatarMoeda(resultado.valor_liquido)}</div>
  </div>

  <div class="observacoes">
    <h3>Observações Legais</h3>
    <ul>
      ${resultado.observacoes.map((obs: string) => `<li>${obs}</li>`).join('')}
    </ul>
  </div>

  <div class="footer">
    <p>Este documento foi gerado automaticamente pelo Sistema de Gestão de RH</p>
    <p>Para dúvidas, consulte o departamento de Recursos Humanos</p>
  </div>
</body>
</html>
  `
}
