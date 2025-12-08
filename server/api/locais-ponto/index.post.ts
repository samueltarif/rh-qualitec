import { serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const supabase = await serverSupabaseClient(event)
  const body = await readBody(event)
  
  const { data, error } = await supabase
    .from('locais_ponto')
    .insert({
      nome: body.nome,
      descricao: body.descricao,
      latitude: body.latitude,
      longitude: body.longitude,
      raio_metros: body.raio_metros || 100,
      ativo: body.ativo ?? true
    })
    .select()
    .single()
  
  if (error) throw error
  return data
})
