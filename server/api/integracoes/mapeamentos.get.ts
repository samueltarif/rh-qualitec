import { serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const client = (await serverSupabaseClient(event)) as any

  const { data, error } = await client
    .from('mapeamento_contas_contabeis')
    .select('*')
    .eq('ativo', true)
    .order('tipo_lancamento')

  if (error) {
    throw createError({ statusCode: 500, message: error.message })
  }

  return data || []
})
