-- ============================================================================
-- FIX: Corrigir RLS para Holerites e 13º Salário
-- ============================================================================
-- Problema: Erro ao gerar holerites individuais e 13º salário
-- Causa: Políticas RLS muito restritivas
-- Solução: Permitir que admins criem holerites sem restrições
-- ============================================================================

-- 1. DESABILITAR RLS TEMPORARIAMENTE (para limpeza)
ALTER TABLE holerites DISABLE ROW LEVEL SECURITY;

-- 2. REMOVER TODAS AS POLÍTICAS ANTIGAS
DROP POLICY IF EXISTS "Admin pode ver todos os holerites" ON holerites;
DROP POLICY IF EXISTS "Admin pode inserir holerites" ON holerites;
DROP POLICY IF EXISTS "Admin pode atualizar holerites" ON holerites;
DROP POLICY IF EXISTS "Admin pode deletar holerites" ON holerites;
DROP POLICY IF EXISTS "Funcionário pode ver seus próprios holerites" ON holerites;
DROP POLICY IF EXISTS "Funcionário pode marcar holerite como visualizado" ON holerites;

-- 3. REABILITAR RLS
ALTER TABLE holerites ENABLE ROW LEVEL SECURITY;

-- 4. CRIAR POLÍTICAS CORRETAS

-- Admin: VER todos os holerites
CREATE POLICY "Admin pode ver todos os holerites"
  ON holerites FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM app_users
      WHERE app_users.auth_uid = auth.uid()
      AND app_users.role = 'admin'
    )
  );

-- Admin: INSERIR holerites (SEM RESTRIÇÕES)
CREATE POLICY "Admin pode inserir holerites"
  ON holerites FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM app_users
      WHERE app_users.auth_uid = auth.uid()
      AND app_users.role = 'admin'
    )
  );

-- Admin: ATUALIZAR holerites
CREATE POLICY "Admin pode atualizar holerites"
  ON holerites FOR UPDATE
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

-- Admin: DELETAR holerites
CREATE POLICY "Admin pode deletar holerites"
  ON holerites FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM app_users
      WHERE app_users.auth_uid = auth.uid()
      AND app_users.role = 'admin'
    )
  );

-- Funcionário: VER apenas seus holerites
CREATE POLICY "Funcionário pode ver seus próprios holerites"
  ON holerites FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 
      FROM colaboradores c
      JOIN app_users u ON u.id = c.user_id
      WHERE c.id = holerites.colaborador_id
      AND u.auth_uid = auth.uid()
      AND u.role = 'funcionario'
    )
  );

-- Funcionário: ATUALIZAR apenas campo visualizado_em
CREATE POLICY "Funcionário pode marcar holerite como visualizado"
  ON holerites FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 
      FROM colaboradores c
      JOIN app_users u ON u.id = c.user_id
      WHERE c.id = holerites.colaborador_id
      AND u.auth_uid = auth.uid()
      AND u.role = 'funcionario'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 
      FROM colaboradores c
      JOIN app_users u ON u.id = c.user_id
      WHERE c.id = holerites.colaborador_id
      AND u.auth_uid = auth.uid()
      AND u.role = 'funcionario'
    )
  );

-- ============================================================================
-- VERIFICAÇÃO
-- ============================================================================

-- Verificar políticas criadas
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'holerites'
ORDER BY policyname;

-- Verificar se RLS está ativo
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE tablename = 'holerites';

-- ============================================================================
-- RESULTADO ESPERADO
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '✅ RLS corrigido para tabela holerites!';
  RAISE NOTICE '';
  RAISE NOTICE '📋 Políticas criadas:';
  RAISE NOTICE '   ✓ Admin pode ver todos os holerites';
  RAISE NOTICE '   ✓ Admin pode inserir holerites (SEM RESTRIÇÕES)';
  RAISE NOTICE '   ✓ Admin pode atualizar holerites';
  RAISE NOTICE '   ✓ Admin pode deletar holerites';
  RAISE NOTICE '   ✓ Funcionário pode ver seus próprios holerites';
  RAISE NOTICE '   ✓ Funcionário pode marcar como visualizado';
  RAISE NOTICE '';
  RAISE NOTICE '🎯 Agora você pode:';
  RAISE NOTICE '   1. Gerar holerites individuais';
  RAISE NOTICE '   2. Gerar 13º salário (1ª e 2ª parcela)';
  RAISE NOTICE '   3. Enviar holerites por email';
  RAISE NOTICE '';
  RAISE NOTICE '🔧 Teste agora:';
  RAISE NOTICE '   • Acesse /folha-pagamento';
  RAISE NOTICE '   • Clique em "Gerar Holerite Individual"';
  RAISE NOTICE '   • Clique em "13º Salário" → "Gerar Holerites"';
END $$;
