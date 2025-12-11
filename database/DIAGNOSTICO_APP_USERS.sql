-- Diagnóstico da estrutura da tabela app_users

-- Ver todas as colunas da tabela app_users
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'app_users'
ORDER BY ordinal_position;

-- Ver se existe coluna auth_uid ou similar
SELECT column_name 
FROM information_schema.columns
WHERE table_name = 'app_users' 
AND (column_name LIKE '%auth%' OR column_name LIKE '%uid%' OR column_name = 'id');
