import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const supabase = await serverSupabaseClient(event)
  const user = await serverSupabaseUser(event)

  if (!user) {
    throw createError({ statusCode: 401, message: 'Não autenticado' })
  }

  try {
    const { data: templates, error } = await supabase
      .from('relatorios_templates')
      .select('*')
      .order('favorito', { ascending: false })
      .order('nome')

    if (error) throw error

    return {
      success: true,
      data: templates || []
    }
  } catch (error: any) {
    console.error('Erro ao buscar templates:', error)
    throw createError({
      statusCode: 500,
      message: error.message || 'Erro ao buscar templates de relatórios'
    })
  }
})
