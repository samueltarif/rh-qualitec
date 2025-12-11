-- Verificar estrutura da tabela holerites
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'holerites' 
ORDER BY ordinal_position;