import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const supabase = await serverSupabaseClient(event)
  const user = await serverSupabaseUser(event)

  if (!user) {
    throw createError({
      statusCode: 401,
      message: 'Não autenticado',
    })
  }

  const query = getQuery(event)
  const { mes, ano, colaborador_id, status } = query

  try {
    let dbQuery = supabase
      .from('holerites')
      .select('*')
      .order('ano', { ascending: false })
      .order('mes', { ascending: false })
      .order('nome_colaborador', { ascending: true })

    if (mes) {
      dbQuery = dbQuery.eq('mes', mes)
    }

    if (ano) {
      dbQuery = dbQuery.eq('ano', ano)
    }

    if (colaborador_id) {
      dbQuery = dbQuery.eq('colaborador_id', colaborador_id)
    }

    if (status) {
      dbQuery = dbQuery.eq('status', status)
    }

    const { data, error } = await dbQuery

    if (error) throw error

    return {
      success: true,
      data: data || [],
    }
  } catch (error: any) {
    console.error('Erro ao buscar holerites:', error)
    throw createError({
      statusCode: 500,
      message: error.message || 'Erro ao buscar holerites',
    })
  }
})
