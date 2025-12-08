import type { H3Event } from 'h3'
import { serverSupabaseClient } from '#supabase/server'

export const logAtividade = async (
  event: H3Event,
  tipoAcao: string,
  modulo: string,
  descricao: string,
  detalhes?: any
) => {
  try {
    const supabase = await serverSupabaseClient(event)
    
    const { data, error } = await supabase.rpc('fn_registrar_atividade', {
      p_tipo_acao: tipoAcao,
      p_modulo: modulo,
      p_descricao: descricao,
      p_detalhes: detalhes ? JSON.stringify(detalhes) : null
    })

    if (error) {
      console.error('Erro ao registrar atividade:', error)
    }

    return { success: !error, data }
  } catch (error) {
    console.error('Erro ao registrar atividade:', error)
    return { success: false, error }
  }
}
