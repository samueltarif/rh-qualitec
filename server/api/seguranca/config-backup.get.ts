import { serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const client = (await serverSupabaseClient(event)) as any

  const { data, error } = await client
    .from('configuracoes_backup')
    .select('*')
    .limit(1)
    .single()

  if (error && error.code !== 'PGRST116') {
    throw createError({ statusCode: 500, message: error.message })
  }

  // Retornar valores padrão se não existir
  if (!data) {
    return {
      backup_automatico: true,
      frequencia: 'diario',
      horario_backup: '02:00:00',
      manter_backups_dias: 30,
      manter_backups_quantidade: 10,
      incluir_colaboradores: true,
      incluir_documentos: true,
      incluir_folha: true,
      incluir_ponto: true,
      incluir_ferias: true,
      incluir_configuracoes: true,
      notificar_backup_sucesso: false,
      notificar_backup_erro: true,
      criptografar_backup: true,
    }
  }

  return data
})
