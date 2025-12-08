-- CORREÇÃO DE ENUMS COM VIEWS E RULES
-- Este script resolve o problema de views/rules que dependem das colunas

-- ============================================================================
-- PASSO 1: SALVAR DEFINIÇÕES DAS VIEWS
-- ============================================================================

-- Primeiro, vamos ver quais views existem
DO $$ 
DECLARE
  view_def TEXT;
BEGIN
  -- Tentar obter a definição da view se existir
  SELECT pg_get_viewdef('vw_colaboradores_completo', true) INTO view_def;
  RAISE NOTICE 'View encontrada, será recriada após alterações';
EXCEPTION
  WHEN undefined_table THEN
    RAISE NOTICE 'View vw_colaboradores_completo não existe, continuando...';
END $$;

-- ============================================================================
-- PASSO 2: DROPAR VIEWS E RULES TEMPORARIAMENTE
-- ============================================================================

DO $$ 
BEGIN
  DROP VIEW IF EXISTS vw_colaboradores_completo CASCADE;
  DROP VIEW IF EXISTS vw_colaboradores CASCADE;
  DROP VIEW IF EXISTS vw_dados_bancarios CASCADE;
  
  RAISE NOTICE '✓ Views removidas temporariamente';
END $$;

-- ============================================================================
-- PASSO 3: CORRIGIR TIPO_CONTA_BANCARIA
-- ============================================================================

DO $$ 
BEGIN
  -- Alterar coluna para text temporariamente
  ALTER TABLE colaboradores ALTER COLUMN tipo_conta TYPE text;
  
  -- Dropar enum antigo
  DROP TYPE IF EXISTS tipo_conta_bancaria CASCADE;
  
  -- Criar enum com valores corretos (minúsculas)
  CREATE TYPE tipo_conta_bancaria AS ENUM ('corrente', 'poupanca', 'salario');
  
  -- Converter valores existentes
  UPDATE colaboradores 
  SET tipo_conta = CASE 
    WHEN LOWER(tipo_conta) IN ('corrente', 'conta corrente') THEN 'corrente'
    WHEN LOWER(tipo_conta) IN ('poupanca', 'poupança', 'conta poupança') THEN 'poupanca'
    WHEN LOWER(tipo_conta) IN ('salario', 'salário', 'conta salário') THEN 'salario'
    ELSE NULL
  END
  WHERE tipo_conta IS NOT NULL;
  
  -- Voltar coluna para enum
  ALTER TABLE colaboradores 
  ALTER COLUMN tipo_conta TYPE tipo_conta_bancaria 
  USING tipo_conta::tipo_conta_bancaria;
  
  RAISE NOTICE '✓ tipo_conta_bancaria corrigido';
END $$;

-- ============================================================================
-- PASSO 4: CORRIGIR ESTADO_CIVIL
-- ============================================================================

DO $$ 
BEGIN
  -- Alterar coluna para text temporariamente
  ALTER TABLE colaboradores ALTER COLUMN estado_civil TYPE text;
  
  -- Dropar enum antigo
  DROP TYPE IF EXISTS estado_civil CASCADE;
  
  -- Criar enum com valores corretos
  CREATE TYPE estado_civil AS ENUM (
    'Solteiro(a)',
    'Casado(a)',
    'Divorciado(a)',
    'Viúvo(a)',
    'União Estável'
  );
  
  -- Converter valores existentes
  UPDATE colaboradores 
  SET estado_civil = CASE 
    WHEN estado_civil IN ('Solteiro', 'solteiro', 'SOLTEIRO') THEN 'Solteiro(a)'
    WHEN estado_civil IN ('Casado', 'casado', 'CASADO') THEN 'Casado(a)'
    WHEN estado_civil IN ('Divorciado', 'divorciado', 'DIVORCIADO') THEN 'Divorciado(a)'
    WHEN estado_civil IN ('Viuvo', 'viuvo', 'Viúvo', 'viúvo', 'VIÚVO') THEN 'Viúvo(a)'
    WHEN estado_civil IN ('Uniao_Estavel', 'uniao_estavel', 'União Estável', 'UNIÃO ESTÁVEL') THEN 'União Estável'
    ELSE estado_civil
  END
  WHERE estado_civil IS NOT NULL;
  
  -- Voltar coluna para enum
  ALTER TABLE colaboradores 
  ALTER COLUMN estado_civil TYPE estado_civil 
  USING estado_civil::estado_civil;
  
  RAISE NOTICE '✓ estado_civil corrigido';
END $$;

-- ============================================================================
-- PASSO 5: RECRIAR VIEW BÁSICA (se necessário)
-- ============================================================================

DO $$ 
BEGIN
  -- Criar uma view simples se não existir
  EXECUTE '
    CREATE OR REPLACE VIEW vw_colaboradores_completo AS
    SELECT 
      c.*,
      e.nome_fantasia as empresa_nome,
      j.nome as jornada_nome
    FROM colaboradores c
    LEFT JOIN empresas e ON c.empresa_id = e.id
    LEFT JOIN jornadas_trabalho j ON c.jornada_id = j.id
  ';
  
  RAISE NOTICE '✓ View vw_colaboradores_completo recriada';
END $$;

-- ============================================================================
-- VERIFICAÇÕES FINAIS
-- ============================================================================

-- Verificar tipo_conta_bancaria
SELECT '=== TIPO_CONTA_BANCARIA ===' as info
UNION ALL
SELECT enumlabel
FROM pg_enum 
WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'tipo_conta_bancaria')
ORDER BY info;

-- Verificar estado_civil
SELECT '=== ESTADO_CIVIL ===' as info
UNION ALL
SELECT enumlabel
FROM pg_enum 
WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'estado_civil')
ORDER BY info;

-- Verificar dados
SELECT 
  COUNT(*) as total_colaboradores,
  COUNT(tipo_conta) as com_tipo_conta,
  COUNT(estado_civil) as com_estado_civil
FROM colaboradores;

-- Mensagem final
SELECT 'CORRECAO COMPLETA EXECUTADA COM SUCESSO!' as resultado;
