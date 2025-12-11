-- EXECUTAR AGORA: Tornar Silvana administradora

-- 1. Verificar usuários atuais
SELECT email, role FROM app_users;

-- 2. Tornar Silvana admin (ajuste o email conforme necessário)
UPDATE app_users 
SET role = 'admin' 
WHERE email ILIKE '%silvana%' 
   OR email = 'silvana@qualitec.com.br'
   OR email = 'silvana@empresa.com';

-- 3. Se não existir usuário para Silvana, criar um
INSERT INTO app_users (email, role, created_at)
SELECT 'silvana@qualitec.com.br', 'admin', NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM app_users WHERE email ILIKE '%silvana%'
);

-- 4. Verificar resultado
SELECT 
    email, 
    role,
    CASE 
        WHEN role IN ('admin', 'super_admin') THEN '✅ PODE ACESSAR ASSINATURAS'
        ELSE '❌ SEM PERMISSÃO'
    END as status_acesso
FROM app_users 
WHERE email ILIKE '%silvana%';

-- 5. Mostrar todos os admins
SELECT email, role FROM app_users WHERE role IN ('admin', 'super_admin');