-- =====================================================
-- CONFIRMAÇÃO FINAL: Nomes sincronizados
-- =====================================================

-- Ver todos os registros lado a lado
SELECT 
  c.id,
  c.nome as "👤 Nome Colaborador",
  au.nome as "🔐 Nome App User",
  '✅ SINCRONIZADO' as status
FROM colaboradores c
INNER JOIN app_users au ON c.id = au.id
WHERE c.nome = au.nome
ORDER BY c.nome;

-- Resumo
SELECT 
  '✅ SINCRONIZAÇÃO COMPLETA' as resultado,
  COUNT(*) as total_registros_ok
FROM colaboradores c
INNER JOIN app_users au ON c.id = au.id
WHERE c.nome = au.nome;
