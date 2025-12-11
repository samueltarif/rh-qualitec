-- FIX SILVANA AUTH_UID - EXECUTAR AGORA

-- 1. Buscar o auth_uid da Silvana no Supabase Auth
DO $$
DECLARE
    silvana_auth_uid UUID;
BEGIN
    -- Buscar o ID da Silvana no auth.users
    SELECT id INTO silvana_auth_uid 
    FROM auth.users 
    WHERE email ILIKE '%silvana%' 
    LIMIT 1;
    
    IF silvana_auth_uid IS NOT NULL THEN
        -- Atualizar app_users com o auth_uid correto
        UPDATE app_users 
        SET auth_uid = silvana_auth_uid
        WHERE (email ILIKE '%silvana%' OR nome ILIKE '%silvana%')
        AND role = 'admin';
        
        -- Atualizar colaboradores se existir
        UPDATE colaboradores 
        SET auth_uid = silvana_auth_uid
        WHERE email ILIKE '%silvana%' OR nome ILIKE '%silvana%';
        
        RAISE NOTICE 'Silvana vinculada com auth_uid: %', silvana_auth_uid;
    ELSE
        RAISE NOTICE 'Silvana não encontrada no auth.users - precisa fazer login primeiro';
    END IF;
END $$;

-- 2. Verificar resultado
SELECT 
    'RESULTADO FINAL' as status,
    email,
    nome,
    role,
    auth_uid,
    CASE 
        WHEN auth_uid IS NOT NULL THEN '✅ VINCULADO'
        ELSE '❌ SEM VINCULO'
    END as status_vinculo
FROM app_users 
WHERE email ILIKE '%silvana%' OR nome ILIKE '%silvana%';