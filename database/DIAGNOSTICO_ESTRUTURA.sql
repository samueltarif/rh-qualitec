-- ============================================================================
-- DIAGNÓSTICO: Verificar estrutura do banco antes de criar holerites
-- ============================================================================
-- Execute este script PRIMEIRO para entender a estrutura atual
-- ============================================================================

-- 1. Verificar se tabelas existem
SELECT 
  'colaboradores' as tabela,
  CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'colaboradores') 
    THEN '✅ EXISTE' 
    ELSE '❌ NÃO EXISTE' 
  END as status;

SELECT 
  'app_users' as tabela,
  CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'app_users') 
    THEN '✅ EXISTE' 
    ELSE '❌ NÃO EXISTE' 
  END as status;

-- 2. Ver colunas da tabela colaboradores
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'colaboradores'
ORDER BY ordinal_position;

-- 3. Ver colunas da tabela app_users
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'app_users'
ORDER BY ordinal_position;

-- 4. Verificar relacionamento entre app_users e colaboradores
SELECT 
  tc.table_name, 
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND (tc.table_name = 'colaboradores' OR tc.table_name = 'app_users');

-- 5. Ver um exemplo de dados (se existir)
SELECT id, nome, email, role, colaborador_id
FROM app_users
LIMIT 3;

SELECT id, nome, cpf, user_id
FROM colaboradores
LIMIT 3;
