-- CORREÇÃO COMPLETA DE TODOS OS ENUMS
-- Resolve incompatibilidades entre frontend e banco de dados

-- ============================================================================
-- 1. CORRIGIR TIPO_CONTA_BANCARIA
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
    WHEN LOWER(tipo_conta) = 'corrente' THEN 'corrente'
    WHEN LOWER(tipo_conta) = 'poupanca' THEN 'poupanca'
    WHEN LOWER(tipo_conta) = 'poupança' THEN 'poupanca'
    WHEN LOWER(tipo_conta) = 'salario' THEN 'salario'
    WHEN LOWER(tipo_conta) = 'salário' THEN 'salario'
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
-- 2. CORRIGIR ESTADO_CIVIL
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
    WHEN estado_civil IN ('Solteiro', 'solteiro') THEN 'Solteiro(a)'
    WHEN estado_civil IN ('Casado', 'casado') THEN 'Casado(a)'
    WHEN estado_civil IN ('Divorciado', 'divorciado') THEN 'Divorciado(a)'
    WHEN estado_civil IN ('Viuvo', 'viuvo', 'Viúvo', 'viúvo') THEN 'Viúvo(a)'
    WHEN estado_civil IN ('Uniao_Estavel', 'uniao_estavel', 'União Estável') THEN 'União Estável'
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
-- VERIFICAÇÕES
-- ============================================================================

-- Verificar tipo_conta_bancaria
SELECT '=== TIPO_CONTA_BANCARIA ===' as info;
SELECT enumlabel as "Valores aceitos"
FROM pg_enum 
WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'tipo_conta_bancaria')
ORDER BY enumsortorder;

SELECT DISTINCT tipo_conta, COUNT(*) as quantidade
FROM colaboradores
WHERE tipo_conta IS NOT NULL
GROUP BY tipo_conta;

-- Verificar estado_civil
SELECT '=== ESTADO_CIVIL ===' as info;
SELECT enumlabel as "Valores aceitos"
FROM pg_enum 
WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'estado_civil')
ORDER BY enumsortorder;

SELECT DISTINCT estado_civil, COUNT(*) as quantidade
FROM colaboradores
WHERE estado_civil IS NOT NULL
GROUP BY estado_civil;

SELECT '✓ Correção completa executada com sucesso!' as resultado;
