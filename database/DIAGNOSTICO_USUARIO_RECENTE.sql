-- ============================================================================
-- DIAGNÓSTICO URGENTE: Usuário recém-criado não encontrado
-- Execute este SQL no Supabase SQL Editor
-- ============================================================================

-- 1. Verificar o usuário mais recente no Auth (último criado)
SELECT 
  id as auth_uid,
  email,
  created_at,
  email_confirmed_at,
  user_metadata
FROM auth.users 
ORDER BY created_at DESC 
LIMIT 3;

-- 2. Verificar se este usuário existe em app_users
-- (Substitua o auth_uid pelo ID encontrado acima)
SELECT 
  id,
  auth_uid,
  email,
  nome,
  role,
  ativo,
  colaborador_id
FROM app_users 
WHERE auth_uid = 'a14fd827-f595-4b98-a1e3-ec69acce439f';

-- 3. Se não encontrou, verificar todos os app_users recentes
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

-- 4. Verificar colaboradores recentes
SELECT 
  id,
  nome,
  cpf,
  email_corporativo,
  created_at
FROM colaboradores 
ORDER BY created_at DESC 
LIMIT 3;

-- ============================================================================
-- CORREÇÃO RÁPIDA: Criar app_user para o usuário órfão
-- (Execute apenas após identificar o auth_uid correto)
-- ============================================================================

-- PASSO 1: Identifique o auth_uid do usuário que não consegue logar
-- PASSO 2: Identifique o colaborador_id correspondente (se houver)
-- PASSO 3: Execute o INSERT abaixo com os dados corretos

/*
INSERT INTO app_users (
  auth_uid,
  email,
  nome,
  role,
  colaborador_id,
  ativo
) VALUES (
  'a14fd827-f595-4b98-a1e3-ec69acce439f', -- Substitua pelo auth_uid correto
  'email@exemplo.com',                      -- Email do usuário
  'Nome do Usuario',                        -- Nome do usuário
  'funcionario',                           -- Role (funcionario ou admin)
  NULL,                                    -- ID do colaborador (se houver)
  true                                     -- Ativo
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
  apu.ativo,
  c.nome as colaborador_nome
FROM app_users apu
LEFT JOIN colaboradores c ON apu.colaborador_id = c.id
WHERE apu.auth_uid = 'a14fd827-f595-4b98-a1e3-ec69acce439f';