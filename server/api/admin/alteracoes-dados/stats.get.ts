import { serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const client = await serverSupabaseClient(event) as any

  // Contar solicitações pendentes
  const { count: pendentes } = await client
    .from('solicitacoes_alteracao_dados')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'pendente')

  // Contar solicitações aprovadas
  const { count: aprovadas } = await client
    .from('solicitacoes_alteracao_dados')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'aprovada')

  // Contar solicitações rejeitadas
  const { count: rejeitadas } = await client
    .from('solicitacoes_alteracao_dados')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'rejeitada')

  return {
    pendentes: pendentes || 0,
    aprovadas: aprovadas || 0,
    rejeitadas: rejeitadas || 0,
    total: (pendentes || 0) + (aprovadas || 0) + (rejeitadas || 0)
  }
})
