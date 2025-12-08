-- ============================================================================
-- FIX: Adicionar campos faltantes na tabela empresa
-- ============================================================================

-- Adicionar campo responsavel_nome (se não existir)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'empresa' AND column_name = 'responsavel_nome'
  ) THEN
    ALTER TABLE empresa ADD COLUMN responsavel_nome VARCHAR(255);
    RAISE NOTICE '✅ Campo responsavel_nome adicionado';
  ELSE
    RAISE NOTICE 'ℹ️  Campo responsavel_nome já existe';
  END IF;
END $$;

-- Adicionar campo responsavel_cpf (se não existir)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'empresa' AND column_name = 'responsavel_cpf'
  ) THEN
    ALTER TABLE empresa ADD COLUMN responsavel_cpf VARCHAR(14);
    RAISE NOTICE '✅ Campo responsavel_cpf adicionado';
  ELSE
    RAISE NOTICE 'ℹ️  Campo responsavel_cpf já existe';
  END IF;
END $$;

-- Adicionar campo responsavel_cargo (se não existir)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'empresa' AND column_name = 'responsavel_cargo'
  ) THEN
    ALTER TABLE empresa ADD COLUMN responsavel_cargo VARCHAR(100);
    RAISE NOTICE '✅ Campo responsavel_cargo adicionado';
  ELSE
    RAISE NOTICE 'ℹ️  Campo responsavel_cargo já existe';
  END IF;
END $$;

-- Adicionar campo responsavel_email (se não existir)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'empresa' AND column_name = 'responsavel_email'
  ) THEN
    ALTER TABLE empresa ADD COLUMN responsavel_email VARCHAR(255);
    RAISE NOTICE '✅ Campo responsavel_email adicionado';
  ELSE
    RAISE NOTICE 'ℹ️  Campo responsavel_email já existe';
  END IF;
END $$;

-- Adicionar campo responsavel_telefone (se não existir)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'empresa' AND column_name = 'responsavel_telefone'
  ) THEN
    ALTER TABLE empresa ADD COLUMN responsavel_telefone VARCHAR(20);
    RAISE NOTICE '✅ Campo responsavel_telefone adicionado';
  ELSE
    RAISE NOTICE 'ℹ️  Campo responsavel_telefone já existe';
  END IF;
END $$;

-- Adicionar índice no CNPJ (se não existir)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE tablename = 'empresa' AND indexname = 'idx_empresa_cnpj'
  ) THEN
    CREATE INDEX idx_empresa_cnpj ON empresa(cnpj);
    RAISE NOTICE '✅ Índice idx_empresa_cnpj criado';
  ELSE
    RAISE NOTICE 'ℹ️  Índice idx_empresa_cnpj já existe';
  END IF;
END $$;

-- Adicionar comentários
COMMENT ON COLUMN empresa.cor_primaria IS 'Cor primária em hexadecimal (#RRGGBB)';
COMMENT ON COLUMN empresa.cor_secundaria IS 'Cor secundária em hexadecimal (#RRGGBB)';

-- Verificar se há dados
DO $$ 
DECLARE
  total_registros INTEGER;
BEGIN
  SELECT COUNT(*) INTO total_registros FROM empresa;
  RAISE NOTICE '📊 Total de registros na tabela empresa: %', total_registros;
  
  IF total_registros = 0 THEN
    RAISE NOTICE '⚠️  Nenhum registro encontrado. Execute o INSERT manualmente se necessário.';
  END IF;
END $$;

-- ============================================================================
-- FIM
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '✅ Correção da tabela empresa concluída!';
  RAISE NOTICE '📝 Todos os campos necessários foram adicionados';
  RAISE NOTICE '';
END $$;
