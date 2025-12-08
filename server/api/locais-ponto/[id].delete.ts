import { serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const supabase = await serverSupabaseClient(event)
  const id = getRouterParam(event, 'id')
  
  const { error } = await supabase
    .from('locais_ponto')
    .delete()
    .eq('id', id)
  
  if (error) throw error
  return { success: true }
})
