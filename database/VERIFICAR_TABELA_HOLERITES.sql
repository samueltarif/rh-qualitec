-- Verificar se a tabela holerites existe e suas colunas

-- 1. Verificar se a tabela existe
SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'holerites')
    THEN '✅ Tabela holerites EXISTE'
    ELSE '❌ Tabela holerites NÃO EXISTE'
  END as status;

-- 2. Ver todas as colunas da tabela holerites (se existir)
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'holerites'
ORDER BY ordinal_position;

-- 3. Listar todas as tabelas que começam com 'hol'
SELECT table_name
FROM information_schema.tables
WHERE table_name LIKE 'hol%'
AND table_schema = 'public';
