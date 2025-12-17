-- ============================================================================
-- VERIFICAR EXCLUSÃO DE REGISTROS DE PONTO
-- Execute no Supabase SQL Editor para diagnosticar
-- ============================================================================

-- 1. VERIFICAR REGISTROS EXISTENTES
SELECT 
    id,
    data,
    colaborador_id,
    entrada_1,
    saida_1,
    entrada_2,
    saida_2,
    status,
    created_at,
    updated_at
FROM registros_ponto 
ORDER BY data DESC, created_at DESC
LIMIT 20;

-- 2. VERIFICAR REGISTROS DE UM COLABORADOR ESPECÍFICO (substitua pelo nome)
SELECT 
    rp.id,
    rp.data,
    c.nome as colaborador_nome,
    rp.entrada_1,
    rp.saida_1,
    rp.status,
    rp.created_at
FROM registros_ponto rp
LEFT JOIN colaboradores c ON c.id = rp.colaborador_id
WHERE c.nome ILIKE '%enoa%'  -- Substitua pelo nome do colaborador
ORDER BY rp.data DESC;

-- 3. VERIFICAR POLÍTICAS RLS ATIVAS
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'registros_ponto'
ORDER BY policyname;

-- 4. VERIFICAR SE RLS ESTÁ HABILITADO
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename = 'registros_ponto';

-- 5. TESTAR EXCLUSÃO MANUAL (CUIDADO - APENAS PARA TESTE)
-- DELETE FROM registros_ponto WHERE id = 'ID_DO_REGISTRO_AQUI';

-- 6. VERIFICAR LOGS DE AUDITORIA (OPCIONAL - pode não existir)
-- SELECT 
--     table_name,
--     record_id,
--     old_values,
--     new_values,
--     op,
--     ts
-- FROM audit.logged_actions 
-- WHERE table_name = 'registros_ponto'
-- ORDER BY ts DESC
-- LIMIT 10;

-- ============================================================================
-- DIAGNÓSTICO COMPLETO
-- ============================================================================

-- Contar total de registros
SELECT COUNT(*) as total_registros FROM registros_ponto;

-- Verificar registros por colaborador
SELECT 
    c.nome,
    COUNT(rp.id) as total_registros
FROM colaboradores c
LEFT JOIN registros_ponto rp ON rp.colaborador_id = c.id
GROUP BY c.id, c.nome
ORDER BY total_registros DESC;

-- Verificar registros recentes (últimos 7 dias)
SELECT 
    DATE(rp.data) as data,
    COUNT(*) as registros_dia
FROM registros_ponto rp
WHERE rp.data >= CURRENT_DATE - INTERVAL '7 days'
GROUP BY DATE(rp.data)
ORDER BY data DESC;

-- ============================================================================
-- FIM
-- ============================================================================