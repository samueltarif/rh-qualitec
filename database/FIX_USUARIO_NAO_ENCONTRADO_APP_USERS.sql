-- ============================================================================
-- DIAGNÓSTICO: Usuário não encontrado na tabela app_users
-- Execute este SQL no Supabase SQL Editor
-- ============================================================================

-- 1. Verificar usuários no Supabase Auth (últimos 5)
SELECT 
  id as auth_uid,
  email,
  created_at,
  email_confirmed_at,
  last_sign_in_at
FROM auth.users 
ORDER BY created_at DESC 
LIMIT 5;

-- 2. Verificar usuários na tabela app_users
SELECT 
  id,
  auth_uid,
  email,
  nome,
  role,
  ativo,
  colaborador_id,
  created_at
FROM app_users 
ORDER BY created_at DESC 
LIMIT 5;

-- 3. Verificar se há usuários no Auth que não estão em app_users
SELECT 
  au.id as auth_uid,
  au.email as auth_email,
  au.created_at as auth_created_at,
  apu.id as app_user_id,
  apu.email as app_user_email
FROM auth.users au
LEFT JOIN app_users apu ON au.id = apu.auth_uid
WHERE apu.id IS NULL
ORDER BY au.created_at DESC
LIMIT 10;

-- 4. Verificar colaboradores sem usuário vinculado
SELECT 
  c.id as colaborador_id,
  c.nome,
  c.email_corporativo,
  c.created_at,
  apu.id as app_user_id,
  apu.email as app_user_email
FROM colaboradores c
LEFT JOIN app_users apu ON c.id = apu.colaborador_id
WHERE apu.id IS NULL
ORDER BY c.created_at DESC
LIMIT 10;

-- ============================================================================
-- CORREÇÃO: Criar registro em app_users para usuário órfão
-- (Execute apenas se identificar o problema)
-- ============================================================================

-- Exemplo: Se você identificou um auth_uid que não tem app_user, execute:
/*
INSERT INTO app_users (
  auth_uid,
  email,
  nome,
  role,
  colaborador_id,
  ativo
) VALUES (
  'COLE_AQUI_O_AUTH_UID_DO_USUARIO',
  'email@exemplo.com',
  'Nome do Usuario',
  'funcionario',
  'COLE_AQUI_O_ID_DO_COLABORADOR_SE_HOUVER',
  true
);
*/

-- ============================================================================
-- VERIFICAÇÃO FINAL
-- ============================================================================

-- Verificar se o usuário agora aparece corretamente
SELECT 
  apu.*,
  c.nome as colaborador_nome
FROM app_users apu
LEFT JOIN colaboradores c ON apu.colaborador_id = c.id
WHERE apu.auth_uid = 'COLE_AQUI_O_AUTH_UID_PARA_VERIFICAR';