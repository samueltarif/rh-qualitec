-- ============================================================================
-- VINCULAR SAMUEL AO COLABORADOR
-- Execute este script no Supabase SQL Editor
-- ============================================================================

-- 1. Ver dados atuais
SELECT 'APP_USER' as tipo, id, nome, email, colaborador_id FROM app_users WHERE email LIKE '%samuel%';
SELECT 'COLABORADOR' as tipo, id, nome, email_corporativo, empresa_id FROM colaboradores WHERE nome LIKE '%Samuel%';

-- 2. Vincular automaticamente
UPDATE app_users au
SET colaborador_id = c.id
FROM colaboradores c
WHERE 
  au.email LIKE '%samuel%'
  AND c.nome LIKE '%Samuel%'
  AND au.colaborador_id IS NULL;

-- 3. Verificar se funcionou
SELECT 
  au.id as app_user_id,
  au.nome as usuario_nome,
  au.email,
  au.colaborador_id,
  c.nome as colaborador_nome,
  c.email_corporativo,
  c.empresa_id
FROM app_users au
LEFT JOIN colaboradores c ON c.id = au.colaborador_id
WHERE au.email LIKE '%samuel%';

-- Se não funcionou, use este comando manual:
-- UPDATE app_users SET colaborador_id = 'COLE_O_ID_DO_COLABORADOR_AQUI' WHERE email LIKE '%samuel%';
