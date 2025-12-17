-- ============================================================================
-- TRIGGER DE PREVENÇÃO DE ERROS AO CRIAR COLABORADORES
-- ============================================================================
-- Este script cria triggers e funções para garantir consistência automática
-- ============================================================================

-- 1. FUNÇÃO PARA GARANTIR EMPRESA PADRÃO
CREATE OR REPLACE FUNCTION garantir_empresa_padrao()
RETURNS UUID
LANGUAGE plpgsql
AS $$
DECLARE
    empresa_id_padrao UUID;
BEGIN
    -- Tentar pegar empresa existente
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'empresas') THEN
        SELECT id INTO empresa_id_padrao FROM empresas ORDER BY created_at LIMIT 1;
    ELSIF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'empresa') THEN
        SELECT id INTO empresa_id_padrao FROM empresa ORDER BY created_at LIMIT 1;
    END IF;
    
    -- Se não existe empresa, criar uma
    IF empresa_id_padrao IS NULL THEN
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'empresas') THEN
            INSERT INTO empresas (razao_social, nome_fantasia, cnpj, email, cor_primaria, cor_secundaria)
            VALUES ('EMPRESA PADRÃO', 'Empresa Padrão', '00.000.000/0001-00', 'contato@empresa.com', '#DC2626', '#1F2937')
            RETURNING id INTO empresa_id_padrao;
        ELSIF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'empresa') THEN
            INSERT INTO empresa (razao_social, nome_fantasia, cnpj, email, cor_primaria, cor_secundaria)
            VALUES ('EMPRESA PADRÃO', 'Empresa Padrão', '00.000.000/0001-00', 'contato@empresa.com', '#DC2626', '#1F2937')
            RETURNING id INTO empresa_id_padrao;
        END IF;
    END IF;
    
    RETURN empresa_id_padrao;
END;
$$;

-- 2. FUNÇÃO PARA CRIAR APP_USER AUTOMATICAMENTE
CREATE OR REPLACE FUNCTION criar_app_user_para_colaborador()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
    empresa_id_padrao UUID;
    user_email TEXT;
BEGIN
    -- Garantir que tem empresa_id
    IF NEW.empresa_id IS NULL THEN
        NEW.empresa_id := garantir_empresa_padrao();
    END IF;
    
    -- Se tem auth_uid mas não tem app_user correspondente, criar
    IF NEW.auth_uid IS NOT NULL THEN
        IF NOT EXISTS (SELECT 1 FROM app_users WHERE auth_uid = NEW.auth_uid) THEN
            -- Gerar email se não existir
            user_email := COALESCE(
                (SELECT email FROM auth.users WHERE id = NEW.auth_uid),
                LOWER(REPLACE(NEW.nome, ' ', '.')) || '@empresa.com'
            );
            
            INSERT INTO app_users (
                auth_uid,
                colaborador_id,
                nome,
                email,
                empresa_id,
                role,
                ativo
            ) VALUES (
                NEW.auth_uid,
                NEW.id,
                NEW.nome,
                user_email,
                NEW.empresa_id,
                'funcionario',
                true
            );
        ELSE
            -- Atualizar app_user existente com colaborador_id
            UPDATE app_users 
            SET 
                colaborador_id = NEW.id,
                nome = NEW.nome,
                empresa_id = NEW.empresa_id
            WHERE auth_uid = NEW.auth_uid 
            AND colaborador_id IS NULL;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$;

-- 3. FUNÇÃO PARA SINCRONIZAR ALTERAÇÕES
CREATE OR REPLACE FUNCTION sincronizar_colaborador_app_user()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    -- Sincronizar mudanças no colaborador para app_user
    IF NEW.auth_uid IS NOT NULL THEN
        UPDATE app_users 
        SET 
            nome = NEW.nome,
            empresa_id = NEW.empresa_id
        WHERE auth_uid = NEW.auth_uid;
    END IF;
    
    RETURN NEW;
END;
$$;

-- 4. CRIAR TRIGGERS
DROP TRIGGER IF EXISTS trigger_criar_app_user_colaborador ON colaboradores;
CREATE TRIGGER trigger_criar_app_user_colaborador
    BEFORE INSERT ON colaboradores
    FOR EACH ROW
    EXECUTE FUNCTION criar_app_user_para_colaborador();

DROP TRIGGER IF EXISTS trigger_sincronizar_colaborador ON colaboradores;
CREATE TRIGGER trigger_sincronizar_colaborador
    AFTER UPDATE ON colaboradores
    FOR EACH ROW
    EXECUTE FUNCTION sincronizar_colaborador_app_user();

-- 5. FUNÇÃO PARA VALIDAR DADOS ANTES DE INSERIR
CREATE OR REPLACE FUNCTION validar_colaborador()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    -- Garantir que nome não é vazio
    IF NEW.nome IS NULL OR TRIM(NEW.nome) = '' THEN
        RAISE EXCEPTION 'Nome do colaborador é obrigatório';
    END IF;
    
    -- Garantir que tem empresa_id
    IF NEW.empresa_id IS NULL THEN
        NEW.empresa_id := garantir_empresa_padrao();
    END IF;
    
    -- Garantir status padrão
    IF NEW.status IS NULL THEN
        NEW.status := 'ativo';
    END IF;
    
    -- Garantir data de admissão
    IF NEW.data_admissao IS NULL THEN
        NEW.data_admissao := CURRENT_DATE;
    END IF;
    
    RETURN NEW;
