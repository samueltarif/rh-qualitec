-- APENAS SILVANA ADMIN - Reverter outros usuários

-- 1. Ver usuários atuais
SELECT email, role, nome FROM app_users;

-- 2. Tornar TODOS os usuários 'funcionario' primeiro
UPDATE app_users SET role = 'funcionario';

-- 3. Tornar APENAS Silvana admin
UPDATE app_users 
SET role = 'admin' 
WHERE email ILIKE '%silvana%' 
   OR nome ILIKE '%silvana%'
   OR email = 'silvana@qualitec.com.br';

-- 4. Se Silvana não existir como usuário, criar
INSERT INTO app_users (email, role, nome, created_at)
SELECT 'silvana@qualitec.com.br', 'admin', 'Silvana', NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM app_users WHERE email ILIKE '%silvana%' OR nome ILIKE '%silvana%'
);

-- 5. Verificar resultado final
SELECT 
    'RESULTADO FINAL' as status,
    email, 
    role, 
    nome,
    CASE 
        WHEN role = 'admin' THEN '✅ ADMIN (SILVANA)'
        ELSE '👤 FUNCIONÁRIO'
    END as tipo_acesso
FROM app_users 
ORDER BY role DESC, email;