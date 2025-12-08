import { serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const client = await serverSupabaseClient(event)

  try {
    const { data, error } = await client
      .from('solicitacoes_funcionario')
      .select('status')

    if (error) {
      throw createError({ statusCode: 500, message: error.message })
    }

    const stats = {
      total: data?.length || 0,
      pendentes: 0,
      em_analise: 0,
      aprovadas: 0,
      rejeitadas: 0,
      concluidas: 0
    }

    for (const s of (data || []) as any[]) {
      if (s.status === 'Pendente') stats.pendentes++
      if (s.status === 'Em_Analise') stats.em_analise++
      if (s.status === 'Aprovada') stats.aprovadas++
      if (s.status === 'Rejeitada') stats.rejeitadas++
      if (s.status === 'Concluida') stats.concluidas++
    }

    return stats
  } catch (e: any) {
    console.error('Erro ao buscar estatísticas:', e)
    throw createError({ statusCode: 500, message: e.message || 'Erro ao buscar estatísticas' })
  }
})
