-- ============================================================================
-- DEBUG: Verificar usuário para geração de holerites
-- ============================================================================

-- 1. Ver todos os usuários do sistema
SELECT 
  id,
  auth_uid,
  email,
  role,
  nome,
  ativo,
  created_at
FROM app_users
ORDER BY created_at DESC;

-- 2. Ver usuários admin
SELECT 
  id,
  auth_uid,
  email,
  role,
  nome
FROM app_users
WHERE role = 'admin';

-- 3. Ver estrutura da tabela app_users
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'app_users'
ORDER BY ordinal_position;

-- 4. Verificar políticas RLS da tabela holerites
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'holerites';

-- 5. Verificar se RLS está habilitado
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE tablename = 'holerites';

-- ============================================================================
-- INSTRUÇÕES:
-- ============================================================================
-- 1. Execute este script no Supabase SQL Editor
-- 2. Copie o auth_uid do seu usuário admin
-- 3. Verifique se o role está como 'admin'
-- 4. Se não houver usuário admin, execute o script abaixo
-- ============================================================================

-- CRIAR USUÁRIO ADMIN (se necessário)
-- Substitua 'SEU_AUTH_UID_AQUI' pelo auth.uid() do Supabase Auth
/*
INSERT INTO app_users (auth_uid, email, role, nome, ativo)
VALUES (
  'SEU_AUTH_UID_AQUI',
  'admin@qualitec.com',
  'admin',
  'Administrador',
  true
)
ON CONFLICT (auth_uid) 
DO UPDATE SET 
  role = 'admin',
  ativo = true;
*/
