import { serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const client = await serverSupabaseClient(event)

  try {
    // Buscar todas as férias
    const { data: ferias, error } = await client
      .from('ferias')
      .select('status, dias_gozo, dias_abono, data_inicio, data_fim, periodo_aquisitivo_fim')

    if (error) {
      console.error('Erro ao buscar estatísticas:', error)
      throw createError({ statusCode: 500, message: error.message })
    }

    const hoje = new Date()
    const anoAtual = hoje.getFullYear()

    // Calcular estatísticas
    const stats = {
      pendentes: 0,
      aprovadas: 0,
      em_gozo: 0,
      concluidas: 0,
      rejeitadas: 0,
      vencendo: 0,
      total_dias_ano: 0,
    }

    for (const f of (ferias || []) as any[]) {
      if (f.status === 'Pendente') stats.pendentes++
      if (f.status === 'Aprovada') stats.aprovadas++
      if (f.status === 'Em_Andamento') stats.em_gozo++
      if (f.status === 'Concluida') stats.concluidas++
      if (f.status === 'Rejeitada') stats.rejeitadas++

      // Verificar férias vencendo (período concessivo)
      if (f.periodo_aquisitivo_fim) {
        const limiteGozo = new Date(f.periodo_aquisitivo_fim)
        limiteGozo.setFullYear(limiteGozo.getFullYear() + 1)
        const diasAteVencer = Math.ceil((limiteGozo.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24))
        
        if (diasAteVencer > 0 && diasAteVencer <= 60 && f.status === 'Pendente') {
          stats.vencendo++
        }
      }

      // Total de dias no ano atual
      if (f.data_inicio) {
        const dataInicio = new Date(f.data_inicio)
        if (dataInicio.getFullYear() === anoAtual && ['Aprovada', 'Em_Andamento', 'Concluida'].includes(f.status)) {
          stats.total_dias_ano += (f.dias_gozo || 0)
        }
      }
    }

    return stats
  } catch (e: any) {
    console.error('Erro ao buscar estatísticas:', e)
    throw createError({ 
      statusCode: 500, 
      message: e.message || 'Erro ao buscar estatísticas' 
    })
  }
})
