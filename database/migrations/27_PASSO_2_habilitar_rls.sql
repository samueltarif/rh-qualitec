-- ============================================================================
-- PASSO 2: Habilitar RLS na tabela holerites
-- ============================================================================
-- Execute DEPOIS do PASSO 1
-- ============================================================================

-- 1. Habilitar RLS
ALTER TABLE holerites ENABLE ROW LEVEL SECURITY;

-- 2. Limpar políticas antigas (se existirem)
DROP POLICY IF EXISTS "admin_all_holerites" ON holerites;
DROP POLICY IF EXISTS "funcionario_own_holerites" ON holerites;

-- 3. Política para Admin (todas as operações)
CREATE POLICY "admin_all_holerites"
  ON holerites
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM app_users
      WHERE app_users.auth_uid = auth.uid()
      AND app_users.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM app_users
      WHERE app_users.auth_uid = auth.uid()
      AND app_users.role = 'admin'
    )
  );

-- 4. Política para Funcionário (ver e atualizar apenas seus holerites)
CREATE POLICY "funcionario_own_holerites"
  ON holerites
  FOR ALL
  TO authenticated
  USING (
    colaborador_id IN (
      SELECT c.id 
      FROM colaboradores c
      JOIN app_users u ON u.id = c.user_id
      WHERE u.auth_uid = auth.uid()
      AND u.role = 'funcionario'
    )
  )
  WITH CHECK (
    colaborador_id IN (
      SELECT c.id 
      FROM colaboradores c
      JOIN app_users u ON u.id = c.user_id
      WHERE u.auth_uid = auth.uid()
      AND u.role = 'funcionario'
    )
  );

-- ============================================================================
-- FIM DO PASSO 2
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '✅ PASSO 2 concluído!';
  RAISE NOTICE '🔒 RLS habilitado na tabela holerites';
  RAISE NOTICE '✅ Políticas de segurança criadas';
  RAISE NOTICE '';
  RAISE NOTICE '🎯 Sistema completo e seguro!';
  RAISE NOTICE '   • Admin: vê todos os holerites';
  RAISE NOTICE '   • Funcionário: vê apenas seus holerites';
  RAISE NOTICE '';
  RAISE NOTICE '📱 Teste agora:';
  RAISE NOTICE '   1. /folha-pagamento → Gerar Holerites (admin)';
  RAISE NOTICE '   2. /employee → Aba Holerites (funcionário)';
END $$;
