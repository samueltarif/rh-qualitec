-- =====================================================
-- VER SITUAÇÃO COMPLETA DO SISTEMA
-- =====================================================

-- 1. Quantos colaboradores existem?
SELECT 
  '👥 COLABORADORES' as tabela,
  COUNT(*) as total
FROM colaboradores;

-- 2. Quantos usuários existem?
SELECT 
  '🔐 APP_USERS' as tabela,
  COUNT(*) as total
FROM app_users;

-- 3. Quantos colaboradores TÊM usuário vinculado?
SELECT 
  '✅ COLABORADORES COM USUÁRIO' as situacao,
  COUNT(*) as total
FROM colaboradores c
INNER JOIN app_users au ON c.id = au.id;

-- 4. Quantos colaboradores NÃO TÊM usuário vinculado?
SELECT 
  '⚠️ COLABORADORES SEM USUÁRIO' as situacao,
  COUNT(*) as total
FROM colaboradores c
LEFT JOIN app_users au ON c.id = au.id
WHERE au.id IS NULL;

-- 5. Ver os colaboradores sem usuário
SELECT 
  c.id,
  c.nome,
  c.email,
  '❌ SEM ACESSO AO SISTEMA' as status
FROM colaboradores c
LEFT JOIN app_users au ON c.id = au.id
WHERE au.id IS NULL
ORDER BY c.nome
LIMIT 10;
