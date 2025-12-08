-- ============================================================================
-- DESCOBRIR: Qual auth_uid está sendo usado
-- ============================================================================

-- 1. Ver TODOS os usuários da tabela app_users
SELECT 
  '📋 TODOS OS USUÁRIOS' as info,
  id,
  auth_uid,
  email,
  role,
  ativo
FROM app_users
ORDER BY created_at DESC;

-- 2. Ver TODOS os usuários do Supabase Auth
SELECT 
  '🔐 USUÁRIOS SUPABASE AUTH' as info,
  id as auth_uid,
  email,
  created_at
FROM auth.users
ORDER BY created_at DESC;

-- 3. Comparar: quais auth_uid do Supabase NÃO estão na app_users
SELECT 
  '❌ AUTH SEM APP_USER' as info,
  au.id as auth_uid,
  au.email,
  'FALTA CRIAR' as status
FROM auth.users au
LEFT JOIN app_users ap ON ap.auth_uid = au.id
WHERE ap.id IS NULL;

-- 4. Ver o auth_uid do usuário ATUAL (você logado agora)
SELECT 
  '👤 VOCÊ AGORA' as info,
  auth.uid() as seu_auth_uid,
  auth.email() as seu_email;

-- ============================================================================
-- INSTRUÇÕES:
-- ============================================================================
-- Execute este script e me envie TODOS os resultados
-- Vamos descobrir qual auth_uid usar para criar seu usuário admin
-- ============================================================================
