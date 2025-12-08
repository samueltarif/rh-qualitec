import { serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const client = (await serverSupabaseClient(event)) as any
  const body = await readBody(event)

  const { data: existing } = await client
    .from('politicas_seguranca')
    .select('id, empresa_id')
    .limit(1)
    .single()

  if (existing) {
    const { data, error } = await client
      .from('politicas_seguranca')
      .update({
        ...body,
        updated_at: new Date().toISOString(),
      })
      .eq('id', existing.id)
      .select()
      .single()

    if (error) {
      throw createError({ statusCode: 500, message: error.message })
    }

    return data
  } else {
    const { data: empresa } = await client.from('empresas').select('id').limit(1).single()

    const { data, error } = await client
      .from('politicas_seguranca')
      .insert({
        ...body,
        empresa_id: empresa?.id,
      })
      .select()
      .single()

    if (error) {
      throw createError({ statusCode: 500, message: error.message })
    }

    return data
  }
})
