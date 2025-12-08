-- ============================================================================
-- CRIAR USUÁRIO DE TESTE PARA FUNCIONÁRIO
-- Execute no Supabase SQL Editor
-- ============================================================================

-- ============================================================================
-- OPÇÃO 1: RESETAR SENHA DE USUÁRIO EXISTENTE
-- ============================================================================
-- IMPORTANTE: Você precisa fazer isso pelo Supabase Dashboard:
-- 1. Vá em Authentication > Users
-- 2. Encontre o usuário funcionário
-- 3. Clique nos 3 pontinhos > "Send password reset email"
-- OU
-- 4. Clique nos 3 pontinhos > "Reset password" e defina uma nova senha

-- ============================================================================
-- OPÇÃO 2: CRIAR NOVO USUÁRIO FUNCIONÁRIO DE TESTE
-- ============================================================================

-- Passo 1: Primeiro, veja qual colaborador existe
SELECT id, nome, email_corporativo, cpf FROM colaboradores WHERE status = 'Ativo' LIMIT 5;

-- Passo 2: Anote o ID do colaborador que você quer vincular

-- Passo 3: Criar usuário no Supabase Auth (FAÇA ISSO NO DASHBOARD)
-- Vá em Authentication > Users > Add User
-- Email: funcionario@qualitec.ind.br
-- Password: teste123 (ou a senha que você quiser)
-- Marque "Auto Confirm User"

-- Passo 4: Depois de criar no Dashboard, pegue o auth_uid e execute:
-- SUBSTITUA OS VALORES ABAIXO:

/*
INSERT INTO app_users (
  auth_uid,
  email,
  nome,
  role,
  colaborador_id,
  ativo
) VALUES (
  'COLE_AQUI_O_AUTH_UID_DO_USUARIO_CRIADO', -- Pegue do Dashboard
  'funcionario@qualitec.ind.br',
  'Funcionário Teste',
  'funcionario',
  'COLE_AQUI_O_ID_DO_COLABORADOR', -- Do SELECT acima
  true
);
*/

-- ============================================================================
-- OPÇÃO 3: SCRIPT COMPLETO PARA CRIAR USUÁRIO + COLABORADOR
-- ============================================================================

-- 3.1: Criar colaborador de teste (se não existir)
/*
INSERT INTO colaboradores (
  empresa_id,
  nome,
  cpf,
  data_nascimento,
  data_admissao,
  salario,
  tipo_contrato,
  status,
  email_corporativo
) VALUES (
  (SELECT id FROM empresas LIMIT 1), -- Pega primeira empresa
  'João Silva',
  '123.456.789-00',
  '1990-01-01',
  '2024-01-01',
  3000.00,
  'CLT',
  'Ativo',
  'joao.silva@qualitec.ind.br'
) RETURNING id;
*/

-- 3.2: Anote o ID retornado acima

-- 3.3: Vá no Supabase Dashboard > Authentication > Users > Add User
-- Email: joao.silva@qualitec.ind.br
-- Password: teste123
-- Auto Confirm: SIM

-- 3.4: Pegue o auth_uid do usuário criado e execute:
/*
INSERT INTO app_users (
  auth_uid,
  email,
  nome,
  role,
  colaborador_id,
  ativo
) VALUES (
  'AUTH_UID_AQUI',
  'joao.silva@qualitec.ind.br',
  'João Silva',
  'funcionario',
  'ID_DO_COLABORADOR_AQUI',
  true
);
*/

-- ============================================================================
-- CREDENCIAIS DE TESTE SUGERIDAS
-- ============================================================================
-- Email: funcionario@qualitec.ind.br
-- Senha: teste123
-- 
-- OU
-- 
-- Email: joao.silva@qualitec.ind.br
-- Senha: teste123
-- ============================================================================

-- ============================================================================
-- VERIFICAR SE DEU CERTO
-- ============================================================================
SELECT 
  au.email,
  au.nome,
  au.role,
  c.nome as colaborador_nome,
  c.email_corporativo
FROM app_users au
LEFT JOIN colaboradores c ON au.colaborador_id = c.id
WHERE au.role = 'funcionario';
