-- ============================================================================
-- FIX: Corrigir constraint única da tabela holerites para suportar 13º salário
-- ============================================================================
-- Problema: A constraint UNIQUE(colaborador_id, mes, ano) impede criar
-- múltiplos holerites de 13º para o mesmo colaborador
-- Solução: Remover constraint antiga e criar nova incluindo o tipo
-- ============================================================================

-- 1. Remover constraint antiga
ALTER TABLE holerites 
DROP CONSTRAINT IF EXISTS holerites_colaborador_id_mes_ano_key;

-- 2. Criar nova constraint incluindo o tipo
-- Isso permite ter holerite mensal E 13º salário no mesmo mês
ALTER TABLE holerites 
ADD CONSTRAINT holerites_colaborador_mes_ano_tipo_key 
UNIQUE (colaborador_id, mes, ano, tipo);

-- 3. Verificar constraints atuais
SELECT 
  conname AS constraint_name,
  contype AS constraint_type,
  pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conrelid = 'holerites'::regclass
AND contype = 'u'; -- unique constraints

-- ============================================================================
-- Resultado esperado:
-- ============================================================================
-- Agora é possível ter:
-- - Holerite mensal de dezembro (tipo='mensal')
-- - 1ª parcela do 13º em novembro (tipo='decimo_terceiro', mes=11)
-- - 2ª parcela do 13º em dezembro (tipo='decimo_terceiro', mes=12)
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '✅ Constraint corrigida com sucesso!';
  RAISE NOTICE '📋 Nova constraint: UNIQUE(colaborador_id, mes, ano, tipo)';
  RAISE NOTICE '';
  RAISE NOTICE '🎯 Agora você pode:';
  RAISE NOTICE '1. Gerar holerite mensal de dezembro';
  RAISE NOTICE '2. Gerar 1ª parcela do 13º (novembro)';
  RAISE NOTICE '3. Gerar 2ª parcela do 13º (dezembro)';
  RAISE NOTICE '';
  RAISE NOTICE '⚠️  Cada combinação (colaborador + mês + ano + tipo) é única';
END $$;
