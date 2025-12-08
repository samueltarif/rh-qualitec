-- FIX: Corrigir campo salário dos colaboradores

-- 1. VERIFICAR colaboradores sem salário
SELECT 
  id,
  nome_completo,
  cargo,
  salario,
  CASE 
    WHEN salario IS NULL THEN '❌ NULL'
    WHEN salario = 0 THEN '❌ ZERO'
    ELSE '✅ OK'
  END as status
FROM colaboradores
WHERE salario IS NULL OR salario = 0;

-- 2. ATUALIZAR colaboradores específicos (EXEMPLO - ajuste conforme necessário)
-- Descomente e ajuste os valores abaixo:

/*
UPDATE colaboradores
SET salario = 8000.00
WHERE nome_completo = 'SAMUEL BARRETOS TARIF';

UPDATE colaboradores
SET salario = 4000.00
WHERE nome_completo = 'Silvana Administradora';
*/

-- 3. VERIFICAR após atualização
SELECT 
  id,
  nome_completo,
  cargo,
  salario,
  '✅ Pronto para gerar holerite' as status
FROM colaboradores
WHERE salario > 0
ORDER BY nome_completo;

-- 4. GARANTIR que a coluna salario existe e está correta
DO $$
BEGIN
  -- Verificar se a coluna existe
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'colaboradores' 
    AND column_name = 'salario'
  ) THEN
    -- Adicionar coluna se não existir
    ALTER TABLE colaboradores ADD COLUMN salario DECIMAL(10,2);
    RAISE NOTICE '✅ Coluna salario adicionada';
  ELSE
    RAISE NOTICE '✅ Coluna salario já existe';
  END IF;
END $$;
