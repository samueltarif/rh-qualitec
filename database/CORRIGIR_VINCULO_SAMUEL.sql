-- ============================================================================
-- CORRIGIR VÍNCULO DO SAMUEL
-- Execute no Supabase SQL Editor
-- ============================================================================

-- Passo 1: Ver o estado atual
SELECT 
  au.id as app_user_id,
  au.email as app_user_email,
  au.colaborador_id,
  c.id as colaborador_id_real,
  c.nome as colaborador_nome,
  c.email_corporativo
FROM app_users au
LEFT JOIN colaboradores c ON au.colaborador_id = c.id
WHERE au.email LIKE '%samuel%' OR au.email LIKE '%vendas2%';


-- Passo 3: Atualizar o vínculo (SUBSTITUA O ID SE NECESSÁRIO)
-- IMPORTANTE: Execute primeiro o Passo 2 para obter o ID correto do colaborador
-- Depois substitua o UUID abaixo pelo ID correto que você encontrou
UPDATE app_users 
SET colaborador_id = '84165a85-616f-4709-9069-54cfd46d6a38'
WHERE email = 'samuel.tarif@gmail.com';

-- Passo 4: Verificar se funcionou
SELECT 
  au.email,
  au.nome,
  au.role,
  au.colaborador_id,
  c.nome as colaborador_nome,
  c.email_corporativo,
  c.cpf,
  c.matricula
FROM app_users au
LEFT JOIN colaboradores c ON au.colaborador_id = c.id
WHERE au.email = 'samuel.tarif@gmail.com';

-- ============================================================================
-- RESULTADO ESPERADO:
-- ============================================================================
-- Deve mostrar:
-- email: samuel.tarif@gmail.com
-- nome: SAMUEL BARRETOS TARIF
-- role: funcionario
-- colaborador_id: (o UUID completo do colaborador)
-- colaborador_nome: SAMUEL BARRETOS TARIF
-- email_corporativo: vendas2@qualitec.ind.br
-- cpf: 43396431812
-- matricula: 05
-- ============================================================================

-- ============================================================================
-- CREDENCIAIS PARA LOGIN:
-- ============================================================================
-- Email: samuel.tarif@gmail.com
-- Senha: (a que você definiu no campo "Nova Senha")
-- ============================================================================
