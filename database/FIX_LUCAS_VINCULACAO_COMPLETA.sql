-- FIX ESPECÍFICO PARA LUCAS - VINCULAÇÃO COMPLETA
-- Corrigir especificamente o problema do Lucas

-- 1. Verificar situação atual do Lucas
SELECT 
  'SITUACAO_ATUAL_LUCAS' as status,
  'AUTH_USERS' as tabela,
  id as auth_uid,
  email,
  created_at
FROM auth.users 
WHERE email ILIKE '%lucas%' OR email = 'samuel.tarif@gmail.com'

UNION ALL

SELECT 
  'SITUACAO_ATUAL_LUCAS' as status,
  'APP_USERS' as tabela,
  auth_uid::text,
  email,
  created_at
FROM app_users 
WHERE email ILIKE '%lucas%' OR nome ILIKE '%lucas%'

UNION ALL

SELECT 
  'SITUACAO_ATUAL_LUCAS' as status,
  'COLABORADORES' as tabela,
  auth_uid::text,
  email,
  created_at
FROM colaboradores 
WHERE nome ILIKE '%lucas%' OR email ILIKE '%lucas%';

-- 2. Corrigir vinculação do Lucas especificamente
DO $$
DECLARE
    lucas_auth_uid UUID;
    lucas_colaborador_id UUID;
    lucas_app_user_id UUID;
    empresa_id_padrao UUID;
BEGIN
    -- Buscar empresa padrão
    SELECT id INTO empresa_id_padrao FROM empresas ORDER BY created_at ASC LIMIT 1;
    
    -- Buscar auth_uid do Lucas (pode estar em samuel.tarif@gmail.com)
    SELECT id INTO lucas_auth_uid 
    FROM auth.users 
    WHERE email = 'samuel.tarif@gmail.com' OR email ILIKE '%lucas%'
    ORDER BY created_at DESC 
    LIMIT 1;
    
    -- Buscar ou criar colaborador Lucas
    SELECT id INTO lucas_colaborador_id 
    FROM colaboradores 
    WHERE nome ILIKE '%lucas%' 
    LIMIT 1;
    
    -- Se não existe colaborador Lucas, criar
    IF lucas_colaborador_id IS NULL THEN
        INSERT INTO colaboradores (
            nome, 
            email, 
            auth_uid, 
            empresa_id,
            status,
            data_admissao
        ) VALUES (
            'LUCAS LUCAS',
            'lucas@qualitec.com',
            lucas_auth_uid,
            empresa_id_padrao,
            'ativo',
            CURRENT_DATE
        ) RETURNING id INTO lucas_colaborador_id;
        
        RAISE NOTICE 'Colaborador Lucas criado: %', lucas_colaborador_id;
    ELSE
        -- Atualizar colaborador existente
        UPDATE colaboradores 
        SET 
            auth_uid = lucas_auth_uid,
            empresa_id = empresa_id_padrao,
            email = COALESCE(email, 'lucas@qualitec.com')
        WHERE id = lucas_colaborador_id;
        
        RAISE NOTICE 'Colaborador Lucas atualizado: %', lucas_colaborador_id;
    END IF;
    
    -- Buscar ou criar app_user para Lucas
    SELECT id INTO lucas_app_user_id 
    FROM app_users 
    WHERE auth_uid = lucas_auth_uid;
    
    IF lucas_app_user_id IS NULL THEN
        INSERT INTO app_users (
            auth_uid,
            colaborador_id,
            nome,
            email,
            empresa_id
        ) VALUES (
            lucas_auth_uid,
            lucas_colaborador_id,
            'LUCAS LUCAS',
            'lucas@qualitec.com',
            empresa_id_padrao
        ) RETURNING id INTO lucas_app_user_id;
        
        RAISE NOTICE 'App_user Lucas criado: %', lucas_app_user_id;
    ELSE
        -- Atualizar app_user existente
        UPDATE app_users 
        SET 
            colaborador_id = lucas_colaborador_id,
            nome = 'LUCAS LUCAS',
            email = COALESCE(email, 'lucas@qualitec.com'),
            empresa_id = empresa_id_padrao
        WHERE id = lucas_app_user_id;
        
        RAISE NOTICE 'App_user Lucas atualizado: %', lucas_app_user_id;
    END IF;
    
END $$;

-- 3. Verificar resultado da correção
SELECT 
  'RESULTADO_CORRECAO_LUCAS' as status,
  au.id as app_user_id,
  au.auth_uid,
  au.colaborador_id,
  au.nome as app_user_nome,
  c.id as colaborador_id_real,
  c.nome as colaborador_nome,
  c.empresa_id,
  'VINCULO_OK' as resultado
FROM app_users au
JOIN colaboradores c ON c.id = au.colaborador_id
WHERE au.nome ILIKE '%lucas%' OR c.nome ILIKE '%lucas%';

-- 4. Limpar assinaturas fantasma do Lucas
DELETE FROM assinaturas_ponto 
WHERE colaborador_id IN (
    SELECT c.id FROM colaboradores c WHERE c.nome ILIKE '%lucas%'
) 
AND (hash_assinatura IS NULL OR hash_assinatura = '' OR LENGTH(hash_assinatura) < 10);