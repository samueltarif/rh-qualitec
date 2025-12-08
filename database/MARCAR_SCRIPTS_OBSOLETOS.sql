-- =====================================================
-- VERIFICAR SCRIPTS OBSOLETOS
-- =====================================================
-- Este script identifica objetos do banco que podem
-- estar obsoletos após a migração UUID
-- =====================================================

-- 1. Listar triggers relacionados a sincronização
SELECT 
  '🔍 TRIGGERS DE SINCRONIZAÇÃO' as categoria,
  trigger_name,
  event_object_table as tabela,
  action_statement as funcao,
  CASE 
    WHEN trigger_name LIKE '%email%' THEN '⚠️ OBSOLETO (usa email)'
    WHEN trigger_name LIKE '%uuid%' THEN '✅ ATUALIZADO'
    ELSE '❓ VERIFICAR'
  END as status
FROM information_schema.triggers
WHERE trigger_schema = 'public'
  AND (
    trigger_name LIKE '%sync%'
    OR trigger_name LIKE '%colaborador%'
  )
ORDER BY trigger_name;

-- 2. Listar funções relacionadas a sincronização
SELECT 
  '🔍 FUNÇÕES DE SINCRONIZAÇÃO' as categoria,
  routine_name as funcao,
  routine_type as tipo,
  CASE 
    WHEN routine_name LIKE '%email%' THEN '⚠️ OBSOLETO (usa email)'
    WHEN routine_name LIKE '%uuid%' THEN '✅ ATUALIZADO'
    ELSE '❓ VERIFICAR'
  END as status
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND (
    routine_name LIKE '%sync%'
    OR routine_name LIKE '%colaborador%'
  )
ORDER BY routine_name;

-- 3. Verificar se há colunas temporárias da migração
SELECT 
  '🔍 COLUNAS TEMPORÁRIAS' as categoria,
  table_name as tabela,
  column_name as coluna,
  data_type as tipo,
  '⚠️ PODE SER REMOVIDA' as status
FROM information_schema.columns
WHERE table_schema = 'public'
  AND (
    column_name LIKE 'new_%'
    OR column_name LIKE 'old_%'
    OR column_name LIKE '%_temp'
  )
ORDER BY table_name, column_name;

-- 4. Verificar constraints órfãs
SELECT 
  '🔍 CONSTRAINTS' as categoria,
  conname as constraint_name,
  conrelid::regclass as tabela,
  contype as tipo,
  CASE contype
    WHEN 'f' THEN 'Foreign Key'
    WHEN 'p' THEN 'Primary Key'
    WHEN 'u' THEN 'Unique'
    WHEN 'c' THEN 'Check'
    ELSE 'Outro'
  END as descricao
FROM pg_constraint
WHERE connamespace = 'public'::regnamespace
  AND conrelid::regclass::text LIKE '%colaborador%'
ORDER BY conrelid::regclass, conname;

-- 5. Verificar índices duplicados ou desnecessários
SELECT 
  '🔍 ÍNDICES' as categoria,
  schemaname,
  tablename as tabela,
  indexname as indice,
  indexdef as definicao
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename IN ('colaboradores', 'app_users')
ORDER BY tablename, indexname;

-- 6. Resumo de limpeza necessária
SELECT 
  '📊 RESUMO' as categoria,
  (SELECT COUNT(*) FROM information_schema.triggers 
   WHERE trigger_schema = 'public' 
   AND trigger_name LIKE '%email%') as triggers_obsoletos,
  (SELECT COUNT(*) FROM information_schema.routines 
   WHERE routine_schema = 'public' 
   AND routine_name LIKE '%email%') as funcoes_obsoletas,
  (SELECT COUNT(*) FROM information_schema.columns 
   WHERE table_schema = 'public' 
   AND column_name LIKE 'new_%') as colunas_temporarias;

-- 7. Recomendações
SELECT '📝 RECOMENDAÇÕES' as titulo;
SELECT '1. Execute TRIGGER_SINCRONIZACAO_ATUALIZADO.sql para atualizar triggers' as acao;
SELECT '2. Remova triggers e funções que usam email' as acao;
SELECT '3. Verifique se há colunas temporárias (new_*, old_*) que podem ser removidas' as acao;
SELECT '4. Mova scripts obsoletos para pasta obsolete/' as acao;
