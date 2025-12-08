import { serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const client = (await serverSupabaseClient(event)) as any

  // Stats dos últimos 30 dias
  const dataInicio = new Date()
  dataInicio.setDate(dataInicio.getDate() - 30)

  const { data: logs } = await client
    .from('logs_sincronizacao')
    .select('tipo_integracao, status')
    .gte('created_at', dataInicio.toISOString())

  const { data: cnabs } = await client
    .from('arquivos_cnab')
    .select('status')
    .order('created_at', { ascending: false })
    .limit(10)

  const { data: esocial } = await client
    .from('eventos_esocial')
    .select('status')
    .gte('created_at', dataInicio.toISOString())

  const { data: emails } = await client
    .from('historico_emails')
    .select('status')
    .gte('created_at', dataInicio.toISOString())

  return {
    sincronizacoes: {
      total: logs?.length || 0,
      sucesso: logs?.filter((l: any) => l.status === 'sucesso').length || 0,
      erro: logs?.filter((l: any) => l.status === 'erro').length || 0,
      por_tipo: {
        contabilidade: logs?.filter((l: any) => l.tipo_integracao === 'contabilidade').length || 0,
        esocial: logs?.filter((l: any) => l.tipo_integracao === 'esocial').length || 0,
        banco: logs?.filter((l: any) => l.tipo_integracao === 'banco').length || 0,
        ponto: logs?.filter((l: any) => l.tipo_integracao === 'ponto').length || 0,
      },
    },
    cnabs: {
      total: cnabs?.length || 0,
      gerados: cnabs?.filter((c: any) => c.status === 'gerado').length || 0,
      processados: cnabs?.filter((c: any) => c.status === 'processado').length || 0,
    },
    esocial: {
      total: esocial?.length || 0,
      enviados: esocial?.filter((e: any) => e.status === 'enviado').length || 0,
      processados: esocial?.filter((e: any) => e.status === 'processado').length || 0,
      erros: esocial?.filter((e: any) => e.status === 'erro').length || 0,
    },
    emails: {
      total: emails?.length || 0,
      enviados: emails?.filter((e: any) => e.status === 'enviado').length || 0,
      abertos: emails?.filter((e: any) => e.status === 'aberto').length || 0,
    },
  }
})
