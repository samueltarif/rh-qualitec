import { serverSupabaseClient } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const client = await serverSupabaseClient(event)

  try {
    console.log('🔧 Iniciando fix de assinaturas fantasma...')

    // 1. Verificar se tabela existe
    const { data: tableExists } = await client
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .eq('table_name', 'assinaturas_ponto')
      .maybeSingle()

    if (!tableExists) {
      console.log('❌ Tabela assinaturas_ponto não existe - criando...')
      
      // Criar tabela via SQL direto
      const createTableSQL = `
        CREATE TABLE IF NOT EXISTS assinaturas_ponto (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          colaborador_id UUID NOT NULL REFERENCES colaboradores(id) ON DELETE CASCADE,
          mes INTEGER NOT NULL CHECK (mes >= 1 AND mes <= 12),
          ano INTEGER NOT NULL CHECK (ano >= 2020 AND ano <= 2030),
          data_assinatura TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          total_dias INTEGER DEFAULT 0,
          total_horas TEXT DEFAULT '0h00',
          hash_assinatura TEXT,
          ip_origem INET,
          observacoes TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          UNIQUE(colaborador_id, mes, ano)
        );
      `
      
      await client.rpc('exec_sql', { sql: createTableSQL })
      console.log('✅ Tabela assinaturas_ponto criada')
    } else {
      console.log('✅ Tabela assinaturas_ponto já existe')
    }

    // 2. Limpar assinaturas fantasma
    const { data: assinaturas } = await client
      .from('assinaturas_ponto')
      .select('*')

    console.log(`📊 Total de assinaturas encontradas: ${assinaturas?.length || 0}`)

    if (assinaturas && assinaturas.length > 0) {
      // Deletar assinaturas sem hash válido
      const { error: deleteError } = await client
        .from('assinaturas_ponto')
        .delete()
        .or('hash_assinatura.is.null,hash_assinatura.eq.')

      if (deleteError) {
        console.error('Erro ao deletar assinaturas fantasma:', deleteError)
      } else {
        console.log('🧹 Assinaturas fantasma removidas')
      }
    }

    // 3. Corrigir auth_uid nos app_users
    const { data: usersWithoutAuth } = await client
      .from('app_users')
      .select('id, email, auth_uid')
      .or('auth_uid.is.null,auth_uid.eq.undefined,auth_uid.eq.')

    console.log(`👥 Usuários sem auth_uid: ${usersWithoutAuth?.length || 0}`)

    // 4. Verificar registros de ponto órfãos
    const { data: pontosOrfaos } = await client
      .from('registros_ponto')
      .select('id, colaborador_id')
      .is('colaborador_id', null)

    if (pontosOrfaos && pontosOrfaos.length > 0) {
      await client
        .from('registros_ponto')
        .delete()
        .is('colaborador_id', null)
      
      console.log(`🧹 ${pontosOrfaos.length} registros de ponto órfãos removidos`)
    }

    // 5. Verificação final
    const { data: assinaturasFinais } = await client
      .from('assinaturas_ponto')
      .select('*')

    const { data: colaboradoresAtivos } = await client
      .from('colaboradores')
      .select('id, nome')
      .eq('status', 'Ativo')

    console.log('=== VERIFICAÇÃO FINAL ===')
    console.log(`Colaboradores ativos: ${colaboradoresAtivos?.length || 0}`)
    console.log(`Assinaturas reais: ${assinaturasFinais?.length || 0}`)

    return {
      success: true,
      message: 'Fix de assinaturas fantasma executado com sucesso',
      dados: {
        colaboradores_ativos: colaboradoresAtivos?.length || 0,
        assinaturas_reais: assinaturasFinais?.length || 0,
        usuarios_sem_auth: usersWithoutAuth?.length || 0,
        pontos_orfaos_removidos: pontosOrfaos?.length || 0
      }
    }

  } catch (error: any) {
    console.error('❌ Erro no fix:', error)
    return {
      success: false,
      error: error.message,
      details: error
    }
  }
})