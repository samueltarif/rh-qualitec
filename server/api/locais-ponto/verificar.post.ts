import { serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const supabase = await serverSupabaseClient(event)
  const body = await readBody(event)
  
  const { latitude, longitude } = body
  
  if (!latitude || !longitude) {
    throw createError({
      statusCode: 400,
      message: 'Latitude e longitude são obrigatórias'
    })
  }
  
  // Verifica se está dentro de algum local permitido
  const { data, error } = await supabase
    .rpc('verificar_local_permitido', {
      p_latitude: latitude,
      p_longitude: longitude
    })
  
  if (error) throw error
  
  const resultado = data?.[0]
  
  return {
    permitido: resultado?.dentro_raio || false,
    local: resultado ? {
      id: resultado.local_id,
      nome: resultado.local_nome,
      distancia: resultado.distancia
    } : null
  }
})
