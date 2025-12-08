-- ============================================================================
-- VERIFICAR: Usuário atual e configuração
-- ============================================================================

-- 1. Ver SEU usuário atual (quem está logado)
SELECT 
  '1️⃣ MEU USUÁRIO' as secao,
  id,
  auth_uid,
  email,
  role,
  ativo,
  created_at
FROM app_users 
WHERE auth_uid = auth.uid();

-- 2. Ver TODOS os usuários admin
SELECT 
  '2️⃣ TODOS OS ADMINS' as secao,
  id,
  auth_uid,
  email,
  role,
  ativo
FROM app_users 
WHERE role = 'admin'
ORDER BY created_at DESC;

-- 3. Ver RLS da tabela holerites
SELECT 
  '3️⃣ RLS HOLERITES' as secao,
  tablename::text as tabela,
  CASE WHEN rowsecurity THEN '✅ HABILITADO' ELSE '❌ DESABILITADO' END as status
FROM pg_tables 
WHERE tablename = 'holerites';

-- 4. Ver políticas RLS
SELECT 
  '4️⃣ POLÍTICAS' as secao,
  policyname as politica,
  cmd::text as comando,
  CASE WHEN permissive = 'PERMISSIVE' THEN '✅ PERMISSIVA' ELSE '❌ RESTRITIVA' END as tipo
FROM pg_policies 
WHERE tablename = 'holerites'
ORDER BY policyname;

-- ============================================================================
-- RESULTADO ESPERADO:
-- ============================================================================
-- Seção 1: Deve mostrar SEU usuário com role='admin' e ativo=true
-- Seção 2: Deve listar todos os admins (incluindo você)
-- Seção 3: Deve mostrar '✅ HABILITADO'
-- Seção 4: Deve mostrar pelo menos a política 'admin_all_holerites'
-- ============================================================================
