import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const client = await serverSupabaseClient(event)
  const user = await serverSupabaseUser(event)

  if (!user) {
    throw createError({ statusCode: 401, message: 'Não autenticado' })
  }

  console.log('=== PERFIL DEBUG ===')
  console.log('Auth user.id:', user.id)
  console.log('Auth user.email:', user.email)

  try {
    // Buscar app_user pelo auth_uid
    let { data: appUser, error: appUserError } = await client
      .from('app_users')
      .select('id, colaborador_id, nome, email, role, auth_uid')
      .eq('auth_uid', user.id)
      .single()

    console.log('Busca por auth_uid:', { appUser, appUserError })

    // Se não encontrou por auth_uid, tentar por email
    if (!appUser) {
      const { data: appUserByEmail, error: emailError } = await client
        .from('app_users')
        .select('id, colaborador_id, nome, email, role, auth_uid')
        .eq('email', user.email)
        .single()
      
      console.log('Busca por email:', { appUserByEmail, emailError })
      
      if (appUserByEmail) {
        // Atualizar o auth_uid se encontrou por email
        await client
          .from('app_users')
          .update({ auth_uid: user.id })
          .eq('id', appUserByEmail.id)
        
        appUser = { ...appUserByEmail, auth_uid: user.id }
        console.log('Auth_uid atualizado!')
      }
    }

    if (!appUser) {
      throw createError({ statusCode: 404, message: 'Usuário não encontrado no app_users' })
    }

    const appUserData = appUser as any
    console.log('AppUser encontrado:', appUserData)

    if (!appUserData.colaborador_id) {
      console.log('Colaborador_id está NULL ou vazio')
      return { 
        appUser: appUserData,
        colaborador: null,
        message: 'Usuário não vinculado a um colaborador'
      }
    }

    console.log('Buscando colaborador com ID:', appUserData.colaborador_id)

    // Buscar dados do colaborador
    const { data: colaborador, error: colabError } = await client
      .from('colaboradores')
      .select(`
        *,
        cargo:cargos(id, nome),
        departamento:departamentos!colaboradores_departamento_id_fkey(id, nome),
        jornada:jornadas_trabalho(id, nome, carga_horaria_semanal)
      `)
      .eq('id', appUserData.colaborador_id)
      .single()

    console.log('Colaborador encontrado:', colaborador)
    if (colabError) {
      console.error('Erro ao buscar colaborador:', colabError)
    }

    return {
      appUser: appUserData,
      colaborador: colaborador || null
    }
  } catch (e: any) {
    console.error('Erro ao buscar perfil:', e)
    throw createError({ statusCode: 500, message: e.message || 'Erro ao buscar perfil' })
  }
})
