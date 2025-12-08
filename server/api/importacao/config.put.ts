import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event)
  if (!user) {
    throw createError({ statusCode: 401, message: 'Não autenticado' })
  }

  const body = await readBody(event)
  const supabase = await serverSupabaseClient(event)

  try {
    // Usar upsert para inserir ou atualizar
    const configData = {
      id: '00000000-0000-0000-0000-000000000001',
      tamanho_maximo_arquivo: body.tamanho_maximo_arquivo,
      tempo_expiracao_exportacao: body.tempo_expiracao_exportacao,
      limite_registros_exportacao: body.limite_registros_exportacao,
      encoding_padrao: body.encoding_padrao,
      delimitador_csv: body.delimitador_csv,
      validacao_automatica: body.validacao_automatica,
      backup_antes_importacao: body.backup_antes_importacao,
      notificar_conclusao: body.notificar_conclusao,
      permitir_importacao_paralela: body.permitir_importacao_paralela,
      updated_at: new Date().toISOString(),
    }

    console.log('Tentando upsert com dados:', configData)

    // @ts-ignore
    const { data, error } = await supabase
      .from('config_importacao_exportacao')
      .upsert(configData as any, { onConflict: 'id' })
      .select()

    if (error) {
      console.error('Erro no upsert:', error)
      console.error('Código do erro:', error.code)
      console.error('Mensagem do erro:', error.message)
      console.error('Detalhes do erro:', error.details)
      
      throw createError({
        statusCode: 500,
        message: `Erro ao salvar: ${error.message}`,
      })
    }

    console.log('Upsert bem-sucedido, data:', data)

    // Retornar o primeiro item (deve ser único por causa do ID fixo)
    const result = Array.isArray(data) ? data[0] : data

    return {
      success: true,
      data: result,
    }
  } catch (error: any) {
    console.error('Erro geral ao atualizar configurações:', error)
    
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Erro ao atualizar configurações',
    })
  }
})
