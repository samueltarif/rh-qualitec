import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const client = await serverSupabaseClient(event)
  const user = await serverSupabaseUser(event)

  if (!user) {
    throw createError({ statusCode: 401, message: 'Não autenticado' })
  }

  try {
    const hoje = new Date().toISOString().split('T')[0]
    const mesAtual = new Date().getMonth() + 1
    const anoAtual = new Date().getFullYear()
    const dataInicioMes = `${anoAtual}-${String(mesAtual).padStart(2, '0')}-01`

    // Buscar registros de hoje (SEM filtro de empresa)
    const { data: registrosHoje } = await client
      .from('registros_ponto')
      .select('id, entrada_1, saida_1, entrada_2, saida_2')
      .eq('data', hoje)

    // Contar registros pendentes
    const pendentes = (registrosHoje || []).filter((r: any) => 
      r.entrada_1 && !r.saida_2 && !r.saida_1
    ).length

    // Total de registros do mês
    const { count: totalMes } = await client
      .from('registros_ponto')
      .select('*', { count: 'exact', head: true })
      .gte('data', dataInicioMes)

    // Contar faltas do mês
    const { count: faltas } = await client
      .from('registros_ponto')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'Falta')
      .gte('data', dataInicioMes)

    return {
      pendentes: pendentes || 0,
      totalHoje: registrosHoje?.length || 0,
      totalMes: totalMes || 0,
      faltas: faltas || 0
    }
  } catch (error: any) {
    console.error('Erro ao buscar stats do ponto:', error)
    return { pendentes: 0, totalHoje: 0, totalMes: 0, faltas: 0 }
  }
})