-- CORREÇÃO DEFINITIVA DO ENUM TIPO_CONTA_BANCARIA
-- Este script resolve o problema de incompatibilidade entre frontend e banco

-- Passo 1: Remover o enum antigo e criar um novo com valores corretos
DO $$ 
BEGIN
  -- Primeiro, alterar a coluna para text temporariamente
  ALTER TABLE colaboradores ALTER COLUMN tipo_conta TYPE text;
  
  -- Dropar o enum antigo
  DROP TYPE IF EXISTS tipo_conta_bancaria CASCADE;
  
  -- Criar o enum com valores em minúsculas (como o frontend envia)
  CREATE TYPE tipo_conta_bancaria AS ENUM ('corrente', 'poupanca', 'salario');
  
  -- Converter valores existentes para minúsculas
  UPDATE colaboradores 
  SET tipo_conta = LOWER(tipo_conta)
  WHERE tipo_conta IS NOT NULL;
  
  -- Voltar a coluna para o tipo enum
  ALTER TABLE colaboradores 
  ALTER COLUMN tipo_conta TYPE tipo_conta_bancaria 
  USING tipo_conta::tipo_conta_bancaria;
  
  RAISE NOTICE 'Enum tipo_conta_bancaria corrigido com sucesso!';
END $$;

-- Verificar os valores aceitos
SELECT enumlabel as "Valores aceitos no enum"
FROM pg_enum 
WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'tipo_conta_bancaria')
ORDER BY enumsortorder;

-- Verificar dados existentes
SELECT DISTINCT tipo_conta, COUNT(*) as quantidade
FROM colaboradores
WHERE tipo_conta IS NOT NULL
GROUP BY tipo_conta;
