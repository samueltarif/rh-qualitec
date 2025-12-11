-- ============================================
-- DIAGNÓSTICO ASSINATURA DIGITAL
-- ============================================

-- 1. Verificar se a tabela existe
SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.tables 
      WHERE table_name = 'assinaturas_ponto'
    ) 
    THEN '✅ Tabela assinaturas_ponto existe'
    ELSE '❌ Tabela assinaturas_ponto NÃO existe'
  END as status_tabela;

-- 2. Verificar colunas da tabela
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'assinaturas_ponto'
ORDER BY ordinal_position;

-- 3. Verificar se a coluna assinatura_digital existe
SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'assinaturas_ponto' 
      AND column_name = 'assinatura_digital'
    ) 
    THEN '✅ Coluna assinatura_digital existe'
    ELSE '❌ Coluna assinatura_digital NÃO existe'
  END as status_coluna;

-- 4. Verificar políticas RLS
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'assinaturas_ponto';

-- 5. Verificar se RLS está habilitado
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE tablename = 'assinaturas_ponto';

-- 6. Contar registros existentes
SELECT 
  COUNT(*) as total_assinaturas,
  COUNT(DISTINCT colaborador_id) as colaboradores_com_assinatura,
  COUNT(DISTINCT CONCAT(ano, '-', mes)) as periodos_assinados
FROM assinaturas_ponto;

-- 7. Verificar índices
SELECT 
  indexname,
  indexdef
FROM pg_indexes 
WHERE tablename = 'assinaturas_ponto';

-- 8. Verificar se há erros de constraint
SELECT 
  conname as constraint_name,
  contype as constraint_type,
  pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'assinaturas_ponto'::regclass;