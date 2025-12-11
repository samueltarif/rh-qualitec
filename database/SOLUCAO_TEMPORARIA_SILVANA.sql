-- SOLUÇÃO TEMPORÁRIA - Permitir acesso da Silvana sem auth_uid

-- Opção 1: Criar um auth_uid fictício para Silvana (TEMPORÁRIO)
UPDATE app_users 
SET auth_uid = gen_random_uuid()
WHERE (email ILIKE '%silvana%' OR nome ILIKE '%silvana%')
AND role = 'admin'
AND auth_uid IS NULL;

-- Verificar
SELECT 
    email,
    nome, 
    role,
    auth_uid,
    '✅ TEMPORÁRIO' as status
FROM app_users 
WHERE role = 'admin';