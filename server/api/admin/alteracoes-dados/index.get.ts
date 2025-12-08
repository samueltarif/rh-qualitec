import { serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const client = await serverSupabaseClient(event)
  const query = getQuery(event)

  let qb = client
    .from('solicitacoes_alteracao_dados')
    .select(`
      *,
      colaborador:colaboradores(id, nome, matricula, cpf),
      aprovador:app_users!solicitacoes_alteracao_dados_aprovado_por_fkey(id, nome)
    `)
    .order('created_at', { ascending: false })

  if (query.status) {
    qb = qb.eq('status', query.status)
  }

  if (query.tipo) {
    qb = qb.eq('tipo', query.tipo)
  }

  const { data, error } = await qb

  if (error) throw createError({ statusCode: 500, message: error.message })

  return data || []
})
