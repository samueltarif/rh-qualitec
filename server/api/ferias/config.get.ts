import { serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const client = await serverSupabaseClient(event)

  const { data, error } = await client
    .from('config_ferias')
    .select('*')
    .limit(1)
    .single()

  if (error && error.code !== 'PGRST116') {
    console.error('Erro ao buscar config de férias:', error)
    // Retornar config padrão se tabela não existir
    return {
      dias_minimos_fracionamento: 5,
      dias_maximos_venda: 10,
      antecedencia_minima_dias: 30,
      permite_fracionamento: true,
      max_fracoes: 3,
      permite_abono_pecuniario: true,
      notificar_vencimento_dias: 60,
      notificar_aprovador: true,
      notificar_rh: true,
      bloquear_ferias_coletivas: false,
      periodos_bloqueados: [],
    }
  }

  return data || {
    dias_minimos_fracionamento: 5,
    dias_maximos_venda: 10,
    antecedencia_minima_dias: 30,
    permite_fracionamento: true,
    max_fracoes: 3,
    permite_abono_pecuniario: true,
    notificar_vencimento_dias: 60,
    notificar_aprovador: true,
    notificar_rh: true,
    bloquear_ferias_coletivas: false,
    periodos_bloqueados: [],
  }
})
