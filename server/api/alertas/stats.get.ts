import { serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const client = await serverSupabaseClient(event)

  // Contagem por status
  const { data: alertas } = await client
    .from('alertas')
    .select('status, prioridade')

  const stats = {
    total: alertas?.length || 0,
    pendentes: alertas?.filter(a => a.status === 'pendente').length || 0,
    lidos: alertas?.filter(a => a.status === 'lido').length || 0,
    resolvidos: alertas?.filter(a => a.status === 'resolvido').length || 0,
    ignorados: alertas?.filter(a => a.status === 'ignorado').length || 0,
    
    // Por prioridade (apenas pendentes)
    criticos: alertas?.filter(a => a.status === 'pendente' && a.prioridade === 'critica').length || 0,
    altos: alertas?.filter(a => a.status === 'pendente' && a.prioridade === 'alta').length || 0,
    medios: alertas?.filter(a => a.status === 'pendente' && a.prioridade === 'media').length || 0,
    baixos: alertas?.filter(a => a.status === 'pendente' && a.prioridade === 'baixa').length || 0,
  }

  return stats
})
