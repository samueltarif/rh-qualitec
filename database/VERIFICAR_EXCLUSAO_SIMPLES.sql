-- ============================================================================
-- VERIFICAÇÃO SIMPLES - EXCLUSÃO DE REGISTROS DE PONTO
-- Execute no Supabase SQL Editor
-- ============================================================================

-- 1. VERIFICAR REGISTROS EXISTENTES (últimos 20)
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
ORDER BY rp.data DESC, rp.created_at DESC
LIMIT 20;

-- 2. BUSCAR REGISTROS DO ENOA ESPECIFICAMENTE
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
WHERE c.nome ILIKE '%enoa%'
ORDER BY rp.data DESC;

-- 3. CONTAR TOTAL DE REGISTROS
SELECT COUNT(*) as total_registros FROM registros_ponto;

-- 4. VERIFICAR REGISTROS POR COLABORADOR
SELECT 
    c.nome,
    COUNT(rp.id) as total_registros
FROM colaboradores c
LEFT JOIN registros_ponto rp ON rp.colaborador_id = c.id
GROUP BY c.id, c.nome
ORDER BY total_registros DESC;

-- 5. VERIFICAR POLÍTICAS RLS
SELECT 
    policyname,
    cmd,
    permissive,
    qual
FROM pg_policies 
WHERE tablename = 'registros_ponto'
ORDER BY policyname;

-- ============================================================================
-- RESULTADO ESPERADO:
-- - Se o registro foi excluído, não deve aparecer nas consultas acima
-- - Se ainda aparece, há problema de cache no frontend ou erro na API
-- ============================================================================