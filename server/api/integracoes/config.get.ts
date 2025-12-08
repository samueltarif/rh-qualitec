import { serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const client = (await serverSupabaseClient(event)) as any

  const { data, error } = await client
    .from('configuracoes_integracoes')
    .select('*')
    .limit(1)
    .single()

  if (error && error.code !== 'PGRST116') {
    throw createError({ statusCode: 500, message: error.message })
  }

  if (!data) {
    return {
      contabilidade_ativa: false,
      esocial_ativo: false,
      banco_pagamento_ativo: false,
      ponto_ativo: false,
      smtp_ativo: false,
      whatsapp_ativo: false,
      sms_ativo: false,
      webhook_ativo: false,
    }
  }

  return data
})
