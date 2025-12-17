-- =====================================================
-- FIX CRÍTICO: CRIAÇÃO DE COLABORADORES
-- =====================================================
-- Este script corrige problemas na criação de colaboradores
-- e garante vinculação automática com app_users

-- 1. VERIFICAR E CORRIGIR ESTRUTURA DA TABELA COLABORADORES
-- =====================================================

-- Garantir que a tabela colaboradores tem ID como UUID com default
DO $$
BEGIN
    -- Verificar se a coluna id existe e tem o tipo correto
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'colaboradores' 
        AND column_name = 'id' 
        AND data_type = 'uuid'
    ) THEN
        -- Se não existe ou não é UUID, corrigir
        ALTER TABLE colaboradores 
        ALTER COLUMN id SET DATA TYPE uuid USING id::uuid,
        ALTER COLUMN id SET DEFAULT gen_random_uuid();
    END IF;
    
    -- Garantir que empresa_id não é obrigatório (pode ser NULL temporariamente)
    ALTER TABLE colaboradores ALTER COLUMN empresa_id DROP NOT NULL;
    
    RAISE NOTICE 'Estrutura da tabela colaboradores verificada e corrigida';
END $$;

-- 2. GARANTIR EMPRESA PADRÃO
-- =====================================================

-- Função para garantir empresa padrão
CREATE OR REPLACE FUNCTION garantir_empresa_padrao()
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    empresa_id_result uuid;
BEGIN
    -- Tentar buscar empresa existente
    SELECT id INTO empresa_id_result 
    FROM empresa 
    LIMIT 1;
    
    -- Se não encontrou, criar empresa padrão
    IF empresa_id_result IS NULL THEN
        INSERT INTO empresa (
            nome, 
            cnpj, 
            razao_social,
            created_at,
            updated_at
        ) VALUES (
            'Empresa Padrão',
            '00000000000100',
            'Empresa Padrão LTDA',
            NOW(),
            NOW()
        ) RETURNING id INTO empresa_id_result;
        
        RAISE NOTICE 'Empresa padrão criada com ID: %', empresa_id_result;
    END IF;
    
    RETURN empresa_id_result;
END $$;

-- 3. TRIGGER PARA VINCULAÇÃO AUTOMÁTICA
-- =====================================================

-- Função para criar app_user automaticamente
CREATE OR REPLACE FUNCTION criar_app_user_automatico()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    email_temp text;
    empresa_id_val uuid;
BEGIN
    -- Garantir empresa_id
    IF NEW.empresa_id IS NULL THEN
        NEW.empresa_id := garantir_empresa_padrao();
    END IF;
    
    empresa_id_val := NEW.empresa_id;
    
    -- Gerar email temporário se não fornecido
    email_temp := COALESCE(
        NEW.email_corporativo,
        NEW.email_pessoal,
        LOWER(REPLACE(NEW.nome, ' ', '.')) || '@temp.com'
    );
    
    -- Criar app_user se não existir
    INSERT INTO app_users (
        colaborador_id,
        nome,
        email,
        empresa_id,
        created_at,
        updated_at
    ) VALUES (
        NEW.id,
        NEW.nome,
        email_temp,
        empresa_id_val,
        NOW(),
        NOW()
    ) ON CONFLICT (colaborador_id) DO NOTHING;
    
    RAISE NOTICE 'App_user criado/atualizado para colaborador: % (ID: %)', NEW.nome, NEW.id;
    
    RETURN NEW;
END $$;

-- Remover trigger existente se houver
DROP TRIGGER IF EXISTS trigger_criar_app_user_automatico ON colaboradores;

-- Criar novo trigger
CREATE TRIGGER trigger_criar_app_user_automatico
    AFTER INSERT ON colaboradores
    FOR EACH ROW
    EXECUTE FUNCTION criar_app_user_automatico();

-- 4. CORRIGIR COLABORADORES EXISTENTES SEM APP_USER
-- =====================================================

-- Criar app_users para colaboradores que não têm
INSERT INTO app_users (
    colaborador_id,
    nome,
    email,
    empresa_id,
    created_at,
    updated_at
)
SELECT 
    c.id,
    c.nome,
    COALESCE(
        c.email_corporativo,
        c.email_pessoal,
        LOWER(REPLACE(c.nome, ' ', '.')) || '@temp.com'
    ) as email,
    COALESCE(c.empresa_id, garantir_empresa_padrao()) as empresa_id,
    NOW(),
    NOW()
FROM colaboradores c
LEFT JOIN app_users au ON au.colaborador_id = c.id
WHERE au.id IS NULL
ON CONFLICT (colaborador_id) DO NOTHING;

-- 5. VERIFICAÇÕES FINAIS
-- =====================================================

-- Verificar se todos os colaboradores têm app_user
DO $$
DECLARE
    colaboradores_sem_app_user integer;
BEGIN
    SELECT COUNT(*) INTO colaboradores_sem_app_user
    FROM colaboradores c
    LEFT JOIN app_users au ON au.colaborador_id = c.id
    WHERE au.id IS NULL;
    
    IF colaboradores_sem_app_user > 0 THEN
        RAISE WARNING 'Ainda existem % colaboradores sem app_user', colaboradores_sem_app_user;
    ELSE
        RAISE NOTICE 'Todos os colaboradores têm app_user vinculado';
    END IF;
END $$;

-- Verificar estrutura final
SELECT 
    'colaboradores' as tabela,
    COUNT(*) as total_registros
FROM colaboradores
UNION ALL
SELECT 
    'app_users' as tabela,
    COUNT(*) as total_registros
FROM app_users;

RAISE NOTICE 'FIX DE CRIAÇÃO DE COLABORADORES CONCLUÍDO COM SUCESSO!';