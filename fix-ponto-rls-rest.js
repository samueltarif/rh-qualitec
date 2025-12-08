// Script para corrigir políticas RLS via REST API do Supabase
import 'dotenv/config'

const supabaseUrl = process.env.SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Erro: SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY não encontrados no .env')
  process.exit(1)
}

// Extrair project ref da URL
const projectRef = supabaseUrl.replace('https://', '').split('.')[0]

const sql = `
-- Remover políticas antigas
DROP POLICY IF EXISTS "funcionarios_view_own_ponto" ON registros_ponto;
DROP POLICY IF EXISTS "funcionarios_insert_own_ponto" ON registros_ponto;
DROP POLICY IF EXISTS "funcionarios_update_own_ponto" ON registros_ponto;
DROP POLICY IF EXISTS "admins_all_ponto" ON registros_ponto;
DROP POLICY IF EXISTS "service_role_ponto" ON registros_ponto;
DROP POLICY IF EXISTS "users_select_ponto" ON registros_ponto;
DROP POLICY IF EXISTS "users_insert_ponto" ON registros_ponto;
DROP POLICY IF EXISTS "users_update_ponto" ON registros_ponto;
DROP POLICY IF EXISTS "users_delete_ponto" ON registros_ponto;
DROP POLICY IF EXISTS "admins_rh_all_ponto" ON registros_ponto;

-- Criar políticas corretas
CREATE POLICY "admins_rh_all_ponto" ON registros_ponto
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
  );

CREATE POLICY "funcionarios_view_own_ponto" ON registros_ponto
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM app_users
      WHERE auth_uid = auth.uid()
      AND colaborador_id = registros_ponto.colaborador_id
    )
  );

CREATE POLICY "funcionarios_insert_own_ponto" ON registros_ponto
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM app_users
      WHERE auth_uid = auth.uid()
      AND colaborador_id = registros_ponto.colaborador_id
    )
  );

CREATE POLICY "service_role_ponto" ON registros_ponto
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);

ALTER TABLE registros_ponto ENABLE ROW LEVEL SECURITY;
`

console.log('🔧 Correção das políticas RLS de registros_ponto\n')
console.log('📋 SQL a ser executado:')
console.log('─'.repeat(60))
console.log(sql)
console.log('─'.repeat(60))
console.log('\n⚠️  ATENÇÃO: Execute este SQL manualmente no Supabase Dashboard')
console.log(`\n🔗 URL: https://supabase.com/dashboard/project/${projectRef}/sql/new`)
console.log('\n📝 Passos:')
console.log('   1. Acesse a URL acima')
console.log('   2. Cole o SQL mostrado acima')
console.log('   3. Clique em "Run"')
console.log('   4. Recarregue a página de Ponto no sistema\n')
