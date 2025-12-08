-- Ver todos os campos da tabela colaboradores
SELECT 
  column_name,
  data_type,
  udt_name
FROM information_schema.columns
WHERE table_name = 'colaboradores'
ORDER BY ordinal_position;
