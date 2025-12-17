import { serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const client = await serverSupabaseClient(event)

  try {
    console.log('🔧 Corrigindo vínculo específico: Claudia')

    // 1. Buscar CLAUDIA SILVA SANTOS
    const { data: claudia, error: claudiaError } = await client
      .from('colaboradores')
      .select('id, nome, email_corporativo, email_pessoal, matricula')
      .or('nome.ilike.%CLAUDIA%,matricula.eq.2')
      .single()

    if (claudiaError || !claudia) {
      console.error('❌ Claudia não encontrada:', claudiaError)
      return { success: false, error: 'Claudia não encontrada' }
    }

    console.log('👤 Claudia encontrada:', claudia)

    // 2. Buscar usuário com email conta3secunndaria@gmail.com
    const { data: appUser, error: appUserError } = await client
      .from('app_users')
      .select('id, email, nome, auth_uid, colaborador_id')
      .eq('email', 'conta3secunndaria@gmail.com')
      .single()

    if (appUserError || !appUser) {
      console.error('❌ Usuário com email conta3secunndaria@gmail.com não encontrado:', appUserError)
      return { success: false, error: 'Usuário não encontrado' }
    }

    console.log('👤 Usuário encontrado:', appUser)

    // 3. Verificar se já está correto
    if (appUser.colaborador_id === claudia.id) {
      console.log('✅ Vínculo já está correto!')
      return { 
        success: true, 
        message: 'Vínculo já estava correto',
        dados: { claudia, appUser }
      }
    }

    // 4. Corrigir o vínculo
    const { data: updated, error: updateError } = await client
      .from('app_users')
      .update({
        colaborador_id: claudia.id,
        nome: claudia.nome
      })
      .eq('id', appUser.id)
      .select()
      .single()

    if (updateError) {
      console.error('❌ Erro ao atualizar vínculo:', updateError)
      return { success: false, error: updateError.message }
    }

    console.log('✅ Vínculo corrigido com sucesso!')
    console.log('Antes:', `${appUser.email} -> ${appUser.nome}`)
    console.log('Depois:', `${updated.email} -> ${updated.nome}`)

    // 5. Verificar se há outro usuário vinculado à Claudia incorretamente
    const { data: outrosVinculos } = await client
      .from('app_users')
      .select('id, email, nome, auth_uid')
      .eq('colaborador_id', claudia.id)
      .neq('id', appUser.id)

    if (outrosVinculos && outrosVinculos.length > 0) {
      console.log('⚠️ Outros vínculos encontrados para Claudia:', outrosVinculos)
      
      // Remover vínculos duplicados (manter apenas o correto)
      for (const vinculo of outrosVinculos) {
        if (!vinculo.auth_uid || vinculo.auth_uid === 'undefined') {
          await client
            .from('app_users')
            .delete()
            .eq('id', vinculo.id)
          
          console.log(`🧹 Removido vínculo duplicado: ${vinculo.email}`)
        }
      }
    }

    // 6. Verificação final
    const { data: verificacao } = await client
      .from('app_users')
      .select(`
        email,
        nome,
        auth_uid,
        colaborador:colaboradores(nome, matricula)
      `)
      .eq('email', 'conta3secunndaria@gmail.com')
      .single()

    console.log('🔍 Verificação final:', verificacao)

    return {
      success: true,
      message: 'Vínculo da Claudia corrigido com sucesso!',
      dados: {
        antes: appUser,
        depois: updated,
        verificacao: verificacao
      }
    }

  } catch (error: any) {
    console.error('❌ Erro na correção:', error)
    return {
      success: false,
      error: error.message,
      details: error
    }
  }
})