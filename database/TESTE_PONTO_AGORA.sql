-- ============================================================================
-- TESTE RÁPIDO - VERIFICAR SE PONTO VAI FUNCIONAR
-- Execute no Supabase SQL Editor
-- ============================================================================

-- 1. VERIFICAR SE EXISTEM USUÁRIOS
SELECT 
    '=== USUÁRIOS CADASTRADOS ===' as titulo;

SELECT 
    COUNT(*) as total_usuarios,
    COUNT(CASE WHEN colaborador_id IS NOT NULL THEN 1 END) as com_colaborador,
    COUNT(CASE WHEN role = 'funcionario' THEN 1 END) as funcionarios
FROM app_users;

-- 2. VERIFICAR VINCULAÇÃO USUÁRIO → COLABORADOR → EMPRESA
SELECT 
    '=== VINCULAÇÃO COMPLETA ===' as titulo;

SELECT 
    au.email,
    au.nome as usuario_nome,
    au.role,
    au.colaborador_id,
    c.nome as colaborador_nome,
    c.empresa_id,
    e.nome_fantasia as empresa_nome,
    CASE 
        WHEN au.colaborador_id IS NULL THEN '❌ SEM COLABORADOR'
        WHEN c.id IS NULL THEN '❌ COLABORADOR NÃO EXISTE'
        WHEN c.empresa_id IS NULL THEN '❌ SEM EMPRESA'
        WHEN e.id IS NULL THEN '❌ EMPRESA NÃO EXISTE'
        ELSE '✅ TUDO OK'
    END as status
FROM app_users au
LEFT JOIN colaboradores c ON c.id = au.colaborador_id
LEFT JOIN empresas e ON e.id = c.empresa_id
ORDER BY au.role, au.nome;

-- 3. VERIFICAR SE EXISTE EMPRESA CADASTRADA
SELECT 
    '=== EMPRESAS CADASTRADAS ===' as titulo;

SELECT 
    id,
    nome_fantasia,
    razao_social,
    cnpj,
    ativo
FROM empresas
ORDER BY created_at;

-- 4. SIMULAR A BUSCA DA API CORRIGIDA
SELECT 
    '=== SIMULAÇÃO API CORRIGIDA ===' as titulo;

-- Simular para um usuário específico (substitua o auth_uid)
WITH usuario_teste AS (
    SELECT auth_uid FROM app_users WHERE role = 'funcionario' LIMIT 1
)
SELECT 
    au.id as app_user_id,
    au.colaborador_id,
    c.id as colaborador_real_id,
    c.empresa_id,
    c.nome as colaborador_nome,
    e.nome_fantasia as empresa_nome,
    CASE 
        WHEN c.empresa_id IS NOT NULL THEN '✅ API FUNCIONARÁ'
        ELSE '❌ ERRO: SEM EMPRESA'
    END as resultado_api
FROM app_users au
LEFT JOIN colaboradores c ON c.id = au.colaborador_id
LEFT JOIN empresas e ON e.id = c.empresa_id
WHERE au.auth_uid = (SELECT auth_uid FROM usuario_teste);

-- 5. VERIFICAR LOCAIS DE PONTO (para GPS)
SELECT 
    '=== LOCAIS DE PONTO CADASTRADOS ===' as titulo;

SELECT 
    COUNT(*) as total_locais,
    COUNT(CASE WHEN ativo = true THEN 1 END) as locais_ativos
FROM locais_ponto;

-- Se não existir, mostrar estrutura esperada
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'locais_ponto')
        THEN 'Tabela locais_ponto existe'
        ELSE 'ATENÇÃO: Tabela locais_ponto não existe - GPS não funcionará'
    END as status_gps;

-- ============================================================================
-- AÇÕES CORRETIVAS (se necessário)
-- ============================================================================

-- Se houver usuários sem colaborador_id, descomente e execute:
/*
UPDATE app_users 
SET colaborador_id = (
    SELECT c.id 
    FROM colaboradores c 
    WHERE c.email_corporativo = app_users.email 
       OR c.email_pessoal = app_users.email
    LIMIT 1
)
WHERE colaborador_id IS NULL
AND role = 'funcionario';
*/

-- Se houver colaboradores sem empresa_id, descomente e execute:
/*
UPDATE colaboradores 
SET empresa_id = (SELECT id FROM empresas LIMIT 1)
WHERE empresa_id IS NULL;
*/

-- ============================================================================
-- RESULTADO ESPERADO
-- ============================================================================
-- Para o ponto funcionar, você precisa:
-- 1. ✅ Usuários com colaborador_id preenchido
-- 2. ✅ Colaboradores com empresa_id preenchido  
-- 3. ✅ Pelo menos uma empresa cadastrada
-- 4. ✅ Tabela locais_ponto existir (para GPS)
-- ============================================================================