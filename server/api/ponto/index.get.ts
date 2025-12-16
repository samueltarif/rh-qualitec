import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const client = await serverSupabaseClient(event)
  const user = await serverSupabaseUser(event)
  const query = getQuery(event)

  const userId = user?.id || user?.sub

  if (!user || !userId) {
    throw createError({ statusCode: 401, message: 'Não autenticado' })
  }

  // Validar UUID
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  if (!uuidRegex.test(userId)) {
    throw createError({ statusCode: 401, message: 'ID de usuário inválido. Faça login novamente.' })
  }

  try {
    // Parâmetros de filtro
    const mes = query.mes ? parseInt(query.mes as string) : new Date().getMonth() + 1
    const ano = query.ano ? parseInt(query.ano as string) : new Date().getFullYear()
    const colaboradorId = query.colaborador_id as string
    const departamentoId = query.departamento_id as string
    const status = query.status as string

    // Calcular período
    const dataInicio = `${ano}-${String(mes).padStart(2, '0')}-01`
    const ultimoDia = new Date(ano, mes, 0).getDate()
    const dataFim = `${ano}-${String(mes).padStart(2, '0')}-${ultimoDia}`

    // Query base - SEM filtro de empresa (sistema single-tenant)
    let queryBuilder = client
      .from('registros_ponto')
      .select(`
        *,
        colaborador:colaboradores(
          id, nome, matricula, foto_url,
          cargo:cargos(id, nome),
          departamento:departamentos!colaboradores_departamento_id_fkey(id, nome)
        )
      `)
      .gte('data', dataInicio)
      .lte('data', dataFim)
      .order('data', { ascending: false })

    // Filtros opcionais
    if (colaboradorId) {
      queryBuilder = queryBuilder.eq('colaborador_id', colaboradorId)
    }

    if (status) {
      queryBuilder = queryBuilder.eq('status', status)
    }

    const { data, error } = await queryBuilder

    if (error) {
      console.error('Erro ao buscar registros de ponto:', error)
      throw createError({ statusCode: 500, message: `Erro ao buscar registros: ${error.message}` })
    }

    // Filtrar por departamento se necessário (pós-query)
    let registros = data || []
    if (departamentoId) {
      registros = registros.filter((r: any) => 
        r.colaborador?.departamento?.id === departamentoId
      )
    }

    return registros
  } catch (e: any) {
    console.error('Erro ao buscar registros de ponto:', e)
    throw createError({ statusCode: e.statusCode || 500, message: e.message || 'Erro ao buscar registros' })
  }
})