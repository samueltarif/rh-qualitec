-- FIX RÁPIDO: Tornar Silvana admin

-- 1. Ver usuários atuais
SELECT email, role FROM app_users;

-- 2. Tornar TODOS os usuários admin temporariamente (para teste)
UPDATE app_users SET role = 'admin';

-- 3. Criar usuário admin genérico se não existir
INSERT INTO app_users (email, role, nome, auth_uid, created_at)
VALUES ('admin@qualitec.com.br', 'admin', 'Administrador', gen_random_uuid(), NOW())
ON CONFLICT (email) DO UPDATE SET role = 'admin';

-- 4. Verificar resultado
SELECT 'RESULTADO' as status, email, role FROM app_users;