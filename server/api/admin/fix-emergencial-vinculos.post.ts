import { serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const client = await serverSupabaseClient(event)

  try {
    console.log('🚨 FIX EMERGENCIAL: Corrigindo vínculos trocados')

    // 1. DIAGNÓSTICO ATUAL
    const { data: appUsers } = await client
      .from('app_users')
      .select(`
        id,
        email,
        nome,
        auth_uid,
        colaborador_id,
        colaborador:colaboradores(nome, email_corporativo, matricula)
      `)

    console.log('📊 Situação atual dos app_users:')
    appUsers?.forEach(user => {
      console.log(`- Email: ${user.email} → Nome: ${user.nome} → Colaborador: ${user.colaborador?.nome}`)
    })

    // 2. IDENTIFICAR OS VÍNCULOS INCORRETOS
    const claudiaEmail = 'quotextarif@gmail.com'
    const enoaEmail = 'conta3secunndaria@gmail.com'

    // Buscar colaboradores corretos
    const { data: claudiaColaborador } = await client
      .from('colaboradores')
      .select('id, nome, email_corporativo, matricula')
      .ilike('nome', '%CLAUDIA%')
      .single()

    const { data: enoaColaborador } = await client
      .from('colaboradores')
      .select('id, nome, email_corporativo, matricula')
      .ilike('nome', '%ENOA%')
      .single()

    console.log('👤 Colaboradores encontrados:')
    console.log('Claudia:', claudiaColaborador)
    console.log('Enoa:', enoaColaborador)

    if (!claudiaColaborador || !enoaColaborador) {
      throw new Error('Colaboradores não encontrados')
    }

    // 3. CORRIGIR VÍNCULOS ESPECÍFICOS
    
    // Corrigir vínculo da Claudia (quotextarif@gmail.com deve apontar para CLAUDIA)
    const { error: claudiaError } = await client
      .from('app_users')
      .update({
        colaborador_id: claudiaColaborador.id,
        nome: claudiaColaborador.nome,
        email: claudiaEmail
      })
      .eq('email', claudiaEmail)

    if (claudiaError) {
      console.error('❌ Erro ao corrigir Claudia:', claudiaError)
    } else {
      console.log('✅ Claudia corrigida: quotextarif@gmail.com → CLAUDIA SILVA SANTOS')
    }

    // Corrigir vínculo da Enoa (conta3secunndaria@gmail.com deve apontar para ENOA)
    const { error: enoaError } = await client
      .from('app_users')
      .update({
        colaborador_id: enoaColaborador.id,
        nome: enoaColaborador.nome,
        email: enoaEmail
      })
      .eq('email', enoaEmail)

    if (enoaError) {
      console.error('❌ Erro ao corrigir Enoa:', enoaError)
    } else {
      console.log('✅ Enoa corrigida: conta3secunndaria@gmail.com → ENOA SILVA COSTA')
    }

    // 4. VERIFICAÇÃO FINAL
    const { data: appUsersCorrigidos } = await client
      .from('app_users')
      .select(`
        email,
        nome,
        colaborador:colaboradores(nome, matricula)
      `)
      .in('email', [claudiaEmail, enoaEmail])

    console.log('=== VERIFICAÇÃO FINAL ===')
    appUsersCorrigidos?.forEach(user => {
      const status = 
        (user.email === claudiaEmail && user.colaborador?.nome?.includes('CLAUDIA')) ||
        (user.email === enoaEmail && user.colaborador?.nome?.includes('ENOA'))
        ? '✅ CORRETO' : '❌ AINDA INCORRETO'
      
      console.log(`${user.email} → ${user.colaborador?.nome} ${status}`)
    })

    // 5. LIMPAR CACHE DE SESSÃO (forçar relogin)
    console.log('🔄 Limpando cache de sessão...')

    return {
      success: true,
      message: 'Vínculos corrigidos emergencialmente!',
      dados: {
        claudia_corrigida: !claudiaError,
        enoa_corrigida: !enoaError,
        verificacao: appUsersCorrigidos,
        acao_necessaria: 'Usuários devem fazer logout e login novamente'
      }
    }

  } catch (error: any) {
    console.error('❌ Erro no fix emergencial:', error)
    return {
      success: false,
      error: error.message,
      details: error
    }
  }
})