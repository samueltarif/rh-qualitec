-- ============================================================================
-- CONSULTAR USUÁRIOS CADASTRADOS
-- Execute no Supabase SQL Editor
-- ============================================================================

-- Ver todos os usuários em app_users
SELECT 
  id,
  email,
  nome,
  role,
  ativo,
  colaborador_id,
  created_at
FROM app_users
ORDER BY created_at DESC;

-- Ver usuários no Supabase Auth (auth.users)
-- NOTA: Senhas são criptografadas, não é possível ver a senha original
SELECT 
  id as auth_uid,
  email,
  created_at,
  last_sign_in_at,
  email_confirmed_at
FROM auth.users
ORDER BY created_at DESC;

-- Ver relação entre app_users e auth.users
SELECT 
  au.email,
  au.nome,
  au.role,
  au.ativo,
  u.email_confirmed_at,
  u.last_sign_in_at
FROM app_users au
LEFT JOIN auth.users u ON au.auth_uid = u.id
ORDER BY au.created_at DESC;

-- Ver colaboradores cadastrados
SELECT 
  id,
  nome,
  cpf,
  email_corporativo,
  matricula,
  status,
  data_admissao
FROM colaboradores
ORDER BY created_at DESC;

-- ============================================================================
-- IMPORTANTE: SENHAS
-- ============================================================================
-- As senhas no Supabase são criptografadas e NÃO podem ser visualizadas.
-- Você só pode:
-- 1. Resetar a senha do usuário
-- 2. Criar um novo usuário com senha conhecida
-- ============================================================================
