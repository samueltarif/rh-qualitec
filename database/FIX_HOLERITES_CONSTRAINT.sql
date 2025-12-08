-- ============================================================================
-- FIX: Corrigir Constraint Única da Tabela Holerites
-- ============================================================================
-- A constraint atual UNIQUE(colaborador_id, mes, ano) não permite múltiplos
-- holerites do mesmo mês/ano (ex: mensal + 13º salário)
-- Precisamos incluir o tipo na constraint
-- ============================================================================

-- 1. Remover a constraint antiga
ALTER TABLE holerites 
DROP CONSTRAINT IF EXISTS holerites_colaborador_id_mes_ano_key;

-- 2. Criar nova constraint incluindo o tipo
ALTER TABLE holerites 
ADD CONSTRAINT holerites_colaborador_mes_ano_tipo_key 
UNIQUE (colaborador_id, mes, ano, tipo);

-- 3. Verificar constraints atuais
SELECT 
  conname AS constraint_name,
  pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conrelid = 'holerites'::regclass
AND contype = 'u'; -- unique constraints

-- ============================================================================
-- RESULTADO ESPERADO:
-- ============================================================================
-- Deve mostrar a nova constraint:
-- holerites_colaborador_mes_ano_tipo_key UNIQUE (colaborador_id, mes, ano, tipo)
-- 
-- Isso permite:
-- - Holerite mensal de dezembro/2025
-- - 13º salário (1ª parcela) de dezembro/2025
-- - 13º salário (2ª parcela) de dezembro/2025
-- Tudo para o mesmo colaborador!
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '✅ Constraint corrigida!';
  RAISE NOTICE '📋 Agora é possível ter múltiplos holerites do mesmo mês';
  RAISE NOTICE '   desde que sejam de tipos diferentes (mensal, 13º, férias, etc)';
END $$;
