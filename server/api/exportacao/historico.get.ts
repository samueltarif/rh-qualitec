import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'

export default defineEventHandler(async (event) => {
  try {
    const user = await serverSupabaseUser(event)
    if (!user) {
      throw createError({ statusCode: 401, message: 'Não autenticado' })
    }

    const supabase = await serverSupabaseClient(event)

    const { data, error } = await supabase
      .from('historico_exportacoes')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50)

    if (error) throw error

    return {
      success: true,
      data: data || [],
    }
  } catch (error: any) {
    console.error('Erro ao buscar histórico:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Erro ao buscar histórico',
    })
  }
})
