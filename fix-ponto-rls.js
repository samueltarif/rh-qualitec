// Script para corrigir políticas RLS da tabela registros_ponto
import { createClient } from '@supabase/supabase-js'
import 'dotenv/config'

const supabaseUrl = process.env.SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Erro: SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY não encontrados no .env')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

const queries = [
  // Remover políticas antigas
  `DROP POLICY IF EXISTS "funcionarios_view_own_ponto" ON registros_ponto`,
  `DROP POLICY IF EXISTS "funcionarios_insert_own_ponto" ON registros_ponto`,
  `DROP POLICY IF EXISTS "funcionarios_update_own_ponto" ON registros_ponto`,
  `DROP POLICY IF EXISTS "admins_all_ponto" ON registros_ponto`,
  `DROP POLICY IF EXISTS "service_role_ponto" ON registros_ponto`,
  `DROP POLICY IF EXISTS "users_select_ponto" ON registros_ponto`,
  `DROP POLICY IF EXISTS "users_insert_ponto" ON registros_ponto`,
  `DROP POLICY IF EXISTS "users_update_ponto" ON registros_ponto`,
  `DROP POLICY IF EXISTS "users_delete_ponto" ON registros_ponto`,
  `DROP POLICY IF EXISTS "admins_rh_all_ponto" ON registros_ponto`,
  
  // Criar políticas corretas
  `CREATE POLICY "admins_rh_all_ponto" ON registros_ponto
    FOR ALL TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM app_users
        WHERE auth_uid = auth.uid()
        AND role IN ('admin', 'rh', 'gestor')
      )
    )
    WITH CHECK (
      EXISTS (
        SELECT 1 FROM app_users
        WHERE auth_uid = auth.uid()
        AND role IN ('admin', 'rh', 'gestor')
      )
    )`,
  
  `CREATE POLICY "funcionarios_view_own_ponto" ON registros_ponto
    FOR SELECT TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM app_users
        WHERE auth_uid = auth.uid()
        AND colaborador_id = registros_ponto.colaborador_id
      )
    )`,
  
  `CREATE POLICY "funcionarios_insert_own_ponto" ON registros_ponto
    FOR INSERT TO authenticated
    WITH CHECK (
      EXISTS (
        SELECT 1 FROM app_users
        WHERE auth_uid = auth.uid()
        AND colaborador_id = registros_ponto.colaborador_id
      )
    )`,
  
  `CREATE POLICY "service_role_ponto" ON registros_ponto
    FOR ALL TO service_role
    USING (true)
    WITH CHECK (true)`,
  
  `ALTER TABLE registros_ponto ENABLE ROW LEVEL SECURITY`
]

async function executeFix() {
  console.log('🔧 Iniciando correção das políticas RLS de registros_ponto...\n')
  
  for (let i = 0; i < queries.length; i++) {
    const query = queries[i]
    const shortQuery = query.substring(0, 60).replace(/\n/g, ' ')
    
    try {
      const { error } = await supabase.rpc('exec_sql', { sql: query })
      
      if (error) {
        console.log(`❌ [${i + 1}/${queries.length}] Erro: ${shortQuery}...`)
        console.log(`   ${error.message}\n`)
      } else {
        console.log(`✅ [${i + 1}/${queries.length}] ${shortQuery}...`)
      }
    } catch (e) {
      console.log(`❌ [${i + 1}/${queries.length}] Exceção: ${shortQuery}...`)
      console.log(`   ${e.message}\n`)
    }
  }
  
  console.log('\n✅ Correção concluída!')
  console.log('📝 Verifique se o erro de ponto foi resolvido recarregando a página.')
}

executeFix().catch(console.error)
