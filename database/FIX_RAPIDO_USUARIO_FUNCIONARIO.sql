-- ============================================================================
-- CORREÇÃO RÁPIDA: Criar app_user para funcionário
-- Execute este SQL no Supabase SQL Editor
-- ============================================================================

-- 1. Ver usuários mais recentes no Auth
SELECT 
  id as auth_uid,
  email,
  created_at
FROM auth.users 
ORDER BY created_at DESC 
LIMIT 5;

-- 2. Ver colaboradores mais recentes
SELECT 
  id as colaborador_id,
  nome,
  email_corporativo,
  cpf,
  created_at
FROM colaboradores 
ORDER BY created_at DESC 
LIMIT 5;

-- 3. Ver app_users existentes
SELECT 
  id,
  auth_uid,
  email,
  nome,
  colaborador_id
FROM app_users 
ORDER BY created_at DESC 
LIMIT 5;

-- ============================================================================
-- CORREÇÃO: Execute com os dados corretos
-- ============================================================================

-- Substitua os valores abaixo pelos dados reais:
-- auth_uid: do resultado da query 1
-- email: email do usuário
-- nome: nome do colaborador
-- colaborador_id: ID do colaborador (se houver)

INSERT INTO app_users (
  auth_uid,
  email,
  nome,
  role,
  colaborador_id,
  ativo
) VALUES (
  'a14fd827-f595-4b98-a1e3-ec69acce439f', -- Substitua pelo auth_uid correto
  'usuario@exemplo.com',                    -- Email do usuário
  'Nome do Usuario',                        -- Nome do usuário
  'funcionario',                           -- Role
  NULL,                                    -- ID do colaborador (ou NULL)
  true                                     -- Ativo
);

-- ============================================================================
-- VERIFICAÇÃO
-- ============================================================================

-- Verificar se funcionou:
SELECT 
  apu.*,
  c.nome as colaborador_nome
FROM app_users apu
LEFT JOIN colaboradores c ON apu.colaborador_id = c.id
WHERE apu.auth_uid = 'a14fd827-f595-4b98-a1e3-ec69acce439f'; -- Substitua pelo auth_uid