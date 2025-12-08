import { serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const client = (await serverSupabaseClient(event)) as any

  const { data, error } = await client
    .from('politicas_seguranca')
    .select('*')
    .limit(1)
    .single()

  if (error && error.code !== 'PGRST116') {
    throw createError({ statusCode: 500, message: error.message })
  }

  if (!data) {
    return {
      senha_minimo_caracteres: 8,
      senha_requer_maiuscula: true,
      senha_requer_minuscula: true,
      senha_requer_numero: true,
      senha_requer_especial: true,
      senha_expira_dias: 90,
      senha_historico: 5,
      max_tentativas_login: 5,
      bloqueio_temporario_minutos: 30,
      sessao_expira_horas: 8,
      logout_automatico_inatividade: true,
      inatividade_minutos: 30,
      requer_2fa: false,
      permitir_multiplas_sessoes: true,
      registrar_todos_acessos: true,
      registrar_mudancas_dados: true,
      manter_logs_dias: 90,
      termo_uso_obrigatorio: true,
    }
  }

  return data
})
