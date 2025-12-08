-- ============================================================================
-- FIX COMPLETO: Holerites 403
-- ============================================================================

-- PASSO 1: Verificar constraint problemática
SELECT 
  conname as constraint_name,
  pg_get_constraintdef(oid) as definition
FROM pg_constraint
WHERE conrelid = 'app_users'::regclass
  AND conname LIKE '%email%';

-- PASSO 2: Remover constraint problemática (se existir)
ALTER TABLE app_users DROP CONSTRAINT IF EXISTS chk_admin_email;

-- PASSO 3: Criar/atualizar usuário admin SEM a constraint
INSERT INTO app_users (auth_uid, email, role, nome, ativo)
VALUES (
  auth.uid(),
  COALESCE(auth.email(), 'admin@qualitec.com'),
  'admin',
  'Administrador',
  true
)
ON CONFLICT (auth_uid) 
DO UPDATE SET 
  role = 'admin',
  ativo = true,
  updated_at = NOW();

-- PASSO 4: HABILITAR RLS na tabela holerites
ALTER TABLE holerites ENABLE ROW LEVEL SECURITY;

-- PASSO 5: Recriar políticas RLS
DROP POLICY IF EXISTS "admin_all_holerites" ON holerites;
DROP POLICY IF EXISTS "funcionario_own_holerites" ON holerites;

-- Admin: todas as operações
CREATE POLICY "admin_all_holerites"
  ON holerites
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM app_users
      WHERE app_users.auth_uid = auth.uid()
      AND app_users.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM app_users
      WHERE app_users.auth_uid = auth.uid()
      AND app_users.role = 'admin'
    )
  );

-- Funcionário: ver apenas seus holerites
CREATE POLICY "funcionario_own_holerites"
  ON holerites
  FOR SELECT
  TO authenticated
  USING (
    colaborador_id IN (
      SELECT c.id 
      FROM colaboradores c
      JOIN app_users u ON u.id = c.user_id
      WHERE u.auth_uid = auth.uid()
      AND u.role = 'funcionario'
    )
  );

-- PASSO 6: Confirmar tudo
SELECT 
  '✅ USUÁRIO' as tipo,
  email,
  role,
  ativo
FROM app_users 
WHERE auth_uid = auth.uid()

UNION ALL

SELECT 
  '✅ RLS HOLERITES' as tipo,
  tablename::text as email,
  CASE WHEN rowsecurity THEN 'HABILITADO' ELSE 'DESABILITADO' END as role,
  NULL as ativo
FROM pg_tables 
WHERE tablename = 'holerites';

-- PASSO 7: Ver políticas criadas
SELECT 
  '✅ POLÍTICA' as tipo,
  policyname as email,
  cmd::text as role,
  NULL as ativo
FROM pg_policies 
WHERE tablename = 'holerites';
