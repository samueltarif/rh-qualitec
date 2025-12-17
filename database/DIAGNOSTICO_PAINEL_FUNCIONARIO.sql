-- ============================================================================
-- DIAGNÓSTICO: PAINEL FUNCIONÁRIO AINDA MOSTRA REGISTRO EXCLUÍDO
-- Execute no Supabase SQL Editor
-- ============================================================================

-- 1. VERIFICAR REGISTROS DO ENOA ESPECIFICAMENTE
SELECT 
    rp.id,
    rp.data,
    c.nome as colaborador_nome,
    rp.entrada_1,
    rp.saida_1,
    rp.status,
    rp.created_at,
    rp.updated_at
FROM registros_ponto rp
LEFT JOIN colaboradores c ON c.id = rp.colaborador_id
WHERE c.nome ILIKE '%enoa%'
ORDER BY rp.data DESC;

-- 2. VERIFICAR SE HÁ POLÍTICAS RLS DIFERENTES PARA FUNCIONÁRIOS
SELECT 
    policyname,
    cmd,
    permissive,
    roles,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'registros_ponto'
ORDER BY policyname;

-- 3. VERIFICAR SE RLS ESTÁ HABILITADO
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename = 'registros_ponto';

-- 4. TESTAR ACESSO DIRETO À TABELA (como admin)
SELECT COUNT(*) as total_registros_enoa
FROM registros_ponto rp
LEFT JOIN colaboradores c ON c.id = rp.colaborador_id
WHERE c.nome ILIKE '%enoa%';

-- 5. VERIFICAR COLABORADOR_ID DO ENOA
SELECT 
    id as colaborador_id,
    nome,
    email,
    status
FROM colaboradores 
WHERE nome ILIKE '%enoa%';

-- 6. VERIFICAR APP_USERS DO ENOA
SELECT 
    au.id,
    au.auth_uid,
    au.colaborador_id,
    au.role,
    c.nome as colaborador_nome
FROM app_users au
LEFT JOIN colaboradores c ON c.id = au.colaborador_id
WHERE c.nome ILIKE '%enoa%';

-- 7. SIMULAR CONSULTA DA API DO FUNCIONÁRIO
-- (substitua 'COLABORADOR_ID_DO_ENOA' pelo ID real encontrado acima)
/*
SELECT *
FROM registros_ponto
WHERE colaborador_id = 'COLABORADOR_ID_DO_ENOA'
AND data >= '2024-12-01'
AND data <= '2024-12-31'
ORDER BY data DESC;
*/

-- ============================================================================
-- POSSÍVEIS CAUSAS:
-- 1. Cache do navegador no painel do funcionário
-- 2. RLS policies diferentes para funcionários vs admin
-- 3. Registro não foi realmente excluído (verificar com consulta 1)
-- 4. Problema de sincronização entre APIs
-- ============================================================================