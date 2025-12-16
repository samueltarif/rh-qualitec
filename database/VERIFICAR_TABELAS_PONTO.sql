-- ============================================================================
-- VERIFICAR TABELAS DE PONTO - DIAGNÓSTICO COMPLETO
-- Execute no Supabase SQL Editor
-- ============================================================================

-- 1. VERIFICAR QUAIS TABELAS DE PONTO EXISTEM
SELECT 
    '=== TABELAS DE PONTO EXISTENTES ===' as titulo;

SELECT 
    table_name,
    CASE 
        WHEN table_name = 'ponto' THEN 'Tabela original do schema'
        WHEN table_name = 'registros_ponto' THEN 'Tabela da migração 24 (CORRETA)'
        ELSE 'Outra tabela'
    END as descricao
FROM information_schema.tables 
WHERE table_name IN ('ponto', 'registros_ponto')
AND table_schema = 'public';

-- 2. VERIFICAR ESTRUTURA DA TABELA REGISTROS_PONTO (se existir)
SELECT 
    '=== ESTRUTURA REGISTROS_PONTO ===' as titulo;

SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'registros_ponto'
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 3. VERIFICAR ESTRUTURA DA TABELA PONTO (se existir)
SELECT 
    '=== ESTRUTURA PONTO ===' as titulo;

SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'ponto'
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 4. VERIFICAR SE MIGRATION 24 FOI EXECUTADA
SELECT 
    '=== STATUS MIGRATION 24 ===' as titulo;

SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.tables 
            WHERE table_name = 'registros_ponto'
        ) THEN '✅ Migration 24 executada - registros_ponto existe'
        ELSE '❌ Migration 24 NÃO executada - registros_ponto não existe'
    END as status_migration_24;

-- 5. VERIFICAR DADOS EXISTENTES (se houver)
SELECT 
    '=== DADOS EXISTENTES ===' as titulo;

-- Verificar registros_ponto
SELECT 
    'registros_ponto' as tabela,
    COUNT(*) as total_registros
FROM registros_ponto
WHERE EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_name = 'registros_ponto'
)

UNION ALL

-- Verificar ponto
SELECT 
    'ponto' as tabela,
    COUNT(*) as total_registros
FROM ponto
WHERE EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_name = 'ponto'
);

-- ============================================================================
-- AÇÃO CORRETIVA (se necessário)
-- ============================================================================

-- Se apenas a tabela 'ponto' existir, execute a migration 24:
-- Vá para: nuxt-app/database/migrations/24_portal_funcionario.sql

-- Se ambas existirem, pode ser necessário migrar dados:
/*
-- MIGRAR DADOS DE 'ponto' PARA 'registros_ponto' (se necessário)
INSERT INTO registros_ponto (
    empresa_id,
    colaborador_id,
    data,
    entrada_1,
    observacoes,
    justificativa,
    status,
    ip_registro,
    created_at,
    updated_at
)
SELECT 
    c.empresa_id,
    p.colaborador_id,
    p.data,
    p.hora,
    p.metadata::text,
    p.justificativa,
    'Normal',
    p.ip_address::text,
    p.created_at,
    p.updated_at
FROM ponto p
JOIN colaboradores c ON c.id = p.colaborador_id
WHERE p.tipo = 'Entrada'
AND NOT EXISTS (
    SELECT 1 FROM registros_ponto rp 
    WHERE rp.colaborador_id = p.colaborador_id 
    AND rp.data = p.data
);
*/

-- ============================================================================
-- RESULTADO ESPERADO
-- ============================================================================
-- Para o sistema funcionar corretamente:
-- 1. ✅ Tabela 'registros_ponto' deve existir
-- 2. ✅ Deve ter coluna 'empresa_id'
-- 3. ✅ Deve ter colunas entrada_1, saida_1, entrada_2, saida_2
-- 4. ✅ APIs usam 'registros_ponto', não 'ponto'
-- ============================================================================