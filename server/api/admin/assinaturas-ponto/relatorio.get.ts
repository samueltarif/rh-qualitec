import { serverSupabaseServiceRole } from '#supabase/server'

export default defineEventHandler(async (event) => {
  try {
    const supabase = serverSupabaseServiceRole(event)
    const query = getQuery(event)
    
    const mes = query.mes ? parseInt(query.mes as string) : null
    const ano = query.ano ? parseInt(query.ano as string) : null
    const colaboradorId = query.colaborador_id as string

    let queryBuilder = supabase
      .from('assinaturas_ponto')
      .select(`
        id,
        colaborador_id,
        mes,
        ano,
        data_assinatura,
        ip_assinatura,
        user_agent,
        hash_assinatura,
        total_dias,
        total_horas,
        observacoes,
        created_at,
        colaborador:colaboradores(
          id,
          nome,
          cpf,
          email,
          matricula
        )
      `)
      .order('data_assinatura', { ascending: false })

    // Aplicar filtros
    if (mes) queryBuilder = queryBuilder.eq('mes', mes)
    if (ano) queryBuilder = queryBuilder.eq('ano', ano)
    if (colaboradorId) queryBuilder = queryBuilder.eq('colaborador_id', colaboradorId)

    const { data: assinaturas, error } = await queryBuilder

    if (error) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Erro ao buscar assinaturas'
      })
    }

    // Gerar CSV simples
    const headers = [
      'ID',
      'Colaborador',
      'CPF',
      'Email',
      'Matrícula',
      'Período',
      'Data Assinatura',
      'IP',
      'Total Dias',
      'Total Horas',
      'Hash Verificação',
      'Observações',
      'Criado em'
    ]

    const csvRows = [headers.join(',')]

    assinaturas?.forEach((assinatura) => {
      const row = [
        `"${assinatura.id}"`,
        `"${assinatura.colaborador?.nome || 'N/A'}"`,
        `"${assinatura.colaborador?.cpf || 'N/A'}"`,
        `"${assinatura.colaborador?.email || 'N/A'}"`,
        `"${assinatura.colaborador?.matricula || 'N/A'}"`,
        `"${String(assinatura.mes).padStart(2, '0')}/${assinatura.ano}"`,
        `"${new Date(assinatura.data_assinatura).toLocaleString('pt-BR')}"`,
        `"${assinatura.ip_assinatura || 'N/A'}"`,
        `"${assinatura.total_dias || 0}"`,
        `"${assinatura.total_horas || '0:00'}"`,
        `"${assinatura.hash_assinatura || 'N/A'}"`,
        `"${assinatura.observacoes || 'N/A'}"`,
        `"${new Date(assinatura.created_at).toLocaleString('pt-BR')}"`
      ]
      csvRows.push(row.join(','))
    })

    // Adicionar informações do relatório
    csvRows.push('')
    csvRows.push(`"Relatório gerado em:","${new Date().toLocaleString('pt-BR')}"`)
    csvRows.push(`"Total de registros:","${assinaturas?.length || 0}"`)
    
    if (mes && ano) {
      csvRows.push(`"Período filtrado:","${String(mes).padStart(2, '0')}/${ano}"`)
    }

    const csvContent = csvRows.join('\n')
    const buffer = Buffer.from('\ufeff' + csvContent, 'utf8') // BOM para UTF-8

    // Configurar headers para download
    setResponseHeaders(event, {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="relatorio_assinaturas_${new Date().toISOString().split('T')[0]}.csv"`,
      'Content-Length': buffer.byteLength.toString()
    })

    return buffer

  } catch (error: any) {
    console.error('Erro ao gerar relatório:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Erro ao gerar relatório'
    })
  }
})