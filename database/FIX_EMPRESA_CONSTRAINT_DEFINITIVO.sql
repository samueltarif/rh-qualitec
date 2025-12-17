-- ============================================================================
-- FIX DEFINITIVO: Resolver constraints de foreign key empresa/empresas
-- ============================================================================

-- 1. Primeiro, verificar a situação atual
DO $$
DECLARE
    tabela_empresa_existe BOOLEAN := FALSE;
    tabela_empresas_existe BOOLEAN := FALSE;
    view_empresas_existe BOOLEAN := FALSE;
BEGIN
    -- Verificar se tabela empresa existe
    SELECT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'empresa' AND table_type = 'BASE TABLE'
    ) INTO tabela_empresa_existe;
    
    -- Verificar se tabela empresas existe
    SELECT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'empresas' AND table_type = 'BASE TABLE'
    ) INTO tabela_empresas_existe;
    
    -- Verificar se view empresas existe
    SELECT EXISTS (
        SELECT 1 FROM information_schema.views 
        WHERE table_name = 'empresas'
    ) INTO view_empresas_existe;
    
    RAISE NOTICE 'Tabela empresa existe: %', tabela_empresa_existe;
    RAISE NOTICE 'Tabela empresas existe: %', tabela_empresas_existe;
    RAISE NOTICE 'View empresas existe: %', view_empresas_existe;
    
    -- Se existe tabela empresa mas não empresas, renomear empresa para empresas
    IF tabela_empresa_existe AND NOT tabela_empresas_existe THEN
        RAISE NOTICE 'Renomeando tabela empresa para empresas...';
        
        -- Remover view se existir
        IF view_empresas_existe THEN
            DROP VIEW IF EXISTS empresas CASCADE;
            RAISE NOTICE 'View empresas removida';
        END IF;
        
        -- Renomear tabela
        ALTER TABLE empresa RENAME TO empresas;
        RAISE NOTICE '✅ Tabela empresa renomeada para empresas!';
    END IF;
    
END $$;

-- 2. Garantir que existe pelo menos uma empresa
DO $$
DECLARE
    total_empresas INTEGER := 0;
    empresa_id_padrao UUID;
BEGIN
    -- Verificar quantas empresas existem
    SELECT COUNT(*) INTO total_empresas FROM empresas;
    RAISE NOTICE 'Total de empresas: %', total_empresas;
    
    -- Se não há empresa, criar uma padrão
    IF total_empresas = 0 THEN
        RAISE NOTICE 'Criando empresa padrão...';
        
        INSERT INTO empresas (
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
        SELECT id INTO empresa_id_padrao FROM empresas ORDER BY created_at LIMIT 1;
        RAISE NOTICE 'Empresa padrão existente ID: %', empresa_id_padrao;
    END IF;
    
    -- Atualizar colaboradores sem empresa_id
    UPDATE colaboradores 
    SET empresa_id = empresa_id_padrao
    WHERE empresa_id IS NULL;
    
    GET DIAGNOSTICS total_empresas = ROW_COUNT;
    RAISE NOTICE 'Colaboradores atualizados com empresa_id: %', total_empresas;
    
    -- Atualizar app_users sem empresa_id (se a coluna existir)
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'app_users' AND column_name = 'empresa_id'
    ) THEN
        UPDATE app_users 
        SET empresa_id = empresa_id_padrao
        WHERE empresa_id IS NULL;
        
        GET DIAGNOSTICS total_empresas = ROW_COUNT;
        RAISE NOTICE 'App_users atualizados com empresa_id: %', total_empresas;
    ELSE
        RAISE NOTICE 'Coluna empresa_id não existe em app_users - pulando atualização';
    END IF;
    
END $$;

-- 3. Verificar resultado final
SELECT 
    'VERIFICACAO_FINAL' as status,
    'EMPRESAS' as tabela,
    COUNT(*) as total_registros
FROM empresas

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
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'app_users' AND column_name = 'empresa_id'
        ) THEN (SELECT COUNT(*) FROM app_users WHERE empresa_id IS NULL)
        ELSE 0
    END as total_registros;

-- 4. Mostrar dados da empresa padrão
SELECT 
    'EMPRESA_PADRAO' as status,
    id,
    razao_social,
    nome_fantasia,
    cnpj,
    created_at
FROM empresas 
ORDER BY created_at 
LIMIT 1;

-- ============================================================================
-- FIM
-- ============================================================================

DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '✅ Correção das constraints de empresa concluída!';
    RAISE NOTICE '📋 Tabela empresas configurada corretamente';
    RAISE NOTICE '🏢 Empresa padrão garantida';
    RAISE NOTICE '👥 Colaboradores e usuários vinculados à empresa';
    RAISE NOTICE '';
END $$;