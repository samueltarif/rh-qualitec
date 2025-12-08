-- ============================================================================
-- FIX: Dropar view vw_colaboradores_completo antes da migration 18
-- ============================================================================
-- Problema: A view já existe com estrutura diferente
-- Solução: Dropar a view para permitir recriação
-- ============================================================================

-- Dropar a view se existir
DROP VIEW IF EXISTS vw_colaboradores_completo CASCADE;

-- Mensagem de sucesso
DO $$
BEGIN
  RAISE NOTICE '✅ View vw_colaboradores_completo removida com sucesso!';
  RAISE NOTICE '📋 Agora você pode executar a migration 18';
END $$;