END;
$$;

-- 6. TRIGGER DE VALIDAÇÃO
DROP TRIGGER IF EXISTS trigger_validar_colaborador ON colaboradores;
CREATE TRIGGER trigger_validar_colaborador
    BEFORE INSERT OR UPDATE ON colaboradores
    FOR EACH ROW
    EXECUTE FUNCTION validar_colaborador();

-- 7. FUNÇÃO PARA CORRIGIR INCONSISTÊNCIAS EXISTENTES
CREATE OR REPLACE FUNCTION corrigir_inconsistencias_colaboradores()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
    empresa_id_padrao UUID;
    total_corrigidos INTEGER := 0;
    resultado TEXT;
BEGIN
    -- Garantir empresa padrão
    empresa_id_padrao := garantir_empresa_padrao();
    
    -- Corrigir colaboradores sem empresa_id
    UPDATE colaboradores 
    SET empresa_id = empresa_id_padrao
    WHERE empresa_id IS NULL;
    
    GET DIAGNOSTICS total_corrigidos = ROW_COUNT;
    resultado := 'Colaboradores sem empresa corrigidos: ' || total_corrigidos || E'\n';
    
    -- Corrigir app_users sem empresa_id
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'app_users' AND column_name = 'empresa_id'
    ) THEN
        UPDATE app_users 
        SET empresa_id = empresa_id_padrao
        WHERE empresa_id IS NULL;
        
        GET DIAGNOSTICS total_corrigidos = ROW_COUNT;
        resultado := resultado || 'App_users sem empresa corrigidos: ' || total_corrigidos || E'\n';
    END IF;
    
    -- Corrigir vínculos auth_uid
    UPDATE colaboradores 
    SET auth_uid = au.auth_uid
    FROM app_users au 
    WHERE colaboradores.id = au.colaborador_id 
    AND colaboradores.auth_uid IS NULL 
    AND au.auth_uid IS NOT NULL;
    
    GET DIAGNOSTICS total_corrigidos = ROW_COUNT;
    resultado := resultado || 'Vínculos auth_uid corrigidos: ' || total_corrigidos || E'\n';
    
    -- Criar app_users para colaboradores órfãos
    INSERT INTO app_users (auth_uid, colaborador_id, nome, email, empresa_id, role, ativo)
    SELECT 
        c.auth_uid,
        c.id,
        c.nome,
        LOWER(REPLACE(c.nome, ' ', '.')) || '@empresa.com',
        c.empresa_id,
        'funcionario',
        true
    FROM colaboradores c
    LEFT JOIN app_users au ON au.colaborador_id = c.id
    WHERE au.id IS NULL AND c.auth_uid IS NOT NULL;
    
    GET DIAGNOSTICS total_corrigidos = ROW_COUNT;
    resultado := resultado || 'App_users criados para colaboradores órfãos: ' || total_corrigidos;
    
    RETURN resultado;
END;
$$;

-- 8. EXECUTAR CORREÇÃO INICIAL
SELECT corrigir_inconsistencias_colaboradores() as resultado_correcao;

-- 9. CRIAR ÍNDICES PARA PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_colaboradores_auth_uid ON colaboradores(auth_uid);
CREATE INDEX IF NOT EXISTS idx_colaboradores_empresa_id ON colaboradores(empresa_id);
CREATE INDEX IF NOT EXISTS idx_app_users_colaborador_id ON app_users(colaborador_id);
CREATE INDEX IF NOT EXISTS idx_app_users_auth_uid ON app_users(auth_uid);

-- ============================================================================
-- VERIFICAÇÃO FINAL
-- ============================================================================

-- Verificar se tudo está funcionando
SELECT 
    'VERIFICACAO_TRIGGERS' as status,
    COUNT(*) as total_colaboradores,
    COUNT(CASE WHEN empresa_id IS NOT NULL THEN 1 END) as com_empresa,
    COUNT(CASE WHEN auth_uid IS NOT NULL THEN 1 END) as com_auth_uid
FROM colaboradores;

-- ============================================================================
-- FIM
-- ============================================================================

DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '✅ Sistema de prevenção de erros implementado!';
    RAISE NOTICE '🔧 Triggers criados para garantir consistência automática';
    RAISE NOTICE '🛡️  Validações implementadas para novos colaboradores';
    RAISE NOTICE '🔄 Função de correção automática disponível';
    RAISE NOTICE '';
    RAISE NOTICE 'Funções disponíveis:';
    RAISE NOTICE '- garantir_empresa_padrao(): Garante empresa padrão';
    RAISE NOTICE '- corrigir_inconsistencias_colaboradores(): Corrige problemas';
    RAISE NOTICE '';
END $$;