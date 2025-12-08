-- ============================================================================
-- CORREÇÃO DEFINITIVA DO SAMUEL
-- Execute TUDO de uma vez no Supabase SQL Editor
-- ============================================================================

-- PASSO 1: Ver o que temos
SELECT 'APP_USERS:' as tabela;
SELECT id, auth_uid, email, nome, colaborador_id, role
FROM app_users WHERE email LIKE '%samuel%';

SELECT 'COLABORADORES:' as tabela;
SELECT id, nome, email_corporativo, cpf FROM colaboradores 
WHERE nome ILIKE '%samuel%' OR email_corporativo ILIKE '%vendas2%';

-- PASSO 2: Atualizar o colaborador_id no app_users
-- (usando o ID que você informou: 84165a85-616f-4709-9069-54cfd46d6a38)
UPDATE app_users 
SET colaborador_id = '84165a85-616f-4709-9069-54cfd46d6a38'
WHERE email = 'samuel.tarif@gmail.com'
  AND (colaborador_id IS NULL OR colaborador_id != '84165a85-616f-4709-9069-54cfd46d6a38');

-- PASSO 3: Verificar se o colaborador existe
SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM colaboradores WHERE id = '84165a85-616f-4709-9069-54cfd46d6a38')
    THEN '✅ Colaborador EXISTE'
    ELSE '❌ Colaborador NÃO EXISTE - precisa criar!'
  END as status_colaborador;

-- PASSO 4: Verificar resultado final
SELECT 
  au.email,
  au.colaborador_id,
  c.id as colab_id,
  c.nome as colab_nome,
  c.cpf,
  CASE WHEN c.id IS NOT NULL THEN '✅ VINCULADO' ELSE '❌ NÃO VINCULADO' END as status
FROM app_users au
LEFT JOIN colaboradores c ON au.colaborador_id = c.id
WHERE au.email = 'samuel.tarif@gmail.com';
