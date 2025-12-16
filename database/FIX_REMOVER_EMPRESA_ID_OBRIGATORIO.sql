-- ============================================================================
-- FIX: REMOVER OBRIGATORIEDADE DE EMPRESA_ID
-- Sistema single-tenant - não precisa de empresa_id
-- Execute no Supabase SQL Editor
-- ============================================================================

-- 1. TORNAR EMPRESA_ID OPCIONAL NA TABELA REGISTROS_PONTO
ALTER TABLE registros_ponto 
ALTER COLUMN empresa_id DROP NOT NULL;

-- 2. VERIFICAR SE FUNCIONOU
SELECT 
    column_name,
    is_nullable,
    data_type
FROM information_schema.columns 
WHERE table_name = 'registros_ponto' 
AND column_name = 'empresa_id';

-- Resultado esperado: is_nullable = 'YES'

-- 3. VERIFICAR OUTRAS TABELAS QUE PODEM TER EMPRESA_ID OBRIGATÓRIO
SELECT 
    table_name,
    column_name,
    is_nullable
FROM information_schema.columns 
WHERE column_name = 'empresa_id'
AND table_schema = 'public'
ORDER BY table_name;

-- ============================================================================
-- OPCIONAL: TORNAR EMPRESA_ID OPCIONAL EM OUTRAS TABELAS
-- Descomente conforme necessário
-- ============================================================================

-- ALTER TABLE colaboradores ALTER COLUMN empresa_id DROP NOT NULL;
-- ALTER TABLE solicitacoes_funcionario ALTER COLUMN empresa_id DROP NOT NULL;
-- ALTER TABLE documentos_funcionario ALTER COLUMN empresa_id DROP NOT NULL;
-- ALTER TABLE comunicados ALTER COLUMN empresa_id DROP NOT NULL;
-- ALTER TABLE banco_horas ALTER COLUMN empresa_id DROP NOT NULL;

-- ============================================================================
-- FIM
-- ============================================================================