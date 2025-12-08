import { serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const client = (await serverSupabaseClient(event)) as any
  const body = await readBody(event)

  // Validação básica
  if (!body.titulo || !body.mensagem) {
    throw createError({ statusCode: 400, message: 'Título e mensagem são obrigatórios' })
  }

  // Buscar empresa_id padrão se não informado
  let empresaId = body.empresa_id
  if (!empresaId) {
    const { data: empresa } = await client.from('empresas').select('id').limit(1).single()
    empresaId = empresa?.id
  }

  const alertaData = {
    empresa_id: empresaId,
    tipo_alerta_id: body.tipo_alerta_id || null,
    colaborador_id: body.colaborador_id || null,
    documento_id: body.documento_id || null,
    referencia_tipo: body.referencia_tipo || 'manual',
    referencia_id: body.referencia_id || null,
    titulo: body.titulo,
    mensagem: body.mensagem,
    dados_extras: body.dados_extras || {},
    status: 'pendente',
    prioridade: body.prioridade || 'media',
    data_vencimento: body.data_vencimento || null,
  }

  const { data, error } = await client.from('alertas').insert(alertaData).select().single()

  if (error) {
    throw createError({ statusCode: 500, message: error.message })
  }

  return data
})
