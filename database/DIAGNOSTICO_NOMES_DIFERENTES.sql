-- =====================================================
-- DIAGNÓSTICO: Ver quais nomes estão diferentes
-- =====================================================

-- Ver TODOS os registros e suas diferenças
SELECT 
  c.id,
  c.nome as nome_colaborador,
  au.nome as nome_app_user,
  CASE 
    WHEN c.nome = au.nome THEN '✅ IGUAL'
    WHEN c.nome IS NULL THEN '⚠️ Colaborador sem nome'
    WHEN au.nome IS NULL THEN '⚠️ App_user sem nome'
    ELSE '❌ DIFERENTE'
  END as status,
  CASE 
    WHEN c.nome != au.nome OR c.nome IS NULL OR au.nome IS NULL THEN 'PRECISA ATUALIZAR'
    ELSE 'OK'
  END as acao
FROM colaboradores c
INNER JOIN app_users au ON c.id = au.id
ORDER BY 
  CASE 
    WHEN c.nome != au.nome OR c.nome IS NULL OR au.nome IS NULL THEN 0
    ELSE 1
  END,
  c.nome;

-- Contar quantos precisam atualizar
SELECT 
  COUNT(*) as total_diferentes
FROM colaboradores c
INNER JOIN app_users au ON c.id = au.id
WHERE c.nome IS DISTINCT FROM au.nome;
