-- Verificar se a tabela assinaturas_ponto existe
SELECT 
  table_name,
  table_schema
FROM information_schema.tables 
WHERE table_name = 'assinaturas_ponto';

-- Verificar estrutura da tabela
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'assinaturas_ponto'
ORDER BY ordinal_position;

-- Verificar se há registros
SELECT COUNT(*) as total_assinaturas FROM assinaturas_ponto;

-- Verificar últimas assinaturas
SELECT * FROM assinaturas_ponto 
ORDER BY created_at DESC 
LIMIT 5;