// API para listar departamentos
export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const supabaseUrl = config.public.supabaseUrl
  const supabaseKey = config.public.supabaseKey

  try {
    const response = await fetch(
      `${supabaseUrl}/rest/v1/departamentos?select=*&order=nome.asc`,
      {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json'
        }
      }
    )

    if (!response.ok) {
      throw new Error('Erro ao buscar departamentos')
    }

    const departamentos = await response.json()

    return {
      success: true,
      data: departamentos
    }
  } catch (error: any) {
    console.error('Erro ao buscar departamentos:', error)
    throw createError({
      statusCode: 500,
      message: 'Erro ao buscar departamentos'
    })
  }
})
