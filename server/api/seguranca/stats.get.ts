import { serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const client = (await serverSupabaseClient(event)) as any

  // Stats de logs de acesso (últimos 30 dias)
  const dataInicio = new Date()
  dataInicio.setDate(dataInicio.getDate() - 30)

  const { data: logs } = await client
    .from('logs_acesso')
    .select('acao, sucesso, created_at')
    .gte('created_at', dataInicio.toISOString())

  const { data: auditoria } = await client
    .from('auditoria')
    .select('acao, created_at')
    .gte('created_at', dataInicio.toISOString())

  const { data: backups } = await client
    .from('historico_backups')
    .select('status, sucesso')
    .order('created_at', { ascending: false })
    .limit(10)

  const { data: sessoes } = await client.from('sessoes_ativas').select('ativo')

  const { data: tentativas } = await client
    .from('tentativas_login')
    .select('sucesso')
    .gte('created_at', dataInicio.toISOString())

  return {
    logs: {
      total: logs?.length || 0,
      sucessos: logs?.filter((l) => l.sucesso).length || 0,
      erros: logs?.filter((l) => !l.sucesso).length || 0,
      logins: logs?.filter((l) => l.acao === 'login').length || 0,
    },
    auditoria: {
      total: auditoria?.length || 0,
      creates: auditoria?.filter((a) => a.acao === 'create').length || 0,
      updates: auditoria?.filter((a) => a.acao === 'update').length || 0,
      deletes: auditoria?.filter((a) => a.acao === 'delete').length || 0,
    },
    backups: {
      total: backups?.length || 0,
      sucesso: backups?.filter((b) => b.sucesso).length || 0,
      erro: backups?.filter((b) => !b.sucesso).length || 0,
      ultimo: backups?.[0] || null,
    },
    sessoes: {
      ativas: sessoes?.filter((s) => s.ativo).length || 0,
      total: sessoes?.length || 0,
    },
    tentativas_login: {
      total: tentativas?.length || 0,
      sucesso: tentativas?.filter((t) => t.sucesso).length || 0,
      falhas: tentativas?.filter((t) => !t.sucesso).length || 0,
    },
  }
})
