-- =====================================================
-- SINCRONIZAR NOMES: colaboradores → app_users
-- =====================================================
-- Agora que os IDs estão unificados, podemos sincronizar
-- os nomes diretamente por ID!
-- =====================================================

-- Ver situação atual
SELECT 
  '📊 SITUAÇÃO ATUAL' as status,
  c.id,
  c.nome as nome_colaborador,
  au.nome as nome_app_user,
  CASE 
    WHEN c.nome = au.nome THEN '✅ IGUAL'
    ELSE '❌ DIFERENTE'
  END as comparacao
FROM colaboradores c
INNER JOIN app_users au ON c.id = au.id
ORDER BY c.nome;

-- Atualizar nomes em app_users baseado em colaboradores
-- (colaboradores é a fonte da verdade)
UPDATE app_users au
SET nome = c.nome
FROM colaboradores c
WHERE au.id = c.id
  AND au.nome != c.nome;

-- Verificar resultado
SELECT 
  '✅ RESULTADO' as status,
  c.id,
  c.nome as nome_colaborador,
  au.nome as nome_app_user,
  CASE 
    WHEN c.nome = au.nome THEN '✅ SINCRONIZADO'
    ELSE '❌ AINDA DIFERENTE'
  END as resultado
FROM colaboradores c
INNER JOIN app_users au ON c.id = au.id
ORDER BY c.nome;

-- Estatísticas
SELECT 
  '📊 ESTATÍSTICAS' as info,
  COUNT(*) as total,
  COUNT(*) FILTER (WHERE c.nome = au.nome) as sincronizados,
  COUNT(*) FILTER (WHERE c.nome != au.nome) as diferentes
FROM colaboradores c
INNER JOIN app_users au ON c.id = au.id;
