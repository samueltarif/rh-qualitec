import { serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
  try {
    const supabase = await serverSupabaseClient(event)

    // Verificar colaboradores sem vínculo
    const { data: semVinculo } = await supabase
      .from('colaboradores')
      .select('id, nome, email_corporativo, auth_uid, status')
      .is('auth_uid', null)
      .eq('status', 'Ativo')

    // Verificar colaboradores com vínculo
    const { data: comVinculo } = await supabase
      .from('colaboradores')
      .select(`
        id, 
        nome, 
        email_corporativo, 
        auth_uid,
        app_users!inner(nome, email)
      `)
      .not('auth_uid', 'is', null)
      .eq('status', 'Ativo')

    // Verificar app_users sem colaborador
    const { data: usersSemColaborador } = await supabase
      .from('app_users')
      .select('id, nome, email, auth_uid, role')
      .eq('role', 'funcionario')

    const colaboradoresComVinculo = comVinculo?.map(c => c.auth_uid) || []
    const usersSemVinculo = usersSemColaborador?.filter(u => 
      !colaboradoresComVinculo.includes(u.auth_uid)
    ) || []

    return {
      success: true,
      diagnostico: {
        colaboradores_sem_vinculo: semVinculo?.length || 0,
        colaboradores_com_vinculo: comVinculo?.length || 0,
        usuarios_sem_colaborador: usersSemVinculo.length,
        detalhes: {
          sem_vinculo: semVinculo || [],
          com_vinculo: comVinculo || [],
          usuarios_sem_colaborador: usersSemVinculo
        }
      }
    }
  } catch (error: any) {
    console.error('Erro no diagnóstico:', error)
    return {
      success: false,
      error: error.message
    }
  }
})