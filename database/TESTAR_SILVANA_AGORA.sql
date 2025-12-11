-- TESTAR SILVANA AGORA - Verificar se está tudo correto

-- 1. Verificar Silvana no app_users (deve estar OK)
SELECT 
    'SILVANA APP_USERS' as status,
    email,
    nome,
    role,
    auth_uid,
    CASE 
        WHEN role = 'admin' AND auth_uid IS NOT NULL THEN '✅ PRONTO PARA USAR'
        WHEN role = 'admin' AND auth_uid IS NULL THEN '❌ SEM AUTH_UID'
        ELSE '❌ NÃO É ADMIN'
    END as resultado
FROM app_users 
WHERE email ILIKE '%silvana%' OR nome ILIKE '%silvana%';

-- 2. Verificar se o auth_uid existe no Supabase Auth
SELECT 
    'SILVANA AUTH' as status,
    au.email,
    au.id as auth_uid,
    '✅ USUÁRIO AUTENTICADO' as resultado
FROM auth.users au
WHERE au.email ILIKE '%silvana%';

-- 3. Teste final - simular a consulta da API
SELECT 
    'TESTE API' as status,
    app.role,
    app.email,
    CASE 
        WHEN app.role IN ('admin', 'super_admin') THEN '✅ ACESSO LIBERADO'
        ELSE '❌ ACESSO NEGADO'
    END as resultado_api
FROM app_users app
JOIN auth.users au ON app.auth_uid = au.id
WHERE au.email ILIKE '%silvana%';