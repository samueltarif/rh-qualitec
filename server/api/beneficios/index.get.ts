// API para listar benefícios
export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const supabaseUrl = config.public.supabaseUrl
  const supabaseKey = config.public.supabaseKey

  try {
    const response = await fetch(
      `${supabaseUrl}/rest/v1/beneficios?select=*&order=nome.asc`,
      {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json'
        }
      }
    )

    if (!response.ok) {
      throw new Error('Erro ao buscar benefícios')
    }

    const beneficios = await response.json()

    return {
      success: true,
      data: beneficios
    }
  } catch (error: any) {
    console.error('Erro ao buscar benefícios:', error)
    throw createError({
      statusCode: 500,
      message: 'Erro ao buscar benefícios'
    })
  }
})
