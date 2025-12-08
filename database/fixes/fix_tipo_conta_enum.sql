-- Corrigir enum tipo_conta_bancaria para aceitar todos os valores
-- Execute este script no Supabase SQL Editor

DO $$ 
BEGIN
  -- Verificar se o tipo existe
  IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'tipo_conta_bancaria') THEN
    -- Adicionar "poupanca" se não existir
    IF NOT EXISTS (
      SELECT 1 FROM pg_enum 
      WHERE enumlabel = 'poupanca' 
      AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'tipo_conta_bancaria')
    ) THEN
      ALTER TYPE tipo_conta_bancaria ADD VALUE 'poupanca';
      RAISE NOTICE 'Valor "poupanca" adicionado';
    END IF;
    
    -- Adicionar "salario" se não existir
    IF NOT EXISTS (
      SELECT 1 FROM pg_enum 
      WHERE enumlabel = 'salario' 
      AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'tipo_conta_bancaria')
    ) THEN
      ALTER TYPE tipo_conta_bancaria ADD VALUE 'salario';
      RAISE NOTICE 'Valor "salario" adicionado';
    END IF;
  ELSE
    -- Criar o enum se não existir
    CREATE TYPE tipo_conta_bancaria AS ENUM ('corrente', 'poupanca', 'salario');
    RAISE NOTICE 'Enum tipo_conta_bancaria criado com todos os valores';
  END IF;
END $$;

-- Verificar os valores do enum
SELECT enumlabel as "Valores aceitos"
FROM pg_enum 
WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'tipo_conta_bancaria')
ORDER BY enumsortorder;
