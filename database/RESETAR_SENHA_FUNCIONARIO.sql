-- ============================================================================
-- RESETAR SENHA DO FUNCIONÁRIO PELO SQL
-- Execute no Supabase SQL Editor
-- ============================================================================

-- IMPORTANTE: Você precisa usar a API do Supabase para resetar senha
-- O SQL não pode alterar senhas diretamente por segurança

-- ============================================================================
-- SOLUÇÃO: Criar um novo usuário de teste com senha conhecida
-- ============================================================================

-- Passo 1: Ver o email do funcionário atual
SELECT email, nome FROM app_users WHERE role = 'funcionario';

-- Resultado esperado: vendas2@qualitec.ind.br (Samuel)

-- ============================================================================
-- OPÇÃO MAIS FÁCIL: Usar a página /users do sistema
-- ============================================================================

-- 1. Faça login como Admin (silvana@qualitec.ind.br / qualitec25)
-- 2. Vá em /users
-- 3. Crie um novo usuário funcionário:
--    - Email: teste@qualitec.ind.br
--    - Senha: teste123
--    - Nome: Funcionário Teste
--    - Role: funcionario
-- 4. Vincule ao colaborador Samuel

-- ============================================================================
-- OU: Deletar o usuário atual e criar novo
-- ============================================================================

-- CUIDADO: Isso vai deletar o usuário do Samuel!
-- Só faça se tiver certeza

/*
-- 1. Deletar de app_users
DELETE FROM app_users WHERE email = 'vendas2@qualitec.ind.br';

-- 2. Deletar do auth.users (precisa ser feito no Dashboard)
-- Vá em Authentication > Users > Clique no usuário > Delete User

-- 3. Criar novo usuário no Dashboard:
-- Authentication > Users > Add User
-- Email: vendas2@qualitec.ind.br
-- Password: teste123
-- Auto Confirm: SIM

-- 4. Pegar o auth_uid do novo usuário e executar:
INSERT INTO app_users (
  auth_uid,
  email,
  nome,
  role,
  colaborador_id,
  ativo
) VALUES (
  'COLE_AUTH_UID_AQUI',
  'vendas2@qualitec.ind.br',
  'SAMUEL BARRETOS TARIF',
  'funcionario',
  '616f-4709-9069-54cfd46d6a38',
  true
);
*/

-- ============================================================================
-- SOLUÇÃO MAIS SIMPLES: Criar usuário teste@qualitec.ind.br
-- ============================================================================

-- 1. No Dashboard: Authentication > Users > Add User
--    Email: teste@qualitec.ind.br
--    Password: teste123
--    Auto Confirm: SIM

-- 2. Copiar o auth_uid do usuário criado

-- 3. Executar este SQL (SUBSTITUA O AUTH_UID):
/*
INSERT INTO app_users (
  auth_uid,
  email,
  nome,
  role,
  colaborador_id,
  ativo
) VALUES (
  'COLE_O_AUTH_UID_AQUI',
  'teste@qualitec.ind.br',
  'Funcionário Teste',
  'funcionario',
  '616f-4709-9069-54cfd46d6a38', -- ID do Samuel
  true
);
*/

-- ============================================================================
-- VERIFICAR
-- ============================================================================
SELECT 
  au.email,
  au.nome,
  au.role,
  c.nome as colaborador_nome
FROM app_users au
LEFT JOIN colaboradores c ON au.colaborador_id = c.id
WHERE au.role = 'funcionario';

-- ============================================================================
-- CREDENCIAIS FINAIS
-- ============================================================================
-- Email: teste@qualitec.ind.br
-- Senha: teste123
-- ============================================================================
