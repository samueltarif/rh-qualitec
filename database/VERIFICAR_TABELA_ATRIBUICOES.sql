-- Verificar se existe tabela de atribuições de cursos
SELECT table_name 
FROM information_schema.tables 
WHERE table_name LIKE '%curso%' OR table_name LIKE '%atribui%';

-- Verificar estrutura da tabela cursos_atribuicoes se existir
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'cursos_atribuicoes' 
ORDER BY ordinal_position;