-- ============================================================================
-- FIX DEFINITIVO: Resolver problema empresa/empresas e configurar empresa padrão
-- ============================================================================

-- 1. Verificar se existe tabela empresa (singular)
DO $$
DECLARE
    tabela_empresa_existe BOOLEAN := FALSE;
    tabela_empresas_existe BOOLEAN := FALSE;
    total_empresa INTEGER := 0;
    empresa_id_padrao UUID;
BEGIN
    -- Verificar se tabela empresa existe
    SELECT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'empresa'
    ) INTO tabela_empresa_existe;
    
    -- Verificar se tabela empresas existe
    SELECT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'empresas'
    ) INTO tabela_empresas_existe;
    
    RAISE NOTICE 'Tabela empresa existe: %', tabela_empresa_existe;
    RAISE NOTICE 'Tabela empresas existe: %', tabela_empresas_existe;
    
    -- Se só existe empresa (singular), criar view empresas (plural)
    IF tabela_empresa_existe AND NOT tabela_empresas_existe THEN
        RAISE NOTICE 'Criando view empresas apontando para tabela empresa...';
        
        -- Criar view empresas
        EXECUTE 'CREATE VIEW empresas AS SELECT * FROM empresa';
        
        -- Criar regras para INSERT, UPDATE, DELETE na view
        EXECUTE 'CREATE RULE empresas_insert AS ON INSERT TO empresas DO INSTEAD INSERT INTO empresa VALUES (NEW.*)';
        EXECUTE 'CREATE RULE empresas_update AS ON UPDATE TO empresas DO INSTEAD UPDATE empresa SET razao_social = NEW.razao_social, nome_fantasia = NEW.nome_fantasia, cnpj = NEW.cnpj, inscricao_estadual = NEW.inscricao_estadual, inscricao_municipal = NEW.inscricao_municipal, cep = NEW.cep, logradouro = NEW.logradouro, numero = NEW.numero, complemento = NEW.complemento, bairro = NEW.bairro, cidade = NEW.cidade, estado = NEW.estado, telefone = NEW.telefone, celular = NEW.celular, email = NEW.email, site = NEW.site, banco_codigo = NEW.banco_codigo, banco_nome = NEW.banco_nome, agencia = NEW.agencia, conta = NEW.conta, responsavel_nome = NEW.responsavel_nome, responsavel_cpf = NEW.responsavel_cpf, responsavel_cargo = NEW.responsavel_cargo, responsavel_email = NEW.responsavel_email, responsavel_telefone = NEW.responsavel_telefone, logo_url = NEW.logo_url, cor_primaria = NEW.cor_primaria, cor_secundaria = NEW.cor_secundaria, updated_at = NOW() WHERE id = OLD.id';
        EXECUTE 'CREATE RULE empresas_delete AS ON DELETE TO empresas DO INSTEAD DELETE FROM empresa WHERE id = OLD.id';
        
        RAISE NOTICE '✅ View empresas criada com sucesso!';
    END IF;
    
    -- Se só existe empresas (plural), renomear para empresa e criar view
    IF tabela_empresas_existe AND NOT tabela_empresa_existe THEN
        RAISE NOTICE 'Renomeando tabela empresas para empresa...';
        EXECUTE 'ALTER TABLE empresas RENAME TO empresa';
        EXECUTE 'CREATE VIEW empresas AS SELECT * FROM empresa';
        RAISE NOTICE '✅ Tabela renomeada e view criada!';
    END IF;
    
    -- Verificar se há registros na empresa
    EXECUTE 'SELECT COUNT(*) FROM empresa' INTO total_empresa;
    RAISE NOTICE 'Total de empresas cadastradas: %', total_empresa;
    
    -- Se não há empresa, criar uma padrão
    IF total_empresa = 0 THEN
        RAISE NOTICE 'Criando empresa padrão...';
        
        INSERT INTO empresa (
            razao_social,
            nome_fantasia,
            cnpj,
            cep,
            logradouro,
            numero,
            bairro,
            cidade,
            estado,
            telefone,
            email,
            cor_primaria,
            cor_secundaria
        ) VALUES (
            'QUALITEC INDUSTRIA E COMERCIO LTDA',
            'Qualitec',
            '00.000.000/0001-00',
            '00000-000',
            'Rua Exemplo',
            '123',
            'Centro',
            'São Paulo',
            'SP',
            '(11) 0000-0000',
            'contato@qualitec.ind.br',
            '#DC2626',
            '#1F2937'
        ) RETURNING id INTO empresa_id_padrao;
        
        RAISE NOTICE '✅ Empresa padrão criada com ID: %', empresa_id_padrao;
    ELSE
        -- Pegar ID da primeira empresa
        EXECUTE 'SELECT id FROM empresa ORDER BY created_at LIMIT 1' INTO empresa_id_padrao;
        RAISE NOTICE 'Empresa padrão existente ID: %', empresa_id_padrao;
    END IF;
    
    -- Atualizar colaboradores sem empresa_id
    UPDATE colaboradores 
    SET empresa_id = empresa_id_padrao
    WHERE empresa_id IS NULL;
    
    GET DIAGNOSTICS total_empresa = ROW_COUNT;
    RAISE NOTICE 'Colaboradores atualizados com empresa_id: %', total_empresa;
    
    -- Atualizar app_users sem empresa_id
    UPDATE app_users 
    SET empresa_id = empresa_id_padrao
    WHERE empresa_id IS NULL;
    
    GET DIAGNOSTICS total_empresa = ROW_COUNT;
    RAISE NOTICE 'App_users atualizados com empresa_id: %', total_empresa;
    
END $$;

-- 2. Verificar resultado final
SELECT 
    'VERIFICACAO_FINAL' as status,
    'EMPRESA' as tabela,
    COUNT(*) as total_registros
FROM empresa

UNION ALL

SELECT 
    'VERIFICACAO_FINAL' as status,
    'COLABORADORES_SEM_EMPRESA' as tabela,
    COUNT(*) as total_registros
FROM colaboradores 
WHERE empresa_id IS NULL

UNION ALL

SELECT 
    'VERIFICACAO_FINAL' as status,
    'APP_USERS_SEM_EMPRESA' as tabela,
    COUNT(*) as total_registros
FROM app_users 
WHERE empresa_id IS NULL;

-- 3. Mostrar dados da empresa padrão
SELECT 
    'EMPRESA_PADRAO' as status,
    id,
    razao_social,
    nome_fantasia,
    cnpj,
    created_at
FROM empresa 
ORDER BY created_at 
LIMIT 1;

-- ============================================================================
-- FIM
-- ============================================================================

DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '✅ Correção da empresa padrão concluída!';
    RAISE NOTICE '📋 Tabela empresa/empresas configurada corretamente';
    RAISE NOTICE '🏢 Empresa padrão garantida';
    RAISE NOTICE '👥 Colaboradores e usuários vinculados à empresa';
    RAISE NOTICE '';
END $$;