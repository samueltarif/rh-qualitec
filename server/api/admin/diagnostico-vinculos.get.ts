import { serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const client = await serverSupabaseClient(event)

  try {
    console.log('🔍 Diagnóstico completo de vínculos...')

    // 1. Verificar usuários auth
    const { data: authUsers, error: authError } = await client
      .rpc('get_auth_users')

    if (authError) {
      console.log('❌ Não foi possível acessar auth.users via RPC')
      console.log('Tentando método alternativo...')
    }

    // 2. Verificar app_users
    const { data: appUsers } = await client
      .from('app_users')
      .select(`
        id,
        email,
        nome,
        auth_uid,
        colaborador_id,
        role,
        colaborador:colaboradores(nome, email_corporativo, email_pessoal, status)
      `)

    console.log('📊 App Users encontrados:', appUsers?.length)
    appUsers?.forEach(user => {
      console.log(`- ${user.email} -> ${user.colaborador?.nome} (auth_uid: ${user.auth_uid})`)
    })

    // 3. Verificar colaboradores
    const { data: colaboradores } = await client
      .from('colaboradores')
      .select('id, nome, email_corporativo, email_pessoal, status')
      .eq('status', 'Ativo')

    console.log('👥 Colaboradores ativos:', colaboradores?.length)
    colaboradores?.forEach(col => {
      console.log(`- ${col.nome} (${col.email_corporativo || col.email_pessoal})`)
    })

    // 4. Buscar especificamente por emails problemáticos
    const emailsProblematicos = ['conta3secunndaria@gmail.com', 'quotextarif@gmail.com']
    
    for (const email of emailsProblematicos) {
      const userComEmail = appUsers?.find(u => u.email === email)
      console.log(`🔍 Email ${email}:`, userComEmail ? 'Encontrado' : 'Não encontrado')
      if (userComEmail) {
        console.log(`  - Nome: ${userComEmail.nome}`)
        console.log(`  - Colaborador: ${userComEmail.colaborador?.nome}`)
        console.log(`  - Auth UID: ${userComEmail.auth_uid}`)
      }
    }

    // 5. Verificar se há problemas de auth_uid
    const semAuthUid = appUsers?.filter(u => !u.auth_uid || u.auth_uid === 'undefined')
    console.log(`⚠️ Usuários sem auth_uid válido: ${semAuthUid?.length || 0}`)
    semAuthUid?.forEach(user => {
      console.log(`  - ${user.email} (${user.nome})`)
    })

    return {
      success: true,
      dados: {
        total_app_users: appUsers?.length || 0,
        total_colaboradores: colaboradores?.length || 0,
        usuarios_sem_auth_uid: semAuthUid?.length || 0,
        app_users: appUsers,
        colaboradores: colaboradores,
        usuarios_problematicos: emailsProblematicos.map(email => ({
          email,
          encontrado: !!appUsers?.find(u => u.email === email),
          dados: appUsers?.find(u => u.email === email)
        }))
      }
    }

  } catch (error: any) {
    console.error('❌ Erro no diagnóstico:', error)
    return {
      success: false,
      error: error.message,
      details: error
    }
  }
})