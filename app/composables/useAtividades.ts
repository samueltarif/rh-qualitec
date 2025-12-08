export const useAtividades = () => {
  const supabase = useSupabaseClient()

  // Registrar atividade
  const registrarAtividade = async (
    tipoAcao: string,
    modulo: string,
    descricao: string,
    detalhes?: any
  ) => {
    try {
      const { data, error } = await supabase.rpc('fn_registrar_atividade', {
        p_tipo_acao: tipoAcao,
        p_modulo: modulo,
        p_descricao: descricao,
        p_detalhes: detalhes || null
      })

      if (error) throw error
      return { success: true, data }
    } catch (error: any) {
      console.error('Erro ao registrar atividade:', error)
      return { success: false, error: error.message }
    }
  }

  // Buscar atividades recentes
  const buscarAtividades = async (limite = 10) => {
    try {
      const { data, error } = await supabase
        .from('vw_atividades_recentes')
        .select('*')
        .limit(limite)

      if (error) throw error
      return { success: true, data: data || [] }
    } catch (error: any) {
      console.error('Erro ao buscar atividades:', error)
      return { success: false, error: error.message, data: [] }
    }
  }

  // Buscar atividades por usuário
  const buscarAtividadesUsuario = async (userId: string, limite = 20) => {
    try {
      const { data, error } = await supabase
        .from('vw_atividades_recentes')
        .select('*')
        .eq('user_id', userId)
        .limit(limite)

      if (error) throw error
      return { success: true, data: data || [] }
    } catch (error: any) {
      console.error('Erro ao buscar atividades do usuário:', error)
      return { success: false, error: error.message, data: [] }
    }
  }

  // Buscar atividades por módulo
  const buscarAtividadesModulo = async (modulo: string, limite = 20) => {
    try {
      const { data, error } = await supabase
        .from('vw_atividades_recentes')
        .select('*')
        .eq('modulo', modulo)
        .limit(limite)

      if (error) throw error
      return { success: true, data: data || [] }
    } catch (error: any) {
      console.error('Erro ao buscar atividades do módulo:', error)
      return { success: false, error: error.message, data: [] }
    }
  }

  return {
    registrarAtividade,
    buscarAtividades,
    buscarAtividadesUsuario,
    buscarAtividadesModulo
  }
}
