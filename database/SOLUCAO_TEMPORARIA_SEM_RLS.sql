-- ============================================================================
-- SOLUÇÃO TEMPORÁRIA: Desabilitar RLS para testar o sistema
-- ============================================================================
-- Use isto TEMPORARIAMENTE para testar o sistema de holerites
-- DEPOIS vamos configurar o RLS corretamente
-- ============================================================================

-- Desabilitar RLS na tabela holerites
ALTER TABLE holerites DISABLE ROW LEVEL SECURITY;

-- Remover todas as políticas
DROP POLICY IF EXISTS "admin_all_holerites" ON holerites;
DROP POLICY IF EXISTS "funcionario_own_holerites" ON holerites;

-- ============================================================================
-- PRONTO!
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '⚠️  RLS DESABILITADO TEMPORARIAMENTE';
  RAISE NOTICE '📋 Tabela holerites está acessível sem restrições';
  RAISE NOTICE '';
  RAISE NOTICE '🎯 Agora você pode testar:';
  RAISE NOTICE '   1. /folha-pagamento → Gerar Holerites';
  RAISE NOTICE '   2. /employee → Ver Holerites';
  RAISE NOTICE '';
  RAISE NOTICE '⚠️  IMPORTANTE: Isto é temporário!';
  RAISE NOTICE '   Todos os usuários podem ver todos os holerites';
  RAISE NOTICE '   Configure o RLS depois para segurança';
END $$;