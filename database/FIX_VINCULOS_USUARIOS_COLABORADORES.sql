-- FIX: Vínculos Incorretos entre Usuários e Colaboradores
-- Problema: Usuário logado como Claudia mas sistema encontra ENOA SILVA COSTA

-- 1. DIAGNÓSTICO: Ver vínculos atuais
SELECT 
    au.email as email_auth,
    ap.email as email_app_user,
    ap.nome as nome_app_user,
    c.nome as nome_colaborador,
    c.email_corporativo,
    c.email_pessoal,
    ap.auth_uid,
    ap.colaborador_id
FROM auth.users au
LEFT JOIN app_users ap ON ap.auth_uid = au.id
LEFT JOIN colaboradores c ON c.id = ap.colaborador_id
WHERE au.email IN ('conta3secunndaria@gmail.com', 'quotextarif@gmail.com')
ORDER BY au.email;

-- 2. VERIFICAR DUPLICAÇÕES
SELECT 
    email,
    COUNT(*) as total
FROM app_users 
GROUP BY email 
HAVING COUNT(*) > 1;

-- 3. CORRIGIR VÍNCULO ESPECÍFICO: conta3secunndaria@gmail.com deve ser CLAUDIA
-- Primeiro, encontrar o ID correto da Claudia
DO $$
DECLARE
    claudia_id UUID;
    enoa_id UUID;
    auth_uid_conta3 UUID;
BEGIN
    -- Buscar IDs dos colaboradores
    SELECT id INTO claudia_id FROM colaboradores WHERE nome ILIKE '%CLAUDIA%' LIMIT 1;
    SELECT id INTO enoa_id FROM colaboradores WHERE nome ILIKE '%ENOA%' LIMIT 1;
    
    -- Buscar auth_uid do email conta3secunndaria@gmail.com
    SELECT id INTO auth_uid_conta3 FROM auth.users WHERE email = 'conta3secunndaria@gmail.com';
    
    RAISE NOTICE 'Claudia ID: %, Enoa ID: %, Auth UID: %', claudia_id, enoa_id, auth_uid_conta3;
    
    IF claudia_id IS NOT NULL AND auth_uid_conta3 IS NOT NULL THEN
        -- Atualizar o vínculo correto
        UPDATE app_users 
        SET colaborador_id = claudia_id,
            nome = (SELECT nome FROM colaboradores WHERE id = claudia_id),
            email = 'conta3secunndaria@gmail.com'
        WHERE auth_uid = auth_uid_conta3;
        
        RAISE NOTICE 'Vínculo corrigido: conta3secunndaria@gmail.com -> CLAUDIA';
    END IF;
    
    -- Se houver vínculo incorreto da ENOA, corrigir também
    IF enoa_id IS NOT NULL THEN
        -- Verificar se ENOA tem email próprio
        UPDATE app_users 
        SET colaborador_id = enoa_id,
            nome = (SELECT nome FROM colaboradores WHERE id = enoa_id),
            email = COALESCE(
                (SELECT email_corporativo FROM colaboradores WHERE id = enoa_id),
                (SELECT email_pessoal FROM colaboradores WHERE id = enoa_id),
                'enoa@temp.com'
            )
        WHERE colaborador_id = enoa_id AND auth_uid != auth_uid_conta3;
        
        RAISE NOTICE 'Vínculo da ENOA também corrigido';
    END IF;
END $$;

-- 4. REMOVER VÍNCULOS DUPLICADOS OU ÓRFÃOS
DELETE FROM app_users 
WHERE colaborador_id IS NULL 
   OR colaborador_id NOT IN (SELECT id FROM colaboradores);

-- 5. GARANTIR QUE CADA COLABORADOR ATIVO TEM APENAS UM USUÁRIO
WITH duplicados AS (
    SELECT colaborador_id, COUNT(*) as total
    FROM app_users 
    WHERE colaborador_id IS NOT NULL
    GROUP BY colaborador_id 
    HAVING COUNT(*) > 1
)
DELETE FROM app_users 
WHERE id IN (
    SELECT ap.id 
    FROM app_users ap
    INNER JOIN duplicados d ON d.colaborador_id = ap.colaborador_id
    WHERE ap.auth_uid IS NULL OR ap.auth_uid = ''
);

-- 6. SINCRONIZAR NOMES E EMAILS
UPDATE app_users 
SET nome = c.nome,
    email = COALESCE(c.email_corporativo, c.email_pessoal, app_users.email)
FROM colaboradores c 
WHERE app_users.colaborador_id = c.id 
  AND c.status = 'Ativo';

-- 7. VERIFICAÇÃO FINAL
SELECT 
    '=== VERIFICAÇÃO FINAL ===' as status;

SELECT 
    au.email as email_login,
    ap.nome as nome_sistema,
    c.nome as nome_colaborador,
    CASE 
        WHEN au.email = 'conta3secunndaria@gmail.com' AND c.nome ILIKE '%CLAUDIA%' THEN '✅ CORRETO'
        WHEN au.email = 'conta3secunndaria@gmail.com' AND c.nome NOT ILIKE '%CLAUDIA%' THEN '❌ INCORRETO'
        ELSE '⚠️ VERIFICAR'
    END as status_vinculo
FROM auth.users au
LEFT JOIN app_users ap ON ap.auth_uid = au.id
LEFT JOIN colaboradores c ON c.id = ap.colaborador_id
WHERE au.email IN ('conta3secunndaria@gmail.com', 'quotextarif@gmail.com')
ORDER BY au.email;

-- 8. MOSTRAR TODOS OS VÍNCULOS ATIVOS
SELECT 
    c.nome as colaborador,
    c.email_corporativo,
    ap.email as email_usuario,
    au.email as email_auth,
    ap.role,
    CASE 
        WHEN ap.auth_uid IS NOT NULL THEN '✅ Vinculado'
        ELSE '❌ Sem vínculo'
    END as status
FROM colaboradores c
LEFT JOIN app_users ap ON ap.colaborador_id = c.id
LEFT JOIN auth.users au ON au.id = ap.auth_uid
WHERE c.status = 'Ativo'
ORDER BY c.nome;