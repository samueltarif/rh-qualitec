-- ============================================================================
-- CORREÇÃO URGENTE: Criar app_user para colaborador existente
-- Execute este SQL no Supabase SQL Editor
-- ============================================================================

-- 1. Primeiro, vamos identificar o colaborador mais recente
SELECT 
  id as colaborador_id,
  nome,
  email_corporativo,
  cpf,
  created_at
FROM colaboradores 
ORDER BY created_at DESC 
LIMIT 3;

-- 2. Verificar o usuário mais recente no Auth
SELECT 
  id as auth_uid,
  email,
  created_at,
  email_confirmed_at
FROM auth.users 
ORDER BY created_at DESC 
LIMIT 3;

-- 3. Verificar se já existe app_user para este auth_uid
-- (Substitua pelo auth_uid encontrado acima)
SELECT * FROM app_users WHERE auth_uid = 'a14fd827-f595-4b98-a1e3-ec69acce439f';

-- ============================================================================
-- CORREÇÃO: Criar app_user para o colaborador
-- (Execute após identificar os dados corretos)
-- ============================================================================

-- PASSO 1: Identifique o auth_uid do usuário (da query 2 acima)
-- PASSO 2: Identifique o colaborador_id (da query 1 acima)
-- PASSO 3: Execute o INSERT abaixo com os dados corretos

INSERT INTO app_users (
  auth_uid,
  email,
  nome,
  role,
  colaborador_id,
  ativo
) VALUES (
  'a14fd827-f595-4b98-a1e3-ec69acce439f', -- Substitua pelo auth_uid correto
  'email@exemplo.com',                      -- Email do usuário (mesmo do Auth)
  'Nome do Colaborador',                    -- Nome do colaborador
  'funcionario',                           -- Role sempre funcionario
  'ID_DO_COLABORADOR_AQUI',               -- ID do colaborador (da query 1)
  true                                     -- Ativo
);

-- ============================================================================
-- EXEMPLO PRÁTICO (ajuste os valores):
-- ============================================================================

/*
-- Se o colaborador mais recente for "João Silva" com ID "abc123"
-- E o usuário no Auth for "joao@empresa.com" com auth_uid "xyz789"
-- Execute:

INSERT INTO app_users (
  auth_uid,
  email,
  nome,
  role,
  colaborador_id,
  ativo
) VALUES (
  'xyz789',           -- auth_uid do Supabase Auth
  'joao@empresa.com', -- email do usuário
  'João Silva',       -- nome do colaborador
  'funcionario',      -- role
  'abc123',          -- ID do colaborador
  true               -- ativo
);
*/

-- ============================================================================
-- VERIFICAÇÃO FINAL
-- ============================================================================

-- Após executar o INSERT, verificar se funcionou:
SELECT 
  apu.id,
  apu.auth_uid,
  apu.email,
  apu.nome,
  apu.role,
  apu.colaborador_id,
  c.nome as colaborador_nome
FROM app_users apu
LEFT JOIN colaboradores c ON apu.colaborador_id = c.id
WHERE apu.auth_uid = 'a14fd827-f595-4b98-a1e3-ec69acce439f'; -- Substitua pelo auth_uid correto