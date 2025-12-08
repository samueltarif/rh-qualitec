import { serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const supabase = await serverSupabaseClient(event)
  
  const { data, error } = await supabase
    .from('locais_ponto')
    .select('*')
    .eq('ativo', true)
    .order('nome')
  
  if (error) throw error
  return data
})
