-- =====================================================
-- DIAGNÓSTICO: VERIFICAR VÍNCULOS ENTRE TABELAS
-- =====================================================

-- 1. Ver todos os colaboradores e seus vínculos com app_users
SELECT 
  c.id as colaborador_id,
  c.nome as nome_colaborador,
  c.email as email_colaborador,
  au.id as app_user_id,
  au.nome as nome_app_user,
  au.email as email_app_user,
  au.auth_uid,
  CASE 
    WHEN au.id IS NULL THEN '❌ SEM VÍNCULO'
    WHEN c.nome = au.nome THEN '✅ NOMES IGUAIS'
    ELSE '⚠️ NOMES DIFERENTES'
  END as status
FROM colaboradores c
LEFT JOIN app_users au ON c.id = au.id
ORDER BY c.nome;

-- 2. Ver app_users sem colaborador correspondente
SELECT 
  au.id,
  au.nome,
  au.email,
  au.auth_uid,
  '❌ SEM COLABORADOR' as status
FROM app_users au
LEFT JOIN colaboradores c ON au.id = c.id
WHERE c.id IS NULL;

-- 3. Contar registros
SELECT 
  (SELECT COUNT(*) FROM colaboradores) as total_colaboradores,
  (SELECT COUNT(*) FROM app_users) as total_app_users,
  (SELECT COUNT(*) FROM colaboradores c INNER JOIN app_users au ON c.id = au.id) as total_vinculados;
