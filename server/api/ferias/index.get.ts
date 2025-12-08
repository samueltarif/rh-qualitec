import { serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const client = await serverSupabaseClient(event)
  const query = getQuery(event)
  
  const { status, colaborador_id, ano } = query

  try {
    // Primeiro buscar as férias
    let queryBuilder = client
      .from('ferias')
      .select('*')
      .order('created_at', { ascending: false })

    if (status && status !== 'todos') {
      queryBuilder = queryBuilder.eq('status', status)
    }

    if (colaborador_id) {
      queryBuilder = queryBuilder.eq('colaborador_id', colaborador_id)
    }

    if (ano) {
      const anoNum = parseInt(ano as string)
      queryBuilder = queryBuilder
        .gte('data_inicio', `${anoNum}-01-01`)
        .lte('data_inicio', `${anoNum}-12-31`)
    }

    const { data: feriasData, error: feriasError } = await queryBuilder

    if (feriasError) {
      console.error('Erro ao buscar férias:', feriasError)
      throw createError({ statusCode: 500, message: feriasError.message })
    }

    // Buscar colaboradores separadamente
    const colaboradorIds = [...new Set((feriasData || []).map((f: any) => f.colaborador_id).filter(Boolean))]
    
    let colaboradoresMap: Record<string, any> = {}
    
    if (colaboradorIds.length > 0) {
      const { data: colaboradoresData } = await client
        .from('colaboradores')
        .select('id, nome, matricula, email_corporativo')
        .in('id', colaboradorIds)
      
      if (colaboradoresData) {
        colaboradoresMap = Object.fromEntries(
          colaboradoresData.map((c: any) => [c.id, c])
        )
      }
    }

    // Formatar dados para o frontend
    const ferias = (feriasData || []).map((f: any) => {
      const colaborador = colaboradoresMap[f.colaborador_id]
      return {
        ...f,
        colaborador_nome: colaborador?.nome || '',
        cargo: '',
        departamento: '',
        dias_solicitados: f.dias_gozo,
        dias_venda: f.dias_abono,
      }
    })

    return ferias
  } catch (e: any) {
    console.error('Erro ao buscar férias:', e)
    throw createError({ 
      statusCode: 500, 
      message: e.message || 'Erro ao buscar férias' 
    })
  }
})
