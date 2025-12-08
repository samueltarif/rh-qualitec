-- ============================================
-- FIX: SILVANA SEM PERMISSÃO (403) PARA APROVAR
-- ============================================

-- PASSO 1: VERIFICAR DADOS DA SILVANA
SELECT 
  'USUÁRIO SILVANA' AS tipo,
  u.id AS user_id,
  u.auth_uid,
  u.nome,
  u.email,
  u.role,
  u.ativo,
  u.colaborador_id
FROM app_users u
WHERE LOWER(u.email) = 'silvana@qualitec.ind.br';

-- PASSO 2: VERIFICAR AUTH_UID NO SUPABASE AUTH
-- Este é o ID que vem do Supabase Auth quando faz login
SELECT 
  'AUTH USERS' AS tipo,
  id AS auth_id,
  email,
  created_at
FROM auth.users
WHERE LOWER(email) = 'silvana@qualitec.ind.br';

-- PASSO 3: VERIFICAR SE AUTH_UID ESTÁ CORRETO
-- O auth_uid em app_users DEVE ser igual ao id em auth.users
SELECT 
  'COMPARAÇÃO' AS tipo,
  au.id AS auth_id,
  u.auth_uid AS app_user_auth_uid,
  CASE 
    WHEN au.id = u.auth_uid THEN '✅ Correto'
    WHEN u.auth_uid IS NULL THEN '❌ auth_uid NULL'
    ELSE '❌ auth_uid diferente'
  END AS status
FROM auth.users au
LEFT JOIN app_users u ON au.id = u.auth_uid
WHERE LOWER(au.email) = 'silvana@qualitec.ind.br';

-- PASSO 4: CORRIGIR AUTH_UID (se necessário)
-- Atualizar auth_uid do app_users com o ID correto do auth.users
UPDATE app_users
SET auth_uid = (
  SELECT id 
  FROM auth.users 
  WHERE LOWER(email) = 'silvana@qualitec.ind.br'
  LIMIT 1
),
updated_at = NOW()
WHERE LOWER(email) = 'silvana@qualitec.ind.br'
  AND (
    auth_uid IS NULL 
    OR auth_uid != (SELECT id FROM auth.users WHERE LOWER(email) = 'silvana@qualitec.ind.br')
  );

-- PASSO 5: VERIFICAR ROLE
-- Garantir que Silvana é admin
UPDATE app_users
SET role = 'admin',
    updated_at = NOW()
WHERE LOWER(email) = 'silvana@qualitec.ind.br'
  AND role != 'admin';

-- PASSO 6: GARANTIR QUE ESTÁ ATIVO
UPDATE app_users
SET ativo = true,
    updated_at = NOW()
WHERE LOWER(email) = 'silvana@qualitec.ind.br'
  AND ativo = false;

-- PASSO 7: VERIFICAR RESULTADO FINAL
SELECT 
  'RESULTADO FINAL' AS tipo,
  u.id,
  u.auth_uid,
  u.nome,
  u.email,
  u.role,
  u.ativo,
  u.colaborador_id,
  au.id AS auth_id_correto,
  CASE 
    WHEN u.auth_uid = au.id THEN '✅ auth_uid correto'
    ELSE '❌ auth_uid ainda incorreto'
  END AS status_auth,
  CASE 
    WHEN u.role = 'admin' THEN '✅ É admin'
    ELSE '❌ Não é admin'
  END AS status_role,
  CASE 
    WHEN u.ativo = true THEN '✅ Ativo'
    ELSE '❌ Inativo'
  END AS status_ativo
FROM app_users u
LEFT JOIN auth.users au ON LOWER(au.email) = LOWER(u.email)
WHERE LOWER(u.email) = 'silvana@qualitec.ind.br';

-- PASSO 8: VERIFICAR POLÍTICAS RLS DA TABELA
-- Ver se há políticas que podem estar bloqueando
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
WHERE tablename = 'solicitacoes_alteracao_dados'
ORDER BY policyname;
