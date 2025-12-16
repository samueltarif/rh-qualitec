-- ============================================================================
-- FIX USUÁRIOS E EMPRESA - CORRIGIR PROBLEMA PONTO
-- Execute no Supabase SQL Editor
-- ============================================================================

-- 1. VERIFICAR ESTRUTURA ATUAL
SELECT 
    '=== VERIFICAR ESTRUTURA APP_USERS ===' as titulo;

SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'app_users'
ORDER BY ordinal_position;

-- 2. VERIFICAR USUÁRIOS EXISTENTES
SELECT 
    '=== USUÁRIOS EXISTENTES ===' as titulo;

SELECT 
    au.id,
    au.auth_uid,
    au.email,
    au.nome,
    au.role,
    au.colaborador_id,
    c.nome as colaborador_nome,
    c.empresa_id,
    CASE 
        WHEN au.colaborador_id IS NULL THEN '❌ SEM COLABORADOR'
        WHEN c.id IS NULL THEN '❌ COLABORADOR NÃO ENCONTRADO'
        WHEN c.empresa_id IS NULL THEN '❌ COLABORADOR SEM EMPRESA'
        ELSE '✅ OK'
    END as status
FROM app_users au
LEFT JOIN colaboradores c ON c.id = au.colaborador_id
ORDER BY au.created_at;

-- 3. VERIFICAR COLABORADORES SEM USUÁRIO
SELECT 
    '=== COLABORADORES SEM USUÁRIO ===' as titulo;

SELECT 
    c.id,
    c.nome,
    c.email_corporativo,
    c.empresa_id,
    'Precisa criar usuário' as acao
FROM colaboradores c
LEFT JOIN app_users au ON au.colaborador_id = c.id
WHERE au.id IS NULL
AND c.status = 'Ativo'
ORDER BY c.nome;

-- 4. CRIAR USUÁRIOS PARA COLABORADORES ATIVOS (se necessário)
-- DESCOMENTE APENAS SE QUISER CRIAR USUÁRIOS AUTOMATICAMENTE

/*
INSERT INTO app_users (
    auth_uid, 
    email, 
    nome, 
    role, 
    colaborador_id, 
    ativo
)
SELECT 
    gen_random_uuid(), -- Temporário, será atualizado quando fizer login
    COALESCE(c.email_corporativo, c.email_pessoal, c.nome || '@temp.com'),
    c.nome,
    'funcionario',
    c.id,
    true
FROM colaboradores c
LEFT JOIN app_users au ON au.colaborador_id = c.id
WHERE au.id IS NULL
AND c.status = 'Ativo'
AND (c.email_corporativo IS NOT NULL OR c.email_pessoal IS NOT NULL);
*/

-- 5. VERIFICAR RESULTADO FINAL
SELECT 
    '=== RESULTADO FINAL ===' as titulo;

SELECT 
    COUNT(*) as total_usuarios,
    COUNT(CASE WHEN au.colaborador_id IS NOT NULL THEN 1 END) as usuarios_com_colaborador,
    COUNT(CASE WHEN c.empresa_id IS NOT NULL THEN 1 END) as usuarios_com_empresa
FROM app_users au
LEFT JOIN colaboradores c ON c.id = au.colaborador_id;

-- ============================================================================
-- TESTE RÁPIDO DA API
-- ============================================================================

-- Simular busca da API corrigida
SELECT 
    '=== TESTE API CORRIGIDA ===' as titulo;

SELECT 
    au.id as app_user_id,
    au.colaborador_id,
    c.id as colaborador_real_id,
    c.empresa_id,
    c.nome as colaborador_nome,
    CASE 
        WHEN c.empresa_id IS NOT NULL THEN '✅ API FUNCIONARÁ'
        ELSE '❌ ERRO: SEM EMPRESA'
    END as status_api
FROM app_users au
LEFT JOIN colaboradores c ON c.id = au.colaborador_id
WHERE au.role = 'funcionario'
ORDER BY au.nome;