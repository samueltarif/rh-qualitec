import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'

export default defineEventHandler(async (event) => {
  try {
    const user = await serverSupabaseUser(event)
    if (!user) {
      throw createError({ statusCode: 401, message: 'Não autenticado' })
    }

    const supabase = await serverSupabaseClient(event)

    const { data, error } = await supabase
      .from('config_importacao_exportacao')
      .select('*')
      .single()

    if (error) {
      console.error('Erro ao buscar config:', error)
      // Se a tabela não existe, retornar valores padrão
      if (error.code === 'PGRST116' || error.message?.includes('does not exist')) {
        return {
          success: true,
          data: {
            tamanho_maximo_arquivo: 10485760, // 10MB
            tempo_expiracao_exportacao: 24,
            limite_registros_exportacao: 50000,
            encoding_padrao: 'UTF-8',
            delimitador_csv: ',',
            validacao_automatica: true,
            backup_antes_importacao: true,
            notificar_conclusao: true,
            permitir_importacao_paralela: false,
          },
        }
      }
      throw error
    }

    return {
      success: true,
      data,
    }
  } catch (error: any) {
    console.error('Erro ao buscar configurações:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Erro ao buscar configurações',
    })
  }
})
