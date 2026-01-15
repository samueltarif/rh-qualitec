import { serverSupabaseServiceRole } from '#supabase/server'

export default defineEventHandler(async (event) => {
  try {
    const supabase = serverSupabaseServiceRole(event)
    const id = getRouterParam(event, 'id')

    if (!id) {
      throw createError({
        statusCode: 400,
        message: 'ID do funcionário não fornecido'
      })
    }

    const { data: funcionario, error } = await supabase
      .from('funcionarios')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      console.error('Erro ao buscar funcionário:', error)
      throw error
    }

    if (!funcionario) {
      throw createError({
        statusCode: 404,
        message: 'Funcionário não encontrado'
      })
    }

    return funcionario

  } catch (error: any) {
    console.error('Erro ao buscar funcionário:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Erro ao buscar funcionário'
    })
  }
})
