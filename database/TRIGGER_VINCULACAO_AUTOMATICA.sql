-- TRIGGERS AUTOMÁTICOS PARA VINCULAÇÃO DE NOVOS COLABORADORES
-- Garantir que todos os novos colaboradores tenham vinculação correta

-- 1. Função para sincronizar colaborador → app_users automaticamente
CREATE OR REPLACE FUNCTION sync_colaborador_to_app_users()
RETURNS TRIGGER AS $$
DECLARE
    empresa_padrao_id UUID;
BEGIN
    -- Buscar empresa padrão
    SELECT id INTO empresa_padrao_id 
    FROM empresas 
    ORDER BY created_at ASC 
    LIMIT 1;
    
    -- Se não existe empresa, criar uma padrão
    IF empresa_padrao_id IS NULL THEN
        INSERT INTO empresas (nome, cnpj, endereco, telefone, email)
        VALUES ('Qualitec Padrão', '00.000.000/0001-00', 'Endereço Padrão', '(00) 0000-0000', 'contato@qualitec.com')
        RETURNING id INTO empresa_padrao_id;
    END IF;
    
    -- Garantir que o colaborador tem empresa_id
    IF NEW.empresa_id IS NULL THEN
        NEW.empresa_id := empresa_padrao_id;
    END IF;
    
    -- Se o colaborador tem auth_uid mas não tem app_user correspondente, criar
    IF NEW.auth_uid IS NOT NULL THEN
        INSERT INTO app_users (
            auth_uid,
            colaborador_id,
            nome,
            email,
            empresa_id
        ) VALUES (
            NEW.auth_uid,
            NEW.id,
            NEW.nome,
            COALESCE(NEW.email_corporativo, NEW.email_pessoal, NEW.nome || '@temp.com'),
            NEW.empresa_id
        )
        ON CONFLICT (auth_uid) DO UPDATE SET
            colaborador_id = NEW.id,
            nome = NEW.nome,
            email = COALESCE(NEW.email_corporativo, NEW.email_pessoal, NEW.nome || '@temp.com'),
            empresa_id = NEW.empresa_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. Trigger para novos colaboradores
DROP TRIGGER IF EXISTS trigger_sync_colaborador_insert ON colaboradores;
CREATE TRIGGER trigger_sync_colaborador_insert
    BEFORE INSERT ON colaboradores
    FOR EACH ROW
    EXECUTE FUNCTION sync_colaborador_to_app_users();

-- 3. Trigger para atualizações de colaboradores
DROP TRIGGER IF EXISTS trigger_sync_colaborador_update ON colaboradores;
CREATE TRIGGER trigger_sync_colaborador_update
    AFTER UPDATE ON colaboradores
    FOR EACH ROW
    WHEN (OLD.auth_uid IS DISTINCT FROM NEW.auth_uid OR 
          OLD.nome IS DISTINCT FROM NEW.nome OR 
          OLD.email_corporativo IS DISTINCT FROM NEW.email_corporativo)
    EXECUTE FUNCTION sync_colaborador_to_app_users();

-- 4. Função para sincronizar app_users → colaboradores
CREATE OR REPLACE FUNCTION sync_app_users_to_colaborador()
RETURNS TRIGGER AS $$
BEGIN
    -- Se app_user tem colaborador_id, sincronizar dados
    IF NEW.colaborador_id IS NOT NULL THEN
        UPDATE colaboradores 
        SET 
            auth_uid = NEW.auth_uid,
            nome = COALESCE(colaboradores.nome, NEW.nome),
            email_corporativo = COALESCE(colaboradores.email_corporativo, NEW.email)
        WHERE id = NEW.colaborador_id
        AND auth_uid IS NULL; -- Só atualizar se não tem auth_uid ainda
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 5. Trigger para app_users
DROP TRIGGER IF EXISTS trigger_sync_app_users ON app_users;
CREATE TRIGGER trigger_sync_app_users
    AFTER INSERT OR UPDATE ON app_users
    FOR EACH ROW
    WHEN (NEW.colaborador_id IS NOT NULL)
    EXECUTE FUNCTION sync_app_users_to_colaborador();

-- 6. Função para garantir empresa_id em todas as tabelas relacionadas
CREATE OR REPLACE FUNCTION ensure_empresa_id()
RETURNS TRIGGER AS $$
DECLARE
    empresa_padrao_id UUID;
BEGIN
    -- Se já tem empresa_id, não fazer nada
    IF NEW.empresa_id IS NOT NULL THEN
        RETURN NEW;
    END IF;
    
    -- Buscar empresa padrão
    SELECT id INTO empresa_padrao_id 
    FROM empresas 
    ORDER BY created_at ASC 
    LIMIT 1;
    
    -- Se não existe, criar
    IF empresa_padrao_id IS NULL THEN
        INSERT INTO empresas (nome, cnpj, endereco, telefone, email)
        VALUES ('Qualitec Padrão', '00.000.000/0001-00', 'Endereço Padrão', '(00) 0000-0000', 'contato@qualitec.com')
        RETURNING id INTO empresa_padrao_id;
    END IF;
    
    NEW.empresa_id := empresa_padrao_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 7. Aplicar trigger de empresa_id em tabelas relevantes (se ainda existir a coluna)
DO $$
BEGIN
    -- Verificar se app_users ainda tem empresa_id
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'app_users' AND column_name = 'empresa_id'
    ) THEN
        DROP TRIGGER IF EXISTS trigger_ensure_empresa_id_app_users ON app_users;
        CREATE TRIGGER trigger_ensure_empresa_id_app_users
            BEFORE INSERT ON app_users
            FOR EACH ROW
            EXECUTE FUNCTION ensure_empresa_id();
    END IF;
    
    -- Colaboradores sempre deve ter empresa_id
    DROP TRIGGER IF EXISTS trigger_ensure_empresa_id_colaboradores ON colaboradores;
    CREATE TRIGGER trigger_ensure_empresa_id_colaboradores
        BEFORE INSERT ON colaboradores
        FOR EACH ROW
        EXECUTE FUNCTION ensure_empresa_id();
END $$;