import { serverSupabaseServiceRole } from '#supabase/server'
import PDFDocument from 'pdfkit'

export default defineEventHandler(async (event) => {
  try {
    const supabaseAdmin = serverSupabaseServiceRole(event)
    const query = getQuery(event)
    
    // Permitir acesso público com parâmetros
    const colaboradorId = query.colaborador_id as string
    const mes = query.mes ? parseInt(query.mes as string) : new Date().getMonth() + 1
    const ano = query.ano ? parseInt(query.ano as string) : new Date().getFullYear()
    
    console.log('🔍 [PÚBLICO] Gerando PDF para:', { colaboradorId, mes, ano })

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

    console.log('📋 Gerando PDF para colaborador:', colaborador.nome)

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
    console.log('🔍 Buscando assinatura para:', {
      colaborador_id: colaborador.id,
      mes,
      ano
    })
    
    const { data: assinatura, error: assinaturaError } = await supabaseAdmin
      .from('assinaturas_ponto')
      .select('*')
      .eq('colaborador_id', colaborador.id)
      .eq('mes', mes)
      .eq('ano', ano)
      .maybeSingle()
    
    console.log('📝 Assinatura encontrada:', assinatura)
    if (assinaturaError) {
      console.error('❌ Erro ao buscar assinatura:', assinaturaError)
    }

    // Processar registros para o PDF
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

    // Criar PDF
    const doc = new PDFDocument({ margin: 50 })
    const chunks: Buffer[] = []

    doc.on('data', chunk => chunks.push(chunk))
    
    const pdfPromise = new Promise<Buffer>((resolve) => {
      doc.on('end', () => {
        const pdfBuffer = Buffer.concat(chunks)
        resolve(pdfBuffer)
      })
    })

    // Cabeçalho do PDF
    doc.fontSize(18).text('RELATÓRIO DE PONTO ELETRÔNICO', { align: 'center' })
    doc.moveDown()
    
    // Informações do funcionário
    doc.fontSize(12)
    doc.text(`Funcionário: ${colaborador.nome}`, 50, doc.y)
    doc.text(`Matrícula: ${colaborador.matricula}`, 50, doc.y)
    doc.text(`Cargo: ${colaborador.cargo?.nome || 'N/A'}`, 50, doc.y)
    doc.text(`Departamento: ${colaborador.departamento?.nome || 'N/A'}`, 50, doc.y)
    doc.text(`Período: ${String(mes).padStart(2, '0')}/${ano}`, 50, doc.y)
    doc.moveDown()

    // Tabela de registros
    const startY = doc.y
    const tableTop = startY + 20
    const itemHeight = 20
    
    // Cabeçalho da tabela
    doc.fontSize(10)
    doc.text('Data', 50, tableTop, { width: 80 })
    doc.text('Entrada', 130, tableTop, { width: 60 })
    doc.text('Intervalo', 190, tableTop, { width: 60 })
    doc.text('Saída', 250, tableTop, { width: 60 })
    doc.text('Horas', 310, tableTop, { width: 60 })
    
    // Linha do cabeçalho
    doc.moveTo(50, tableTop + 15)
       .lineTo(370, tableTop + 15)
       .stroke()

    // Dados da tabela
    let currentY = tableTop + 25
    dadosTabela.forEach((item, index) => {
      if (currentY > 700) { // Nova página se necessário
        doc.addPage()
        currentY = 50
      }
      
      doc.text(item.data, 50, currentY, { width: 80 })
      doc.text(item.entrada, 130, currentY, { width: 60 })
      doc.text(item.intervalo, 190, currentY, { width: 60 })
      doc.text(item.saida, 250, currentY, { width: 60 })
      doc.text(item.horas, 310, currentY, { width: 60 })
      
      currentY += itemHeight
    })

    // Linha final
    doc.moveTo(50, currentY)
       .lineTo(370, currentY)
       .stroke()

    // Resumo
    doc.moveDown(2)
    doc.fontSize(12)
    doc.text(`Total de dias trabalhados: ${totalDias}`, 50, doc.y)
    doc.text(`Total de horas trabalhadas: ${totalHorasFormatado}`, 50, doc.y)
    
    // Seção de Assinatura Digital
    doc.moveDown(3)
    doc.fontSize(14)
    doc.text('ASSINATURA DIGITAL', 50, doc.y, { underline: true })
    doc.moveDown()
    
    if (assinatura) {
      doc.fontSize(10)
      doc.text(`✅ Documento assinado digitalmente em: ${new Date(assinatura.data_assinatura).toLocaleString('pt-BR')}`, 50, doc.y)
      doc.text(`📅 Período: ${String(assinatura.mes).padStart(2, '0')}/${assinatura.ano}`, 50, doc.y)
      doc.text(`🌐 IP: ${assinatura.ip_assinatura || 'N/A'}`, 50, doc.y)
      
      if (assinatura.hash_assinatura) {
        doc.moveDown()
        doc.fontSize(8)
        doc.text('Hash de Verificação:', 50, doc.y)
        doc.font('Courier')
        doc.text(assinatura.hash_assinatura, 50, doc.y, { width: 500 })
        doc.font('Helvetica')
      }
      
      doc.moveDown()
      doc.fontSize(10)
      doc.text('Este documento possui validade jurídica conforme MP 2.200-2/2001.', 50, doc.y, { 
        align: 'center',
        width: 500
      })
    } else {
      doc.fontSize(10)
      doc.text('⚠️  Este documento ainda não foi assinado digitalmente.', 50, doc.y)
      doc.text('Para assinar, acesse o sistema e confirme seus registros de ponto.', 50, doc.y)
    }
    
    // Rodapé
    doc.moveDown(2)
    doc.fontSize(8)
    doc.text(`Relatório gerado em: ${new Date().toLocaleString('pt-BR')}`, 50, doc.y)
    doc.text('Sistema de Ponto Eletrônico - Qualitec', 50, doc.y)
    doc.text('🔓 Acesso público autorizado', 50, doc.y, { align: 'right' })

    doc.end()

    const pdfBuffer = await pdfPromise

    setResponseHeaders(event, {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="ponto_${colaborador.nome.replace(/\s+/g, '_')}_${mes}_${ano}.pdf"`,
      'Content-Length': pdfBuffer.length.toString(),
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET',
      'Access-Control-Allow-Headers': 'Content-Type'
    })
    
    return pdfBuffer

  } catch (error: any) {
    console.error('Erro ao gerar PDF público:', error)
    throw createError({
      statusCode: 500,
      message: 'Erro ao gerar relatório PDF: ' + error.message
    })
  }
})