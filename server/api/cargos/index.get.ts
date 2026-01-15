// API para listar todos os cargos
export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const supabaseUrl = config.public.supabaseUrl
  const serviceRoleKey = config.supabaseServiceRoleKey || config.public.supabaseKey

  try {
    const response = await fetch(
      `${supabaseUrl}/rest/v1/cargos?select=*&order=nome.asc`,
      {
        headers: {
          'apikey': serviceRoleKey,
          'Authorization': `Bearer ${serviceRoleKey}`,
          'Content-Type': 'application/json'
        }
      }
    )

    if (!response.ok) {
      throw new Error('Erro ao buscar cargos')
    }

    const cargos = await response.json()
    return { success: true, data: cargos }
  } catch (error: any) {
    console.error('Erro ao buscar cargos:', error)
    throw createError({
      statusCode: 500,
      message: 'Erro ao buscar cargos'
    })
  }
})
