import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'

export default defineEventHandler(async (event) => {
  try {
    const user = await serverSupabaseUser(event)
    if (!user) {
      throw createError({ statusCode: 401, message: 'Não autenticado' })
    }

    const id = getRouterParam(event, 'id')
    if (!id) {
      throw createError({ statusCode: 400, message: 'ID não fornecido' })
    }

    const supabase = await serverSupabaseClient(event)

    // Buscar template
    // @ts-ignore
    const { data: template, error } = await supabase
      .from('templates_importacao')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    if (!template) {
      throw createError({ statusCode: 404, message: 'Template não encontrado' })
    }

    // Gerar CSV de exemplo baseado nos campos do template
    let csvContent = ''
    const templateData = template as any
    
    if (templateData.campos_mapeamento && Array.isArray(templateData.campos_mapeamento)) {
      // Cabeçalho
      const headers = templateData.campos_mapeamento.map((campo: any) => campo.campo)
      csvContent = headers.join(',') + '\n'
      
      // Linha de exemplo
      const exemplos = templateData.campos_mapeamento.map((campo: any) => {
        switch (campo.tipo) {
          case 'string': return 'Exemplo'
          case 'email': return 'exemplo@email.com'
          case 'date': return '2024-01-01'
          case 'decimal': return '1000.00'
          case 'integer': return '10'
          case 'boolean': return 'true'
          default: return ''
        }
      })
      csvContent += exemplos.join(',') + '\n'
    }

    // Retornar como download
    setResponseHeaders(event, {
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="${templateData.nome.replace(/[^a-z0-9]/gi, '_')}.csv"`,
    })

    return csvContent
  } catch (error: any) {
    console.error('Erro ao baixar template:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Erro ao baixar template',
    })
  }
})
