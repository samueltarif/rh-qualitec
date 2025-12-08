import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const client = await serverSupabaseClient(event)
  const user = await serverSupabaseUser(event)
  const body = await readBody(event)

  const { id, acao, motivo_rejeicao } = body

  if (!id || !acao) {
    throw createError({ statusCode: 400, message: 'ID e ação são obrigatórios' })
  }

  if (acao !== 'aprovar' && acao !== 'rejeitar') {
    throw createError({ statusCode: 400, message: 'Ação deve ser "aprovar" ou "rejeitar"' })
  }

  if (acao === 'rejeitar' && !motivo_rejeicao) {
    throw createError({ statusCode: 400, message: 'Motivo da rejeição é obrigatório' })
  }

  // Buscar user_id do usuário logado
  let aprovadorId = null
  if (user) {
    const { data: userData } = await client
      .from('users')
      .select('id')
      .eq('auth_uid', user.id)
      .single()
    
    if (userData) {
      aprovadorId = (userData as any).id
    }
  }

  const updateData: Record<string, any> = {
    status: acao === 'aprovar' ? 'Aprovada' : 'Rejeitada',
    aprovado_em: new Date().toISOString(),
    aprovado_por: aprovadorId,
  }

  if (acao === 'rejeitar') {
    updateData.motivo_rejeicao = motivo_rejeicao
  }

  const { data, error } = await (client
    .from('ferias') as any)
    .update(updateData)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Erro ao aprovar/rejeitar férias:', error)
    throw createError({ statusCode: 500, message: error.message })
  }

  return data
})
