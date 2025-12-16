-- ============================================================================
-- DIAGNÓSTICO USUÁRIOS E EMPRESAS - PROBLEMA PONTO
-- ============================================================================

-- 1. VERIFICAR ESTRUTURA DAS TABELAS
SELECT 
    '=== ESTRUTURA APP_USERS ===' as titulo;

SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'app_users'
ORDER BY ordinal_position;

-- 2. VERIFICAR ESTRUTURA COLABORADORES
SELECT 
    '=== ESTRUTURA COLABORADORES ===' as titulo;

SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'colaboradores'
ORDER BY ordinal_position;

-- 3. VERIFICAR TODOS OS USUÁRIOS
SELECT 
    '=== TODOS OS USUÁRIOS APP_USERS ===' as titulo;

SELECT 
    id,
    auth_uid,
    colaborador_id,
    empresa_id,
    role,
    ativo,
    created_at
FROM app_users
ORDER BY created_at;

-- 4. VERIFICAR TODOS OS COLABORADORES
SELECT 
    '=== TODOS OS COLABORADORES ===' as titulo;

SELECT 
    id,
    nome,
    email,
    empresa_id,
    user_id,
    matricula,
    status,
    created_at
FROM colaboradores
ORDER BY created_at;

-- 5. VERIFICAR RELAÇÃO ENTRE TABELAS
SELECT 
    '=== RELAÇÃO USUÁRIOS X COLABORADORES ===' as titulo;

SELECT 
    au.id as app_user_id,
    au.auth_uid,
    au.colaborador_id,
    au.empresa_id as empresa_app_user,
    au.role,
    au.ativo,
    c.id as colaborador_id_real,
    c.nome,
    c.email,
    c.empresa_id as empresa_colaborador,
    c.user_id,
    c.status as status_colaborador,
    CASE 
        WHEN au.colaborador_id = c.id THEN '✅ VINCULADO'
        WHEN au.colaborador_id IS NULL THEN '⚠️ SEM COLABORADOR'
        ELSE '❌ VÍNCULO INCORRETO'
    END as status_vinculo,
    CASE 
        WHEN au.empresa_id = c.empresa_id THEN '✅ EMPRESA OK'
        WHEN au.empresa_id IS NULL THEN '⚠️ SEM EMPRESA'
        ELSE '❌ EMPRESA DIFERENTE'
    END as status_empresa
FROM app_users au
LEFT JOIN colaboradores c ON c.id = au.colaborador_id
ORDER BY au.created_at;

-- 6. VERIFICAR USUÁRIOS SEM EMPRESA
SELECT 
    '=== USUÁRIOS SEM EMPRESA ===' as titulo;

SELECT 
    au.id,
    au.auth_uid,
    au.role,
    au.ativo,
    'Usuário sem empresa_id' as problema
FROM app_users au
WHERE au.empresa_id IS NULL;

-- 7. VERIFICAR COLABORADORES SEM USUÁRIO
SELECT 
    '=== COLABORADORES SEM USUÁRIO ===' as titulo;

SELECT 
    c.id,
    c.nome,
    c.email,
    c.empresa_id,
    'Colaborador sem usuário vinculado' as problema
FROM colaboradores c
LEFT JOIN app_users au ON au.colaborador_id = c.id
WHERE au.id IS NULL;

-- 8. VERIFICAR EMPRESAS EXISTENTES
SELECT 
    '=== EMPRESAS CADASTRADAS ===' as titulo;

SELECT 
    id,
    nome,
    cnpj,
    created_at
FROM empresas
ORDER BY created_at;