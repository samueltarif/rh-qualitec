import { serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const client = await serverSupabaseClient(event)

  // Buscar parâmetro de status da query (padrão: Ativo)
  const query = getQuery(event)
  const statusFilter = query.status || 'Ativo'

  const { data, error} = await client
    .from('colaboradores')
    .select(`
      id, 
      nome, 
      cpf, 
      salario, 
      salario_base, 
      data_admissao, 
      status, 
      email_corporativo, 
      matricula,
      cargo:cargos(id, nome)
    `)
    .eq('status', statusFilter)
    .order('nome')

  if (error) {
    console.error('Erro ao buscar colaboradores:', error)
    throw createError({ statusCode: 500, message: error.message })
  }

  return data || []
})
