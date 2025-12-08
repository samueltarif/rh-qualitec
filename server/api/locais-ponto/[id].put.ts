import { serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const supabase = await serverSupabaseClient(event)
  const id = getRouterParam(event, 'id')
  const body = await readBody(event)
  
  const { data, error } = await supabase
    .from('locais_ponto')
    .update({
      nome: body.nome,
      descricao: body.descricao,
      latitude: body.latitude,
      longitude: body.longitude,
      raio_metros: body.raio_metros,
      ativo: body.ativo,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single()
  
  if (error) throw error
  return data
})
