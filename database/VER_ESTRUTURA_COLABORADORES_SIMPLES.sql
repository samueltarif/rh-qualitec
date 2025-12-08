-- Ver estrutura real da tabela colaboradores
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'colaboradores'
ORDER BY ordinal_position;
