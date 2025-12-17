-- FIX COMPLETO - EMPRESA_ID E VINCULAÇÕES
-- Corrigir todos os problemas de vinculação após remoção do empresa_id

-- 1. Obter ID da empresa padrão
DO $$
DECLARE
    empresa_padrao_id UUID;
BEGIN
    -- Buscar primeira empresa (Qualitec)
    SELECT id INTO empresa_padrao_id 
    FROM empresas 
    ORDER BY created_at ASC 
    LIMIT 1;
    
    -- Se não existir empresa, criar uma
    IF empresa_padrao_id IS NULL THEN
        INSERT INTO empresas (nome, cnpj, endereco, telefone, email)
        VALUES ('Qualitec Padrão', '00.000.000/0001-00', 'Endereço Padrão', '(00) 0000-0000', 'contato@qualitec.com')
        RETURNING id INTO empresa_padrao_id;
        
        RAISE NOTICE 'Empresa padrão criada: %', empresa_padrao_id;
    END IF;
    
    -- 2. Corrigir colaboradores sem empresa_id
    UPDATE colaboradores 
    SET empresa_id = empresa_padrao_id
    WHERE empresa_id IS NULL;
    
    RAISE NOTICE 'Colaboradores atualizados com empresa_id: %', empresa_padrao_id;
    
    -- 3. Verificar se app_users ainda tem empresa_id
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'app_users' AND column_name = 'empresa_id'
    ) THEN
        -- Se ainda existe, atualizar
        UPDATE app_users 
        SET empresa_id = empresa_padrao_id
        WHERE empresa_id IS NULL;
        
        RAISE NOTICE 'App_users atualizados com empresa_id: %', empresa_padrao_id;
    END IF;
    
END $$;

-- 4. Corrigir vínculos quebrados - app_users sem colaborador_id
UPDATE app_users 
SET colaborador_id = (
    SELECT c.id 
    FROM colaboradores c 
    WHERE c.email = app_users.email 
    OR c.nome ILIKE '%' || SPLIT_PART(app_users.nome, ' ', 1) || '%'
    LIMIT 1
)
WHERE colaborador_id IS NULL 
AND EXISTS (
    SELECT 1 FROM colaboradores c 
    WHERE c.email = app_users.email 
    OR c.nome ILIKE '%' || SPLIT_PART(app_users.nome, ' ', 1) || '%'
);

-- 5. Corrigir colaboradores sem auth_uid
UPDATE colaboradores 
SET auth_uid = (
    SELECT au.auth_uid 
    FROM app_users au 
    WHERE au.colaborador_id = colaboradores.id
    LIMIT 1
)
WHERE auth_uid IS NULL 
AND EXISTS (
    SELECT 1 FROM app_users au 
    WHERE au.colaborador_id = colaboradores.id
);

-- 6. Criar app_users para colaboradores órfãos
INSERT INTO app_users (auth_uid, colaborador_id, nome, email, empresa_id)
SELECT 
    c.auth_uid,
    c.id,
    c.nome,
    COALESCE(c.email, c.nome || '@temp.com'),
    c.empresa_id
FROM colaboradores c
LEFT JOIN app_users au ON au.colaborador_id = c.id
WHERE au.id IS NULL 
AND c.auth_uid IS NOT NULL;

-- 7. Verificar resultado final
SELECT 
  'RESULTADO_FINAL' as status,
  (SELECT COUNT(*) FROM colaboradores WHERE empresa_id IS NULL) as colaboradores_sem_empresa,
  (SELECT COUNT(*) FROM app_users WHERE colaborador_id IS NULL) as app_users_sem_colaborador,
  (SELECT COUNT(*) FROM colaboradores c LEFT JOIN app_users au ON au.colaborador_id = c.id WHERE au.id IS NULL) as colaboradores_sem_app_user;