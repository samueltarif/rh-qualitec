import { serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const client = await serverSupabaseClient(event)
  const body = await readBody(event)

  // Verificar se já existe config
  const { data: existing } = await client
    .from('config_ferias')
    .select('id')
    .limit(1)
    .single()

  let result
  if (existing) {
    // Atualizar
    const { data, error } = await client
      .from('config_ferias')
      .update(body)
      .eq('id', existing.id)
      .select()
      .single()

    if (error) throw createError({ statusCode: 500, message: error.message })
    result = data
  } else {
    // Inserir
    const { data, error } = await client
      .from('config_ferias')
      .insert(body)
      .select()
      .single()

    if (error) throw createError({ statusCode: 500, message: error.message })
    result = data
  }

  return result
})
