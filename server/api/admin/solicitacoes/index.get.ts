import { serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const client = await serverSupabaseClient(event)
  const query = getQuery(event)

  try {
    let queryBuilder = client
      .from('solicitacoes_funcionario')
      .select(`
        *,
        colaborador:colaboradores(id, nome, matricula, cargo:cargos(nome), departamento:departamentos(nome)),
        respondido:app_users!solicitacoes_funcionario_respondido_por_fkey(nome)
      `)
      .order('created_at', { ascending: false })

    if (query.status && query.status !== 'todos') {
      queryBuilder = queryBuilder.eq('status', query.status)
    }

    if (query.tipo) {
      queryBuilder = queryBuilder.eq('tipo', query.tipo)
    }

    const { data, error } = await queryBuilder

    if (error) {
      throw createError({ statusCode: 500, message: error.message })
    }

    return (data || []).map((s: any) => ({
      ...s,
      colaborador_nome: s.colaborador?.nome || '',
      colaborador_matricula: s.colaborador?.matricula || '',
      cargo: s.colaborador?.cargo?.nome || '',
      departamento: s.colaborador?.departamento?.nome || '',
      respondido_nome: s.respondido?.nome || ''
    }))
  } catch (e: any) {
    console.error('Erro ao buscar solicitações:', e)
    throw createError({ statusCode: 500, message: e.message || 'Erro ao buscar solicitações' })
  }
})
