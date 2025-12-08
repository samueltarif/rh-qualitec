-- ============================================
-- DEBUG: DESCOBRIR PROBLEMA DA SILVANA
-- ============================================

-- 1. VER DADOS COMPLETOS DA SILVANA
SELECT 
  '1. DADOS APP_USERS' AS passo,
  u.id,
  u.auth_uid,
  u.nome,
  u.email,
  u.role,
  u.ativo,
  u.colaborador_id
FROM app_users u
WHERE LOWER(u.email) = 'silvana@qualitec.ind.br';

-- 2. VER AUTH_UID DO SUPABASE AUTH
SELECT 
  '2. DADOS AUTH.USERS' AS passo,
  id AS auth_id,
  email,
  created_at
FROM auth.users
WHERE LOWER(email) = 'silvana@qualitec.ind.br';

-- 3. COMPARAR (DEVEM SER IGUAIS!)
SELECT 
  '3. COMPARAÇÃO' AS passo,
  au.id AS auth_id_correto,
  u.auth_uid AS auth_uid_app_users,
  CASE 
    WHEN au.id = u.auth_uid THEN '✅ IGUAIS (BOM)'
    ELSE '❌ DIFERENTES (PROBLEMA!)'
  END AS status
FROM auth.users au
LEFT JOIN app_users u ON LOWER(au.email) = LOWER(u.email)
WHERE LOWER(au.email) = 'silvana@qualitec.ind.br';

-- 4. VER SE CONSEGUE BUSCAR PELO AUTH_UID
-- (Isso é o que a API faz)
SELECT 
  '4. BUSCA POR AUTH_UID' AS passo,
  u.id,
  u.nome,
  u.email,
  u.role
FROM app_users u
WHERE u.auth_uid = (
  SELECT id FROM auth.users WHERE LOWER(email) = 'silvana@qualitec.ind.br'
);

-- ============================================
-- EXECUTE E ME MOSTRE OS 4 RESULTADOS!
-- ============================================
