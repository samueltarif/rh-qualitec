-- ============================================
-- FIX: Adicionar Cargo e Benefícios ao Colaborador
-- ============================================

-- 1. VERIFICAR DADOS ATUAIS
SELECT 
  id,
  nome,
  cpf,
  cargo,
  salario,
  recebe_vt,
  valor_vt,
  recebe_vr,
  valor_vr,
  recebe_va,
  valor_va,
  plano_saude,
  plano_odonto
FROM colaboradores
WHERE nome ILIKE '%samuel%'
   OR nome ILIKE '%maria%'
   OR nome ILIKE '%joao%'
LIMIT 5;

-- 2. ATUALIZAR CARGO (se estiver vazio)
-- Substitua 'NOME DO COLABORADOR' pelo nome real
UPDATE colaboradores 
SET cargo = 'Desenvolvedor'
WHERE nome ILIKE '%samuel%'
  AND (cargo IS NULL OR cargo = '');

-- 3. ATUALIZAR BENEFÍCIOS
-- Substitua os valores conforme necessário
UPDATE colaboradores 
SET 
  -- Vale Transporte
  recebe_vt = true,
  valor_vt = 200.00,
  
  -- Vale Refeição
  recebe_vr = true,
  valor_vr = 500.00,
  
  -- Vale Alimentação
  recebe_va = true,
  valor_va = 300.00,
  
  -- Plano de Saúde
  plano_saude = true,
  
  -- Plano Odontológico
  plano_odonto = true
WHERE nome ILIKE '%samuel%';

-- 4. VERIFICAR RESULTADO
SELECT 
  id,
  nome,
  cargo,
  salario,
  recebe_vt,
  valor_vt,
  recebe_vr,
  valor_vr,
  recebe_va,
  valor_va,
  plano_saude,
  plano_odonto
FROM colaboradores
WHERE nome ILIKE '%samuel%';

-- 5. VERIFICAR SE OS CAMPOS EXISTEM NA TABELA
SELECT 
  column_name, 
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_schema = 'public'
  AND table_name = 'colaboradores'
  AND (
    column_name = 'cargo'
    OR column_name LIKE '%vt%'
    OR column_name LIKE '%vr%'
    OR column_name LIKE '%va%'
    OR column_name LIKE '%plano%'
  )
ORDER BY column_name;

-- ============================================
-- SE OS CAMPOS NÃO EXISTIREM, CRIAR:
-- ============================================

-- Adicionar campo cargo (se não existir)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'colaboradores' AND column_name = 'cargo'
  ) THEN
    ALTER TABLE colaboradores ADD COLUMN cargo TEXT;
  END IF;
END $$;

-- Adicionar campos de Vale Transporte (se não existirem)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'colaboradores' AND column_name = 'recebe_vt'
  ) THEN
    ALTER TABLE colaboradores ADD COLUMN recebe_vt BOOLEAN DEFAULT false;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'colaboradores' AND column_name = 'valor_vt'
  ) THEN
    ALTER TABLE colaboradores ADD COLUMN valor_vt NUMERIC(10,2) DEFAULT 0;
  END IF;
END $$;

-- Adicionar campos de Vale Refeição (se não existirem)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'colaboradores' AND column_name = 'recebe_vr'
  ) THEN
    ALTER TABLE colaboradores ADD COLUMN recebe_vr BOOLEAN DEFAULT false;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'colaboradores' AND column_name = 'valor_vr'
  ) THEN
    ALTER TABLE colaboradores ADD COLUMN valor_vr NUMERIC(10,2) DEFAULT 0;
  END IF;
END $$;

-- Adicionar campos de Vale Alimentação (se não existirem)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'colaboradores' AND column_name = 'recebe_va'
  ) THEN
    ALTER TABLE colaboradores ADD COLUMN recebe_va BOOLEAN DEFAULT false;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'colaboradores' AND column_name = 'valor_va'
  ) THEN
    ALTER TABLE colaboradores ADD COLUMN valor_va NUMERIC(10,2) DEFAULT 0;
  END IF;
END $$;

-- Adicionar campos de Plano de Saúde (se não existirem)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'colaboradores' AND column_name = 'plano_saude'
  ) THEN
    ALTER TABLE colaboradores ADD COLUMN plano_saude BOOLEAN DEFAULT false;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'colaboradores' AND column_name = 'plano_odonto'
  ) THEN
    ALTER TABLE colaboradores ADD COLUMN plano_odonto BOOLEAN DEFAULT false;
  END IF;
END $$;

-- 6. VERIFICAR NOVAMENTE SE OS CAMPOS FORAM CRIADOS
SELECT 
  column_name, 
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_schema = 'public'
  AND table_name = 'colaboradores'
  AND (
    column_name = 'cargo'
    OR column_name LIKE '%vt%'
    OR column_name LIKE '%vr%'
    OR column_name LIKE '%va%'
    OR column_name LIKE '%plano%'
  )
ORDER BY column_name;

-- 7. ATUALIZAR TODOS OS COLABORADORES COM VALORES PADRÃO
-- (apenas se os campos foram recém-criados)
UPDATE colaboradores 
SET 
  cargo = COALESCE(cargo, 'Não Informado'),
  recebe_vt = COALESCE(recebe_vt, false),
  valor_vt = COALESCE(valor_vt, 0),
  recebe_vr = COALESCE(recebe_vr, false),
  valor_vr = COALESCE(valor_vr, 0),
  recebe_va = COALESCE(recebe_va, false),
  valor_va = COALESCE(valor_va, 0),
  plano_saude = COALESCE(plano_saude, false),
  plano_odonto = COALESCE(plano_odonto, false)
WHERE cargo IS NULL 
   OR recebe_vt IS NULL 
   OR valor_vt IS NULL;

-- 8. RESULTADO FINAL - TODOS OS COLABORADORES
SELECT 
  id,
  nome,
  cargo,
  salario,
  recebe_vt,
  valor_vt,
  recebe_vr,
  valor_vr,
  recebe_va,
  valor_va,
  plano_saude,
  plano_odonto
FROM colaboradores
ORDER BY nome
LIMIT 10;
