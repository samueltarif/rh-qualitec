import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const client = await serverSupabaseClient(event)
  const user = await serverSupabaseUser(event)

  if (!user) {
    throw createError({ statusCode: 401, message: 'Não autenticado' })
  }

  try {
    // Buscar colaborador_id do usuário
    const { data: appUserData } = await client
      .from('app_users')
      .select('colaborador_id')
      .eq('auth_uid', user.id)
      .single()

    const appUser = appUserData as { colaborador_id: string | null } | null

    if (!appUser?.colaborador_id) {
      return { pendentes: 0, ultimoRegistro: null, totalHoje: 0, totalMes: 0, faltas: 0 }
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

    if (!empresaId) {
      return { pendentes: 0, ultimoRegistro: null, totalHoje: 0, totalMes: 0, faltas: 0 }
    }

    const hoje = new Date().toISOString().split('T')[0]
    const mesAtual = new Date().getMonth() + 1
    const anoAtual = new Date().getFullYear()
    const dataInicioMes = `${anoAtual}-${String(mesAtual).padStart(2, '0')}-01`

    // Buscar registros de hoje
    const { data: registrosHojeData, error: hojeError } = await client
      .from('registros_ponto')
      .select('id, entrada_1, saida_1, entrada_2, saida_2')
      .eq('empresa_id', empresaId)
      .eq('data', hoje)

    const registrosHoje = registrosHojeData as any[] | null

    if (hojeError) {
      console.error('Erro ao buscar registros de hoje:', hojeError)
    }

    // Contar registros pendentes (sem saída final)
    const pendentes = (registrosHoje || []).filter((r) => 
      r.entrada_1 && !r.saida_2 && !r.saida_1
    ).length

    // Total de registros do mês
    const { count: totalMes } = await client
      .from('registros_ponto')
      .select('*', { count: 'exact', head: true })
      .eq('empresa_id', empresaId)
      .gte('data', dataInicioMes)

    // Contar faltas do mês
    const { count: faltas } = await client
      .from('registros_ponto')
      .select('*', { count: 'exact', head: true })
      .eq('empresa_id', empresaId)
      .eq('status', 'Falta')
      .gte('data', dataInicioMes)

    // Último registro geral
    const { data: ultimoRegData } = await client
      .from('registros_ponto')
      .select('data, entrada_1, saida_1, entrada_2, saida_2')
      .eq('empresa_id', empresaId)
      .order('data', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    const ultimoRegistro = ultimoRegData as any

    // Determinar tipo do último registro
    let tipoUltimo = null
    let horarioUltimo = null
    if (ultimoRegistro) {
      if (ultimoRegistro.saida_2) {
        tipoUltimo = 'saida'
        horarioUltimo = ultimoRegistro.saida_2
      } else if (ultimoRegistro.entrada_2) {
        tipoUltimo = 'entrada'
        horarioUltimo = ultimoRegistro.entrada_2
      } else if (ultimoRegistro.saida_1) {
        tipoUltimo = 'intervalo_inicio'
        horarioUltimo = ultimoRegistro.saida_1
      } else if (ultimoRegistro.entrada_1) {
        tipoUltimo = 'entrada'
        horarioUltimo = ultimoRegistro.entrada_1
      }
    }

    return {
      pendentes: pendentes || 0,
      totalHoje: registrosHoje?.length || 0,
      totalMes: totalMes || 0,
      faltas: faltas || 0,
      ultimoRegistro: tipoUltimo ? {
        tipo: tipoUltimo,
        horario: horarioUltimo
      } : null
    }
  } catch (error: any) {
    console.error('Erro ao buscar stats do ponto:', error)
    return { pendentes: 0, ultimoRegistro: null, totalHoje: 0, totalMes: 0 }
  }
})
