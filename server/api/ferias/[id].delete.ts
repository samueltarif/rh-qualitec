import { serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const client = await serverSupabaseClient(event)
  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({ statusCode: 400, message: 'ID é obrigatório' })
  }

  // Verificar se pode ser cancelada (apenas pendentes)
  const { data: ferias } = await client
    .from('ferias')
    .select('status')
    .eq('id', id)
    .single()

  if (ferias && ferias.status !== 'Pendente') {
    throw createError({ 
      statusCode: 400, 
      message: 'Apenas solicitações pendentes podem ser canceladas' 
    })
  }

  const { error } = await client
    .from('ferias')
    .update({ status: 'Cancelada' })
    .eq('id', id)

  if (error) {
    console.error('Erro ao cancelar férias:', error)
    throw createError({ statusCode: 500, message: error.message })
  }

  return { success: true }
})
