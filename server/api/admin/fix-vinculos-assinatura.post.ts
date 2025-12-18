import { serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
  try {
    const supabase = await serverSupabaseClient(event)
    
    console.log('🔧 Iniciando correção de vínculos para assinatura digital...')
    
    let totalCorrigidos = 0
    
    // 1. Corrigir por email
    const { data: colaboradoresSemVinculo } = await supabase
      .from('colaboradores')
      .select('id, nome, email_corporativo')
      .is('auth_uid', null)
      .eq('status', 'Ativo')
      .not('email_corporativo', 'is', null)

    if (colaboradoresSemVinculo) {
      for (const colaborador of colaboradoresSemVinculo) {
        // Buscar app_user por email
        const { data: appUser } = await supabase
          .from('app_users')
          .select('auth_uid')
          .eq('email', colaborador.email_corporativo)
          .single()

        if (appUser) {
          // Atualizar colaborador com auth_uid
          const { error } = await supabase
            .from('colaboradores')
            .update({ auth_uid: appUser.auth_uid })
            .eq('id', colaborador.id)

          if (!error) {
            console.log(`✅ Vinculado por email: ${colaborador.nome}`)
            totalCorrigidos++
          }
        }
      }
    }

    // 2. Corrigir por nome (para casos onde email não bate)
    const { data: aindaSemVinculo } = await supabase
      .from('colaboradores')
      .select('id, nome')
      .is('auth_uid', null)
      .eq('status', 'Ativo')

    if (aindaSemVinculo) {
      for (const colaborador of aindaSemVinculo) {
        // Buscar app_user por nome (case insensitive)
        const { data: appUser } = await supabase
          .from('app_users')
          .select('auth_uid')
          .ilike('nome', colaborador.nome)
          .single()

        if (appUser) {
          // Atualizar colaborador com auth_uid
          const { error } = await supabase
            .from('colaboradores')
            .update({ auth_uid: appUser.auth_uid })
            .eq('id', colaborador.id)

          if (!error) {
            console.log(`✅ Vinculado por nome: ${colaborador.nome}`)
            totalCorrigidos++
          }
        }
      }
    }

    // 3. Verificar resultado final
    const { data: finalSemVinculo } = await supabase
      .from('colaboradores')
      .select('id, nome, email_corporativo')
      .is('auth_uid', null)
      .eq('status', 'Ativo')

    console.log(`🎯 Correção concluída: ${totalCorrigidos} vínculos corrigidos`)
    
    return {
      success: true,
      message: `${totalCorrigidos} vínculos corrigidos com sucesso!`,
      resultado: {
        corrigidos: totalCorrigidos,
        ainda_sem_vinculo: finalSemVinculo?.length || 0,
        detalhes_sem_vinculo: finalSemVinculo || []
      }
    }

  } catch (error: any) {
    console.error('❌ Erro ao corrigir vínculos:', error)
    return {
      success: false,
      error: error.message
    }
  }
})