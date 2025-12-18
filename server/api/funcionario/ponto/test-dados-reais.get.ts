import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'

export default defineEventHandler(async (event) => {
  try {
    const supabase = await serverSupabaseClient(event)
    const user = await serverSupabaseUser(event)

    if (!user) {
      throw createError({
        statusCode: 401,
        message: 'Não autenticado'
      })
    }

    const query = getQuery(event)
    const mes = query.mes ? parseInt(query.mes as string) : 12
    const ano = query.ano ? parseInt(query.ano as string) : 2025

    // Buscar colaborador
    const userId = user.sub || user.id
    let colaboradorId: string | null = null
    
    // Buscar por auth_uid
    const { data: colaboradorByAuth } = await supabase
      .from('colaboradores')
      .select('id, nome')
      .eq('auth_uid', userId)
      .single()

    if (colaboradorByAuth) {
      colaboradorId = colaboradorByAuth.id
    } else {
      // Buscar via app_users
      const { data: appUserData } = await supabase
        .from('app_users')
        .select('colaborador_id, nome')
        .eq('auth_uid', userId)
        .single()

      if (appUserData?.colaborador_id) {
        colaboradorId = appUserData.colaborador_id
      }
    }

    if (!colaboradorId) {
      return {
        success: false,
        error: 'Colaborador não encontrado',
        userId
      }
    }

    // Buscar dados REAIS da tabela
    const dataInicio = `${ano}-${String(mes).padStart(2, '0')}-01`
    const dataFim = new Date(ano, mes, 0).toISOString().split('T')[0]

    const { data: registros, error } = await supabase
      .from('registros_ponto')
      .select('*')
      .eq('colaborador_id', colaboradorId)
      .gte('data', dataInicio)
      .lte('data', dataFim)
      .order('data', { ascending: true })

    if (error) {
      return {
        success: false,
        error: error.message
      }
    }

    // Processar dados exatamente como no EmployeePontoTab.vue
    const dadosProcessados = registros?.map(reg => {
      return {
        data: new Date(reg.data).toLocaleDateString('pt-BR'),
        entrada_1: reg.entrada_1 || '-',
        saida_1: reg.saida_1 || '-',
        entrada_2: reg.entrada_2 || '-',
        saida_2: reg.saida_2 || '-',
        // Calcular horas trabalhadas
        horas_trabalhadas: calcularHorasRegistro(reg)
      }
    }) || []

    return {
      success: true,
      colaborador: colaboradorByAuth?.nome || 'Não identificado',
      periodo: `${mes}/${ano}`,
      total_registros: registros?.length || 0,
      registros: dadosProcessados,
      registros_raw: registros
    }

  } catch (error: any) {
    return {
      success: false,
      error: error.message
    }
  }
})

function calcularHorasRegistro(reg: any): string {
  if (!reg.entrada_1) return '0h00'
  
  let totalMinutos = 0
  
  if (reg.entrada_1 && reg.saida_2) {
    // Jornada completa com intervalo
    const entrada = new Date(`${reg.data}T${reg.entrada_1}`)
    const saida = new Date(`${reg.data}T${reg.saida_2}`)
    let diffMs = saida.getTime() - entrada.getTime()
    
    // Descontar intervalo se houver
    if (reg.saida_1 && reg.entrada_2) {
      const inicioIntervalo = new Date(`${reg.data}T${reg.saida_1}`)
      const fimIntervalo = new Date(`${reg.data}T${reg.entrada_2}`)
      const intervaloMs = fimIntervalo.getTime() - inicioIntervalo.getTime()
      if (intervaloMs > 0) {
        diffMs -= intervaloMs
      }
    }
    
    if (diffMs > 0) {
      totalMinutos = Math.floor(diffMs / (1000 * 60))
    }
  } else if (reg.entrada_1 && reg.saida_1 && !reg.entrada_2) {
    // Jornada sem intervalo
    const entrada = new Date(`${reg.data}T${reg.entrada_1}`)
    const saida = new Date(`${reg.data}T${reg.saida_1}`)
    const diffMs = saida.getTime() - entrada.getTime()
    
    if (diffMs > 0) {
      totalMinutos = Math.floor(diffMs / (1000 * 60))
    }
  }
  
  const horas = Math.floor(totalMinutos / 60)
  const minutos = totalMinutos % 60
  
  return `${horas}h${minutos.toString().padStart(2, '0')}`
}