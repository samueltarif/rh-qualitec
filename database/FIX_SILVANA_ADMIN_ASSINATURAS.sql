-- Fix para garantir que Silvana seja admin e tenha acesso às assinaturas

-- 1. Verificar usuário atual da Silvana
SELECT 
    au.id,
    au.email,
    au.role,
    au.auth_uid,
    c.nome as colaborador_nome
FROM app_users au
LEFT JOIN colaboradores c ON au.colaborador_id = c.id
WHERE au.email ILIKE '%silvana%' OR c.nome ILIKE '%silvana%';

-- 2. Garantir que Silvana seja admin
UPDATE app_users 
SET role = 'admin'
WHERE email ILIKE '%silvana%' OR id IN (
    SELECT au.id 
    FROM app_users au
    LEFT JOIN colaboradores c ON au.colaborador_id = c.id
    WHERE c.nome ILIKE '%silvana%'
);

-- 3. Verificar se o auth_uid está correto
SELECT 
    au.id,
    au.email,
    au.role,
    au.auth_uid,
    auth.users.id as supabase_auth_id
FROM app_users au
LEFT JOIN auth.users ON au.auth_uid = auth.users.id
WHERE au.email ILIKE '%silvana%';

-- 4. Verificar permissões de acesso às assinaturas
SELECT 
    'Silvana pode acessar assinaturas?' as pergunta,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM app_users 
            WHERE (email ILIKE '%silvana%' OR id IN (
                SELECT au.id FROM app_users au
                LEFT JOIN colaboradores c ON au.colaborador_id = c.id
                WHERE c.nome ILIKE '%silvana%'
            )) AND role IN ('admin', 'super_admin')
        ) THEN 'SIM - Silvana é admin'
        ELSE 'NÃO - Silvana não é admin'
    END as resposta;

-- 5. Se necessário, criar usuário admin para Silvana
DO $$
BEGIN
    -- Verificar se existe colaboradora Silvana sem usuário
    IF EXISTS (
        SELECT 1 FROM colaboradores c
        WHERE c.nome ILIKE '%silvana%'
        AND NOT EXISTS (
            SELECT 1 FROM app_users au WHERE au.colaborador_id = c.id
        )
    ) THEN
        -- Criar usuário admin para Silvana
        INSERT INTO app_users (email, role, colaborador_id, created_at)
        SELECT 
            LOWER(c.nome) || '@qualitec.com.br' as email,
            'admin' as role,
            c.id as colaborador_id,
            NOW() as created_at
        FROM colaboradores c
        WHERE c.nome ILIKE '%silvana%'
        AND NOT EXISTS (
            SELECT 1 FROM app_users au WHERE au.colaborador_id = c.id
        );
        
        RAISE NOTICE 'Usuário admin criado para Silvana';
    END IF;
END $$;

-- 6. Resultado final - verificar se está tudo OK
SELECT 
    'RESULTADO FINAL' as status,
    au.email,
    au.role,
    c.nome as colaborador_nome,
    CASE 
        WHEN au.role IN ('admin', 'super_admin') THEN '✅ PODE ACESSAR ASSINATURAS'
        ELSE '❌ SEM PERMISSÃO'
    END as acesso_assinaturas
FROM app_users au
LEFT JOIN colaboradores c ON au.colaborador_id = c.id
WHERE au.email ILIKE '%silvana%' OR c.nome ILIKE '%silvana%';