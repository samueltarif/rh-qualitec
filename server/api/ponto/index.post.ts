import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const client = await serverSupabaseClient(event)
  const user = await serverSupabaseUser(event)
  const body = await readBody(event)

  if (!user) {
    throw createError({ statusCode: 401, message: 'Não autenticado' })
  }

  try {
    // Validações básicas
    if (!body.colaborador_id) {
      throw createError({ statusCode: 400, message: 'Colaborador é obrigatório' })
    }

    if (!body.data) {
      throw createError({ statusCode: 400, message: 'Data é obrigatória' })
    }

    // Verificar se já existe registro para este colaborador nesta data
    const { data: existente } = await client
      .from('registros_ponto')
      .select('id')
      .eq('colaborador_id', body.colaborador_id)
      .eq('data', body.data)
      .maybeSingle()

    if (existente) {
      throw createError({ statusCode: 400, message: 'Já existe um registro de ponto para este colaborador nesta data' })
    }

    // Criar registro (sem empresa_id - sistema single-tenant)
    const { data, error } = await (client
      .from('registros_ponto') as any)
      .insert({
        colaborador_id: body.colaborador_id,
        data: body.data,
        entrada_1: body.entrada_1 || null,
        saida_1: body.saida_1 || null,
        entrada_2: body.entrada_2 || null,
        saida_2: body.saida_2 || null,
        status: body.status || 'Normal',
        justificativa: body.justificativa || null,
        observacoes: body.observacoes || null
      })
      .select(`
        *,
        colaborador:colaboradores(id, nome, matricula)
      `)
      .single()

    if (error) {
      console.error('Erro ao criar registro:', error)
      throw createError({ statusCode: 500, message: error.message })
    }

    return data
  } catch (e: any) {
    console.error('Erro ao criar registro de ponto:', e)
    throw createError({ statusCode: e.statusCode || 500, message: e.message || 'Erro ao criar registro' })
  }
})