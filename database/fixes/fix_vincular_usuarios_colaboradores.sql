-- ============================================================================
-- FIX: Vincular usuários aos colaboradores automaticamente
-- Este script vincula app_users aos colaboradores pelo email
-- ============================================================================

-- Atualizar app_users que não têm colaborador_id mas têm email correspondente
UPDATE app_users au
SET colaborador_id = c.id
FROM colaboradores c
WHERE 
  au.colaborador_id IS NULL 
  AND au.email = c.email_corporativo
  AND c.email_corporativo IS NOT NULL
  AND c.email_corporativo != '';

-- Verificar resultado
SELECT 
  au.id,
  au.nome as usuario_nome,
  au.email,
  au.colaborador_id,
  c.nome as colaborador_nome,
  c.email_corporativo
FROM app_users au
LEFT JOIN colaboradores c ON c.id = au.colaborador_id
WHERE au.role = 'funcionario'
ORDER BY au.nome;
