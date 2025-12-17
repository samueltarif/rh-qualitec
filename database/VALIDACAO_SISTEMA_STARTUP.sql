-- ============================================================================
-- VALIDAÇÃO DO SISTEMA NO STARTUP
-- ============================================================================
-- Este script deve ser executado sempre que o sistema iniciar
-- para garantir que não há inconsistências
-- ============================================================================

-- 1. VERIFICAR E CORRIGIR ESTRUTURA BÁSICA
DO $$
DECLARE
    empresa_count INTEGER := 0;
    colaboradores_sem_empresa INTEGER := 0;
    app_users_orfaos INTEGER := 0;
    empresa_id_padrao UUID;
BEGIN
    RAISE NOTICE '🔍 Iniciando validação do sistema...';
    
    -- Verificar se existe pelo menos uma empresa
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'empresas') THEN
        SELECT COUNT(*) INTO empresa_count FROM empresas;
    ELSIF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'empresa') THEN
        SELECT COUNT(*) INTO empresa_count FROM empresa;
    END IF;
    
    RAISE NOTICE 'Empresas encontradas: %', empresa_count;
    
    -- Se não há empresa, criar uma padrão
    IF empresa_count = 0 THEN
        RAISE NOTICE '⚠️  Criando empresa padrão...';
        
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'empresas') THEN
            INSERT INTO empresas (razao_social, nome_fantasia, cnpj, email, cor_primaria, cor_secundaria)
            VALUES ('EMPRESA PADRÃO', 'Empresa Padrão', '00.000.000/0001-00', 'contato@empresa.com', '#DC2626', '#1F2937')
            RETURNING id INTO empresa_id_padrao;
        ELSIF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'empresa') THEN
            INSERT INTO empresa (razao_social, nome_fantasia, cnpj, email, cor_primaria, cor_secundaria)
            VALUES ('EMPRESA PADRÃO', 'Empresa Padrão', '00.000.000/0001-00', 'contato@empresa.com', '#DC2626', '#1F2937')
            RETURNING id INTO empresa_id_padrao;
        END IF;
        
        RAISE NOTICE '✅ Empresa padrão criada: %', empresa_id_padrao;
    ELSE
        -- Pegar ID da primeira empresa
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'empresas') THEN
            SELECT id INTO empresa_id_padrao FROM empresas ORDER BY created_at LIMIT 1;
        ELSIF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'empresa') THEN
            SELECT id INTO empresa_id_padrao FROM empresa ORDER BY created_at LIMIT 1;
        END IF;
    END IF;
    
    -- Verificar colaboradores sem empresa
    SELECT COUNT(*) INTO colaboradores_sem_empresa 
    FROM colaboradores 
    WHERE empresa_id IS NULL;
    
    IF colaboradores_sem_empresa > 0 THEN
        RAISE NOTICE '⚠️  Corrigindo % colaboradores sem empresa...', colaboradores_sem_empresa;
        
        UPDATE colaboradores 
        SET empresa_id = empresa_id_padrao
        WHERE empresa_id IS NULL;
        
        RAISE NOTICE '✅ Colaboradores corrigidos';
    END IF;
    
    -- Verificar app_users órfãos (sem colaborador_id)
    SELECT COUNT(*) INTO app_users_orfaos 
    FROM app_users 
    WHERE colaborador_id IS NULL;
    
    IF app_users_orfaos > 1 THEN -- 1 órfão é aceitável (admin)
        RAISE NOTICE 'ℹ️  Encontrados % app_users órfãos (acima do esperado)', app_users_orfaos;
    END IF;
    
    -- Verificar e corrigir app_users sem empresa_id
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'app_users' AND column_name = 'empresa_id'
    ) THEN
        UPDATE app_users 
        SET empresa_id = empresa_id_padrao
        WHERE empresa_id IS NULL;
    END IF;
    
    RAISE NOTICE '✅ Validação do sistema concluída';
END $$;

-- 2. VERIFICAR TRIGGERS ESSENCIAIS
DO $$
DECLARE
    trigger_count INTEGER;
BEGIN
    -- Verificar se triggers de prevenção existem
    SELECT COUNT(*) INTO trigger_count
    FROM information_schema.triggers 
    WHERE trigger_name IN (
        'trigger_criar_app_user_colaborador',
        'trigger_validar_colaborador',
        'trigger_sincronizar_colaborador'
    );
    
    IF trigger_count < 3 THEN
        RAISE NOTICE '⚠️  Alguns triggers de prevenção não estão ativos';
        RAISE NOTICE 'Execute: TRIGGER_PREVENCAO_ERROS_COLABORADORES.sql';
    ELSE
        RAISE NOTICE '✅ Triggers de prevenção ativos';
    END IF;
