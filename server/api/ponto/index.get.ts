import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const client = await serverSupabaseClient(event)
  const user = await serverSupabaseUser(event)
  const query = getQuery(event)

  // O Supabase retorna o ID no campo 'sub', não 'id'
  const userId = user?.id || user?.sub
  
  console.log('🔍 [PONTO GET] User object:', user)
  console.log('🔍 [PONTO GET] User ID (id):', user?.id)
  console.log('🔍 [PONTO GET] User ID (sub):', user?.sub)
  console.log('🔍 [PONTO GET] User ID final:', userId)

  if (!user || !userId) {
    console.error('❌ [PONTO GET] Usuário não autenticado ou sem ID')
    throw createError({ statusCode: 401, message: 'Não autenticado ou sessão inválida' })
  }

  // Validar que userId é um UUID válido
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  if (!uuidRegex.test(userId)) {
    console.error('❌ [PONTO GET] User ID inválido:', userId)
    throw createError({ statusCode: 401, message: 'ID de usuário inválido. Faça login novamente.' })
  }

  try {
    console.log('🔍 [PONTO GET] Iniciando busca de registros')
    console.log('🔍 [PONTO GET] User ID:', userId)
    console.log('🔍 [PONTO GET] Query params:', query)
    
    // Buscar role e colaborador_id do usuário
    const { data: appUserData, error: appUserError } = await client
      .from('app_users')
      .select('role, colaborador_id')
      .eq('auth_uid', userId)
      .single()

    console.log('🔍 [PONTO GET] App User Data:', appUserData)
    console.log('🔍 [PONTO GET] App User Error:', appUserError)

    const appUser = appUserData as { role: string; colaborador_id: string | null } | null

    if (!appUser) {
      console.error('❌ [PONTO GET] Usuário não encontrado')
      throw createError({ statusCode: 400, message: `Usuário não encontrado: ${appUserError?.message || 'unknown'}` })
    }

    // Buscar empresa_id
    let empresaId: string | null = null
    
    if (appUser.colaborador_id) {
      // Se tem colaborador_id, busca empresa do colaborador
      const { data: colabData } = await client
        .from('colaboradores')
        .select('empresa_id')
        .eq('id', appUser.colaborador_id)
        .single()
      
      const colaborador = colabData as { empresa_id: string } | null
      empresaId = colaborador?.empresa_id || null
    } else {
      // Se não tem colaborador_id (admin), busca a primeira empresa
      const { data: empresaData } = await client
        .from('empresas')
        .select('id')
        .limit(1)
        .single()
      
      const empresa = empresaData as { id: string } | null
      empresaId = empresa?.id || null
    }

    console.log('🔍 [PONTO GET] Empresa ID:', empresaId)

    if (!empresaId) {
      console.error('❌ [PONTO GET] Nenhuma empresa encontrada')
      throw createError({ statusCode: 400, message: 'Nenhuma empresa encontrada' })
    }

    // Parâmetros de filtro
    const mes = query.mes ? parseInt(query.mes as string) : new Date().getMonth() + 1
    const ano = query.ano ? parseInt(query.ano as string) : new Date().getFullYear()
    const colaboradorId = query.colaborador_id as string
    const departamentoId = query.departamento_id as string
    const status = query.status as string

    console.log('🔍 [PONTO GET] Filtros:', { mes, ano, colaboradorId, departamentoId, status })

    // Calcular período
    const dataInicio = `${ano}-${String(mes).padStart(2, '0')}-01`
    const ultimoDia = new Date(ano, mes, 0).getDate()
    const dataFim = `${ano}-${String(mes).padStart(2, '0')}-${ultimoDia}`

    // Query base - especificar o relacionamento correto para departamento
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
      .eq('empresa_id', empresaId)
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

    console.log('🔍 [PONTO GET] Resultado - Total registros:', data?.length || 0)
    console.log('🔍 [PONTO GET] Erro:', error)

    if (error) {
      console.error('❌ [PONTO GET] Erro ao buscar registros de ponto:', error)
      throw createError({ statusCode: 500, message: `Erro ao buscar registros: ${error.message}` })
    }

    // Filtrar por departamento se necessário (pós-query)
    let registros = data || []
    if (departamentoId) {
      registros = registros.filter((r: any) => 
        r.colaborador?.departamento?.id === departamentoId
      )
    }

    console.log('✅ [PONTO GET] Retornando', registros.length, 'registros')
    return registros
  } catch (e: any) {
    console.error('Erro ao buscar registros de ponto:', e)
    throw createError({ statusCode: e.statusCode || 500, message: e.message || 'Erro ao buscar registros' })
  }
})
