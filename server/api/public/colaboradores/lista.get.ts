import { serverSupabaseServiceRole } from '#supabase/server'

export default defineEventHandler(async (event) => {
  try {
    const supabaseAdmin = serverSupabaseServiceRole(event)
    
    console.log('🔍 [PÚBLICO] Listando colaboradores...')
    
    const { data: colaboradores, error } = await supabaseAdmin
      .from('colaboradores')
      .select('id, nome, matricula, cargo:cargos(nome), departamento:departamentos(nome)')
      .order('nome')

    if (error) {
      throw error
    }

    // Adicionar links de acesso direto
    const colaboradoresComLinks = colaboradores?.map(colaborador => ({
      ...colaborador,
      links: {
        html: `/api/public/ponto/download-html?colaborador_id=${colaborador.id}`,
        pdf: `/api/public/ponto/download-pdf?colaborador_id=${colaborador.id}`,
        htmlMesAtual: `/api/public/ponto/download-html?colaborador_id=${colaborador.id}&mes=${new Date().getMonth() + 1}&ano=${new Date().getFullYear()}`,
        pdfMesAtual: `/api/public/ponto/download-pdf?colaborador_id=${colaborador.id}&mes=${new Date().getMonth() + 1}&ano=${new Date().getFullYear()}`
      }
    }))

    setResponseHeaders(event, {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET',
      'Access-Control-Allow-Headers': 'Content-Type'
    })

    return {
      success: true,
      data: colaboradoresComLinks,
      total: colaboradoresComLinks?.length || 0,
      message: 'Lista de colaboradores com links de acesso público'
    }

  } catch (error: any) {
    console.error('Erro ao listar colaboradores:', error)
    throw createError({
      statusCode: 500,
      message: 'Erro ao listar colaboradores: ' + error.message
    })
  }
})