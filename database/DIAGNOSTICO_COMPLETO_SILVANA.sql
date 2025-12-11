-- DIAGNÓSTICO COMPLETO - Silvana Admin

-- 1. Ver todos os usuários do sistema
SELECT 'TODOS OS USUÁRIOS' as tipo, email, role, auth_uid, colaborador_id FROM app_users;

-- 2. Ver usuário logado atual (se possível identificar)
SELECT 'USUÁRIO ATUAL' as tipo, 
       auth.users.email as auth_email,
       auth.users.id as auth_id,
       au.email as app_email,
       au.role as app_role
FROM auth.users 
LEFT JOIN app_users au ON auth.users.id = au.auth_uid
ORDER BY auth.users.created_at DESC;

-- 3. Procurar Silvana especificamente
SELECT 'SILVANA ENCONTRADA' as tipo, * FROM app_users 
WHERE email ILIKE '%silvana%' 
   OR email = 'silvana@qualitec.com.br'
   OR email = 'silvana@empresa.com';

-- 4. Ver colaboradores com nome Silvana
SELECT 'COLABORADORES SILVANA' as tipo, id, nome, email FROM colaboradores 
WHERE nome ILIKE '%silvana%';

-- 5. FORÇAR Silvana como admin (todos os possíveis emails)
UPDATE app_users SET role = 'admin' 
WHERE email ILIKE '%silvana%' 
   OR email = 'silvana@qualitec.com.br'
   OR email = 'silvana@empresa.com'
   OR email = 'admin@qualitec.com.br';

-- 6. Se não existir, criar usuário admin genérico
INSERT INTO app_users (email, role, created_at)
SELECT 'admin@qualitec.com.br', 'admin', NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM app_users WHERE email = 'admin@qualitec.com.br'
);

-- 7. Criar usuário para Silvana se ela for colaboradora
INSERT INTO app_users (email, role, colaborador_id, created_at)
SELECT 
    'silvana@qualitec.com.br',
    'admin',
    c.id,
    NOW()
FROM colaboradores c
WHERE c.nome ILIKE '%silvana%'
AND NOT EXISTS (
    SELECT 1 FROM app_users WHERE colaborador_id = c.id
);

-- 8. RESULTADO FINAL - Verificar admins
SELECT 'ADMINS FINAIS' as tipo, email, role, 
       CASE WHEN role = 'admin' THEN '✅ PODE ACESSAR' ELSE '❌ SEM ACESSO' END as status
FROM app_users 
WHERE role IN ('admin', 'super_admin')
ORDER BY email;