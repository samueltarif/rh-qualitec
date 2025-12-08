-- ============================================================================
-- Fix: Remover campos de dedução do INSS (não existe legalmente)
-- ============================================================================
-- Descrição: Remove as colunas de dedução do INSS que foram criadas erroneamente
-- O INSS não possui dedução, apenas alíquotas progressivas
-- ============================================================================

-- Remover colunas de dedução do INSS (se existirem)
ALTER TABLE parametros_folha DROP COLUMN IF EXISTS inss_faixa1_deducao;
ALTER TABLE parametros_folha DROP COLUMN IF EXISTS inss_faixa2_deducao;
ALTER TABLE parametros_folha DROP COLUMN IF EXISTS inss_faixa3_deducao;
ALTER TABLE parametros_folha DROP COLUMN IF EXISTS inss_faixa4_deducao;

-- ============================================================================
-- FIM
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '✅ Colunas de dedução do INSS removidas com sucesso!';
  RAISE NOTICE '📋 O INSS não possui dedução, apenas alíquotas progressivas';
END $$;
