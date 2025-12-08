-- ============================================================================
-- VERIFICAR AUTENTICAÇÃO E SESSÃO
-- Execute no Supabase SQL Editor
-- ============================================================================

-- 1. Ver todos os usuários do auth.users
SELECT 
  id as auth_uid,
  email,
  created_at,
  last_sign_in_at,
  email_confirmed_at
FROM auth.users
ORDER BY created_at DESC;

-- 2. Ver usuários em app_users e seus vínculos com auth
SELECT 
  au.id as auth_uid,
  au.email as auth_email,
  u.id as app_user_id,
  u.role,
  u.colaborador_id,
  c.nome as colaborador_nome
FROM auth.users au
LEFT JOIN app_users u ON u.auth_uid = au.id
LEFT JOIN colaboradores c ON c.id = u.colaborador_id
ORDER BY au.created_at DESC;

-- 3. Usuários do auth SEM registro em app_users (PROBLEMA!)
SELECT 
  au.id as auth_uid,
  au.email
FROM auth.users au
WHERE NOT EXISTS (
  SELECT 1 FROM app_users WHERE auth_uid = au.id
);

-- 4. Criar registros faltantes em app_users
-- ATENÇÃO: Só execute se houver usuários sem registro!
-- Descomente as linhas abaixo se necessário:

/*
INSERT INTO app_users (auth_uid, role)
SELECT 
  au.id,
  'admin' -- ou 'funcionario' dependendo do usuário
FROM auth.users au
WHERE NOT EXISTS (
  SELECT 1 FROM app_users WHERE auth_uid = au.id
)
RETURNING *;
*/

-- 5. Verificar sessões ativas (se disponível)
-- Nota: Esta tabela pode não existir em todas as versões do Supabase
SELECT 
  user_id,
  created_at,
  updated_at
FROM auth.sessions
WHERE user_id IN (SELECT id FROM auth.users)
ORDER BY updated_at DESC
LIMIT 10;
