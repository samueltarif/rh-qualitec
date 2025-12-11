-- DIAGNÓSTICO SILVANA AUTH_UID

-- 1. Ver dados da Silvana na tabela app_users
SELECT 
    'APP_USERS' as tabela,
    id,
    email,
    nome,
    role,
    auth_uid,
    CASE 
        WHEN auth_uid IS NULL THEN '❌ SEM AUTH_UID'
        ELSE '✅ COM AUTH_UID'
    END as status_auth
FROM app_users 
WHERE email ILIKE '%silvana%' OR nome ILIKE '%silvana%';

-- 2. Ver dados da Silvana na tabela colaboradores
SELECT 
    'COLABORADORES' as tabela,
    id,
    nome,
    email,
    auth_uid,
    CASE 
        WHEN auth_uid IS NULL THEN '❌ SEM AUTH_UID'
        ELSE '✅ COM AUTH_UID'
    END as status_auth
FROM colaboradores 
WHERE email ILIKE '%silvana%' OR nome ILIKE '%silvana%';

-- 3. Ver usuários autenticados no Supabase Auth
SELECT 
    'AUTH_USERS' as tabela,
    id as auth_id,
    email,
    created_at,
    last_sign_in_at,
    '✅ USUÁRIO AUTH' as status
FROM auth.users 
WHERE email ILIKE '%silvana%';

-- 4. Verificar se existe vinculação
SELECT 
    'VINCULAÇÃO' as tipo,
    au.email as email_auth,
    au.id as auth_uid,
    app.email as email_app,
    app.role,
    col.nome as nome_colaborador,
    CASE 
        WHEN au.id IS NOT NULL AND app.auth_uid IS NOT NULL THEN '✅ VINCULADO'
        WHEN au.id IS NOT NULL AND app.auth_uid IS NULL THEN '⚠️ AUTH EXISTS, NOT LINKED'
        ELSE '❌ NÃO VINCULADO'
    END as status_vinculacao
FROM auth.users au
LEFT JOIN app_users app ON au.id = app.auth_uid
LEFT JOIN colaboradores col ON au.id = col.auth_uid
WHERE au.email ILIKE '%silvana%';