-- ============================================================================
-- FIX DEFINITIVO: Constraint para 3 Holerites
-- ============================================================================
-- Solução: Usar índices únicos parciais ao invés de constraint com COALESCE
-- ============================================================================

-- 1. Remover todas as constraints antigas
ALTER TABLE holerites 
DROP CONSTRAINT IF EXISTS holerites_colaborador_mes_ano_tipo_unique;

ALTER TABLE holerites 
DROP CONSTRAINT IF EXISTS holerites_colaborador_mes_ano_tipo_parcela_unique;

ALTER TABLE holerites 
DROP CONSTRAINT IF EXISTS holerites_colaborador_id_mes_ano_key;

ALTER TABLE holerites 
DROP CONSTRAINT IF EXISTS holerites_colaborador_id_mes_ano_tipo_key;

-- 2. Remover índices antigos (se existirem)
DROP INDEX IF EXISTS idx_holerites_unique_normal;
DROP INDEX IF EXISTS idx_holerites_unique_13_parcela;

-- 3. Criar índice único para holerites normais (sem parcela_13)
CREATE UNIQUE INDEX idx_holerites_unique_normal
ON holerites (colaborador_id, mes, ano, tipo)
WHERE parcela_13 IS NULL;

-- 4. Criar índice único para holerites de 13º (com parcela_13)
CREATE UNIQUE INDEX idx_holerites_unique_13_parcela
ON holerites (colaborador_id, mes, ano, tipo, parcela_13)
WHERE parcela_13 IS NOT NULL;

-- 5. Verificar índices criados
SELECT 
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename = 'holerites'
  AND indexname LIKE 'idx_holerites_unique%'
ORDER BY indexname;

-- 6. Mensagem de sucesso
DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '============================================================================';
  RAISE NOTICE '✅ FIX APLICADO COM SUCESSO!';
  RAISE NOTICE '============================================================================';
  RAISE NOTICE '';
  RAISE NOTICE 'Agora você pode gerar 3 holerites no mesmo mês:';
  RAISE NOTICE '  ✅ Salário Normal (tipo=normal, parcela_13=null)';
  RAISE NOTICE '  ✅ 1ª Parcela 13º (tipo=decimo_terceiro, parcela_13=1)';
  RAISE NOTICE '  ✅ 2ª Parcela 13º (tipo=decimo_terceiro, parcela_13=2)';
  RAISE NOTICE '';
  RAISE NOTICE 'Próximos passos:';
  RAISE NOTICE '  1. Reiniciar servidor Nuxt (npm run dev)';
  RAISE NOTICE '  2. Testar geração de 13º salário';
  RAISE NOTICE '  3. Verificar que 3 holerites são gerados';
  RAISE NOTICE '';
  RAISE NOTICE '============================================================================';
END $$;
