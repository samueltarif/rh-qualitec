import { serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const client = await serverSupabaseClient(event)

  try {
    console.log('🔧 Iniciando correção de vínculos usuários-colaboradores...')

    // 1. Diagnóstico inicial
    const { data: vinculos } = await client
      .from('app_users')
      .select(`
        id,
        email,
        nome,
        auth_uid,
        colaborador_id,
        colaborador:colaboradores(nome, email_corporativo, email_pessoal)
      `)

    console.log(`📊 Total de usuários encontrados: ${vinculos?.length || 0}`)

    // 2. Buscar colaboradores específicos
    const { data: claudia } = await client
      .from('colaboradores')
      .select('id, nome, email_corporativo, email_pessoal')
      .ilike('nome', '%CLAUDIA%')
      .single()

    const { data: enoa } = await client
      .from('colaboradores')
      .select('id, nome, email_corporativo, email_pessoal')
      .ilike('nome', '%ENOA%')
      .single()

    console.log('👥 Colaboradores encontrados:')
    console.log('Claudia:', claudia)
    console.log('Enoa:', enoa)

    // 3. Buscar usuário auth com email conta3secunndaria@gmail.com
    const { data: authUser } = await client
      .from('auth.users')
      .select('id, email')
      .eq('email', 'conta3secunndaria@gmail.com')
      .single()

    console.log('🔑 Usuário auth:', authUser)

    if (claudia && authUser) {
      // 4. Corrigir vínculo: conta3secunndaria@gmail.com deve ser CLAUDIA
      const { error: updateError } = await client
        .from('app_users')
        .update({
          colaborador_id: claudia.id,
          nome: claudia.nome,
          email: 'conta3secunndaria@gmail.com'
        })
        .eq('auth_uid', authUser.id)

      if (updateError) {
        console.error('Erro ao atualizar vínculo:', updateError)
      } else {
        console.log('✅ Vínculo corrigido: conta3secunndaria@gmail.com -> CLAUDIA')
      }
    }

    // 5. Verificar se há vínculos duplicados
    const { data: duplicados } = await client
      .from('app_users')
      .select('colaborador_id')
      .not('colaborador_id', 'is', null)

    const contadorDuplicados: Record<string, number> = {}
    duplicados?.forEach(item => {
      if (item.colaborador_id) {
        contadorDuplicados[item.colaborador_id] = (contadorDuplicados[item.colaborador_id] || 0) + 1
      }
    })

    const colaboradoresDuplicados = Object.entries(contadorDuplicados)
      .filter(([_, count]) => count > 1)

    console.log(`🔍 Colaboradores com vínculos duplicados: ${colaboradoresDuplicados.length}`)

    // 6. Remover vínculos órfãos
    const { error: deleteOrfaosError } = await client
      .from('app_users')
      .delete()
      .is('colaborador_id', null)

    if (!deleteOrfaosError) {
      console.log('🧹 Vínculos órfãos removidos')
    }

    // 7. Verificação final
    const { data: vinculosFinais } = await client
      .from('app_users')
      .select(`
        email,
        nome,
        auth_uid,
        colaborador:colaboradores(nome, email_corporativo)
      `)
      .not('colaborador_id', 'is', null)

    console.log('=== VERIFICAÇÃO FINAL ===')
    vinculosFinais?.forEach(vinculo => {
      const status = vinculo.email === 'conta3secunndaria@gmail.com' && 
                    vinculo.colaborador?.nome?.includes('CLAUDIA') ? '✅ CORRETO' : '⚠️ VERIFICAR'
      console.log(`${vinculo.email} -> ${vinculo.colaborador?.nome} ${status}`)
    })

    return {
      success: true,
      message: 'Vínculos corrigidos com sucesso',
      dados: {
        total_usuarios: vinculos?.length || 0,
        claudia_encontrada: !!claudia,
        enoa_encontrada: !!enoa,
        auth_user_encontrado: !!authUser,
        vinculos_duplicados: colaboradoresDuplicados.length,
        vinculos_finais: vinculosFinais?.length || 0
      }
    }

  } catch (error: any) {
    console.error('❌ Erro na correção de vínculos:', error)
    return {
      success: false,
      error: error.message,
      details: error
    }
  }
})