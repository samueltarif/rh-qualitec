-- FIX SUPER SIMPLES: Apenas tornar usuários existentes admin

-- 1. Ver usuários atuais
SELECT email, role, nome FROM app_users;

-- 2. Tornar TODOS os usuários existentes admin
UPDATE app_users SET role = 'admin';

-- 3. Verificar resultado
SELECT 'RESULTADO FINAL' as status, email, role, nome FROM app_users;