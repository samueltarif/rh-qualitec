import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'

export default defineEventHandler(async (event) => {
  // Forçar não cachear para garantir dados atualizados
  setHeader(event, 'Cache-Control', 'no-cache, no-store, must-revalidate, max-age=0')
  setHeader(event, 'Pragma', 'no-cache')
  setHeader(event, 'Expires', '0')
  
  const client = await serverSupabaseClient(event)
  const user = await serverSupabaseUser(event)
  const query = getQuery(event)

  const userId = user?.id || user?.sub

  if (!user || !userId) {
    throw createError({ statusCode: 401, message: 'Não autenticado' })
  }

  try {
    console.log('🔍 [FUNCIONARIO PONTO] User ID:', userId)
    console.log('🔍 [FUNCIONARIO PONTO] Query:', query)
    
    // ✅ BUSCA ROBUSTA DO COLABORADOR (igual à assinatura digital)
    let colaboradorId: string | null = null
    
    // 1. Buscar por auth_uid na tabela colaboradores
    const { data: colaboradorByAuth } = await client
      .from('colaboradores')
      .select('id, nome')
      .eq('auth_uid', userId)
      .single()

    if (colaboradorByAuth) {
      colaboradorId = colaboradorByAuth.id
      console.log('✅ [FUNCIONARIO PONTO] Colaborador encontrado por auth_uid:', colaboradorByAuth.nome)
    } else {
      // 2. Buscar via app_users se não encontrou direto
      const { data: appUserData } = await client
        .from('app_users')
        .select('colaborador_id, nome')
        .eq('auth_uid', userId)
        .single()

      if (appUserData?.colaborador_id) {
        colaboradorId = appUserData.colaborador_id
        console.log('✅ [FUNCIONARIO PONTO] Colaborador encontrado via app_users:', appUserData.nome)
      }
    }

    if (!colaboradorId) {
      console.error('❌ [FUNCIONARIO PONTO] Colaborador não encontrado para user:', userId)
      return []
    }

    // ✅ PERÍODO PADRONIZADO (igual ao gestor)
    const hoje = new Date()
    const mes = query.mes ? parseInt(query.mes as string) : hoje.getMonth() + 1
    const ano = query.ano ? parseInt(query.ano as string) : hoje.getFullYear()
    
    const dataInicio = `${ano}-${String(mes).padStart(2, '0')}-01`
    const ultimoDia = new Date(ano, mes, 0).getDate()
    const dataFim = `${ano}-${String(mes).padStart(2, '0')}-${ultimoDia}`

    console.log('🔍 [FUNCIONARIO PONTO] Período:', dataInicio, 'até', dataFim)
    console.log('🔍 [FUNCIONARIO PONTO] Colaborador ID:', colaboradorId)

    // ✅ QUERY IDÊNTICA À DO GESTOR (mesma estrutura, mesmos dados)
    const { data, error } = await client
      .from('registros_ponto')
      .select(`
        *,
        colaborador:colaboradores(
          id, nome, matricula, foto_url,
          cargo:cargos(id, nome),
          departamento:departamentos!colaboradores_departamento_id_fkey(id, nome)
        )
      `)
      .eq('colaborador_id', colaboradorId)
      .gte('data', dataInicio)
      .lte('data', dataFim)
      .order('data', { ascending: false })

    console.log('🔍 [FUNCIONARIO PONTO] Registros encontrados:', data?.length || 0)
    
    // ✅ DEBUG DETALHADO DOS REGISTROS
    if (data && data.length > 0) {
      console.log('📊 [FUNCIONARIO PONTO] Primeiros 3 registros:')
      data.slice(0, 3).forEach((reg: any, idx: number) => {
        console.log(`  ${idx + 1}. Data: ${reg.data} | Entrada: ${reg.entrada_1} | Saída: ${reg.saida_2 || reg.saida_1} | Status: ${reg.status}`)
      })
      
      console.log('📅 [FUNCIONARIO PONTO] Datas únicas encontradas:')
      const datasUnicas = [...new Set(data.map((r: any) => r.data))].sort()
      console.log('  Datas:', datasUnicas)
      
      // Verificar se tem dados de novembro
      const registrosNovembro = data.filter((r: any) => r.data.startsWith('2024-11'))
      if (registrosNovembro.length > 0) {
        console.log('⚠️ [FUNCIONARIO PONTO] ENCONTRADOS REGISTROS DE NOVEMBRO:')
        registrosNovembro.forEach((reg: any) => {
          console.log(`    ${reg.data} - ${reg.entrada_1} - ${reg.saida_2 || reg.saida_1}`)
        })
      }
    } else {
      console.log('❌ [FUNCIONARIO PONTO] Nenhum registro encontrado para o período')
    }

    if (error) {
      console.error('❌ [FUNCIONARIO PONTO] Erro ao buscar:', error)
      throw createError({ statusCode: 500, message: error.message })
    }

    // ✅ RETORNAR DADOS IDÊNTICOS AO QUE O GESTOR VÊ
    return data || []
    
  } catch (e: any) {
    console.error('❌ [FUNCIONARIO PONTO] Erro geral:', e)
    throw createError({ statusCode: 500, message: e.message || 'Erro ao buscar registros' })
  }
})
