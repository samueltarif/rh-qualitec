-- ============================================================================
-- FIX SIMPLES: Constraint para 3 Holerites
-- ============================================================================

-- 1. Remover constraints antigas
ALTER TABLE holerites 
DROP CONSTRAINT IF EXISTS holerites_colaborador_mes_ano_tipo_unique;

ALTER TABLE holerites 
DROP CONSTRAINT IF EXISTS holerites_colaborador_mes_ano_tipo_parcela_unique;

ALTER TABLE holerites 
DROP CONSTRAINT IF EXISTS holerites_colaborador_id_mes_ano_key;

ALTER TABLE holerites 
DROP CONSTRAINT IF EXISTS holerites_colaborador_id_mes_ano_tipo_key;

-- 2. Criar nova constraint CORRETA
-- Usa NULLIF para converter string vazia em NULL
ALTER TABLE holerites 
ADD CONSTRAINT holerites_colaborador_mes_ano_tipo_parcela_unique 
UNIQUE (colaborador_id, mes, ano, tipo, COALESCE(NULLIF(parcela_13, ''), 'null_value'));

-- 3. Verificar resultado
SELECT 
  conname AS constraint_name,
  pg_get_constraintdef(oid) AS definition
FROM pg_constraint
WHERE conrelid = 'holerites'::regclass
  AND contype = 'u'
  AND conname = 'holerites_colaborador_mes_ano_tipo_parcela_unique';

-- 4. Mensagem de sucesso
DO $$
BEGIN
  RAISE NOTICE '✅ Constraint criada com sucesso!';
  RAISE NOTICE 'Agora você pode gerar 3 holerites no mesmo mês:';
  RAISE NOTICE '  - Salário Normal (tipo=normal, parcela_13=null)';
  RAISE NOTICE '  - 1ª Parcela 13º (tipo=decimo_terceiro, parcela_13=1)';
  RAISE NOTICE '  - 2ª Parcela 13º (tipo=decimo_terceiro, parcela_13=2)';
END $$;
