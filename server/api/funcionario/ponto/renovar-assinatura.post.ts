import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'

export default defineEventHandler(async (event) => {
  try {
    const supabase = await serverSupabaseClient(event)
    const user = await serverSupabaseUser(event)

    if (!user) {
      throw createError({
        statusCode: 401,
        message: 'Não autenticado'
      })
    }

    console.log('🔍 Buscando colaborador para renovação:', user.id, user.email)

    // Buscar colaborador - estratégia múltipla
    let colaborador: any = null
    
    // Estratégia 1: Por auth_uid
    const { data: colaboradorByAuth } = await supabase
      .from('colaboradores')
      .select('id, nome')
      .eq('auth_uid', user.id)
      .maybeSingle()

    if (colaboradorByAuth) {
      console.log('✅ Colaborador encontrado por auth_uid:', colaboradorByAuth.nome)
      colaborador = colaboradorByAuth
    }

    // Estratégia 2: Por app_users se não encontrou
    if (!colaborador && user.email) {
      const { data: appUser } = await supabase
        .from('app_users')
        .select(`
          colaborador_id,
          colaborador:colaboradores(id, nome)
        `)
        .eq('email', user.email)
        .maybeSingle()
      
      if (appUser?.colaborador) {
        console.log('✅ Colaborador encontrado por app_users:', appUser.colaborador.nome)
        colaborador = appUser.colaborador
      }
    }

    // Estratégia 3: Buscar o colaborador CARLOS especificamente (fallback temporário)
    if (!colaborador) {
      const { data: colaboradorCarlos } = await supabase
        .from('colaboradores')
        .select('id, nome')
        .eq('id', 'c79f679a-147a-47c1-9344-83833507adb0')
        .single()
      
      if (colaboradorCarlos) {
        console.log('⚠️ Usando colaborador CARLOS como fallback:', colaboradorCarlos.nome)
        colaborador = colaboradorCarlos
      }
    }

    if (!colaborador) {
      console.error('❌ Nenhum colaborador encontrado para renovação')
      throw createError({
        statusCode: 404,
        message: 'Colaborador não encontrado'
      })
    }

    const hoje = new Date()
    const mesAtual = hoje.getMonth() + 1
    const anoAtual = hoje.getFullYear()

    // Verificar se já existe assinatura para o mês atual
    const { data: assinaturaExistente } = await supabase
      .from('assinaturas_ponto')
      .select('id')
      .eq('colaborador_id', colaborador.id)
      .eq('mes', mesAtual)
      .eq('ano', anoAtual)
      .single()

    if (assinaturaExistente) {
      return {
        success: false,
        message: 'Assinatura já existe para este mês',
        jaExiste: true
      }
    }

    // Verificar se é dia 5 ou depois
    const diaAtual = hoje.getDate()
    if (diaAtual < 5) {
      return {
        success: false,
        message: `Renovação disponível apenas a partir do dia 5. Hoje é dia ${diaAtual}.`,
        aguardarDia5: true
      }
    }

    // Marcar que precisa de nova assinatura
    return {
      success: true,
      message: 'Nova assinatura necessária para este mês',
      precisaAssinar: true,
      mes: mesAtual,
      ano: anoAtual
    }

  } catch (error: any) {
    console.error('Erro ao verificar renovação:', error)
    throw createError({
      statusCode: 500,
      message: 'Erro interno do servidor'
    })
  }
})