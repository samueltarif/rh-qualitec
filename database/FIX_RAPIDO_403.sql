-- ============================================================================
-- FIX RÁPIDO: Erro 403 Holerites
-- ============================================================================
-- Execute linha por linha no Supabase SQL Editor
-- ============================================================================

-- 1. Remover constraint problemática
ALTER TABLE app_users DROP CONSTRAINT IF EXISTS chk_admin_email;

-- 2. Atualizar seu usuário para admin (usando UPDATE em vez de INSERT)
UPDATE app_users
SET 
  role = 'admin',
  ativo = true,
  updated_at = NOW()
WHERE auth_uid = auth.uid();

-- 3. Se não existir, criar (execute só se o UPDATE acima retornou 0 linhas)
-- INSERT INTO app_users (auth_uid, email, role, nome, ativo)
-- SELECT auth.uid(), auth.email(), 'admin', 'Administrador', true
-- WHERE NOT EXISTS (SELECT 1 FROM app_users WHERE auth_uid = auth.uid());

-- 4. Habilitar RLS na tabela holerites
ALTER TABLE holerites ENABLE ROW LEVEL SECURITY;

-- 5. Recriar política admin
DROP POLICY IF EXISTS "admin_all_holerites" ON holerites;

CREATE POLICY "admin_all_holerites"
  ON holerites
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM app_users
      WHERE app_users.auth_uid = auth.uid()
      AND app_users.role = 'admin'
      AND app_users.ativo = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM app_users
      WHERE app_users.auth_uid = auth.uid()
      AND app_users.role = 'admin'
      AND app_users.ativo = true
    )
  );

-- 6. Confirmar
SELECT 
  'Seu usuário:' as info,
  email,
  role,
  ativo
FROM app_users 
WHERE auth_uid = auth.uid();

SELECT 
  'RLS Holerites:' as info,
  CASE WHEN rowsecurity THEN 'HABILITADO ✅' ELSE 'DESABILITADO ❌' END as status
FROM pg_tables 
WHERE tablename = 'holerites';