END $$;

-- 3. VERIFICAR FUNÇÕES ESSENCIAIS
DO $$
DECLARE
    function_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO function_count
    FROM information_schema.routines 
    WHERE routine_name IN (
        'garantir_empresa_padrao',
        'corrigir_inconsistencias_colaboradores'
    );
    
    IF function_count < 2 THEN
        RAISE NOTICE '⚠️  Algumas funções de prevenção não existem';
        RAISE NOTICE 'Execute: TRIGGER_PREVENCAO_ERROS_COLABORADORES.sql';
    ELSE
        RAISE NOTICE '✅ Funções de prevenção disponíveis';
    END IF;
END $$;

-- 4. RELATÓRIO FINAL DE STATUS
SELECT 
    'SISTEMA_STATUS' as categoria,
    'EMPRESAS' as item,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'empresas') 
        THEN (SELECT COUNT(*) FROM empresas)
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'empresa') 
        THEN (SELECT COUNT(*) FROM empresa)
        ELSE 0
    END as quantidade,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'empresas') 
        THEN (SELECT COUNT(*) FROM empresas) > 0
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'empresa') 
        THEN (SELECT COUNT(*) FROM empresa) > 0
        ELSE false
    END as status_ok

UNION ALL

SELECT 
    'SISTEMA_STATUS' as categoria,
    'COLABORADORES_SEM_EMPRESA' as item,
    COUNT(*) as quantidade,
    COUNT(*) = 0 as status_ok
FROM colaboradores 
WHERE empresa_id IS NULL

UNION ALL

SELECT 
    'SISTEMA_STATUS' as categoria,
    'APP_USERS_ORFAOS' as item,
    COUNT(*) as quantidade,
    COUNT(*) <= 1 as status_ok -- 1 órfão é aceitável
FROM app_users 
WHERE colaborador_id IS NULL

UNION ALL

SELECT 
    'SISTEMA_STATUS' as categoria,
    'TRIGGERS_PREVENCAO' as item,
    COUNT(*) as quantidade,
    COUNT(*) >= 3 as status_ok
FROM information_schema.triggers 
WHERE trigger_name IN (
    'trigger_criar_app_user_colaborador',
    'trigger_validar_colaborador', 
    'trigger_sincronizar_colaborador'
);

-- ============================================================================
-- MENSAGEM FINAL
-- ============================================================================

DO $$
DECLARE
    problemas_encontrados INTEGER := 0;
    total_colaboradores INTEGER;
    total_empresas INTEGER;
BEGIN
    -- Contar problemas
    SELECT COUNT(*) INTO problemas_encontrados
    FROM (
        SELECT 1 FROM colaboradores WHERE empresa_id IS NULL
        UNION ALL
        SELECT 1 FROM app_users WHERE colaborador_id IS NULL AND id NOT IN (
            SELECT id FROM app_users WHERE role = 'admin' LIMIT 1
        )
    ) problemas;
    
    -- Estatísticas gerais
    SELECT COUNT(*) INTO total_colaboradores FROM colaboradores;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'empresas') THEN
        SELECT COUNT(*) INTO total_empresas FROM empresas;
    ELSIF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'empresa') THEN
        SELECT COUNT(*) INTO total_empresas FROM empresa;
    ELSE
        total_empresas := 0;
    END IF;
    
    RAISE NOTICE '';
    RAISE NOTICE '==================== RELATÓRIO FINAL ====================';
    RAISE NOTICE 'Total de empresas: %', total_empresas;
    RAISE NOTICE 'Total de colaboradores: %', total_colaboradores;
    RAISE NOTICE 'Problemas encontrados: %', problemas_encontrados;
    RAISE NOTICE '';
    
    IF problemas_encontrados = 0 AND total_empresas > 0 THEN
        RAISE NOTICE '🎉 SISTEMA ÍNTEGRO - Pronto para uso!';
    ELSE
        RAISE NOTICE '⚠️  ATENÇÃO - Execute os scripts de correção necessários';
    END IF;
    
    RAISE NOTICE '========================================================';
    RAISE NOTICE '';
END $$;