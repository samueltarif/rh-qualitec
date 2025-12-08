-- ============================================================================
-- FIX: Políticas RLS para funcionários baterem ponto
-- ============================================================================

-- 1. Remover políticas antigas
DROP POLICY IF EXISTS "Funcionários podem inserir seus próprios registros" ON registros_ponto;
DROP POLICY IF EXISTS "Funcionários podem ver seus próprios registros" ON registros_ponto;
DROP POLICY IF EXISTS "Funcionários podem atualizar seus próprios registros" ON registros_ponto;
DROP POLICY IF EXISTS "service_role_ponto" ON registros_ponto;
DROP POLICY IF EXISTS "admins_rh_gestores_all_ponto" ON registros_ponto;

-- 2. Criar política para funcionários INSERIREM ponto
CREATE POLICY "Funcionários podem inserir seus próprios registros"
  ON registros_ponto FOR INSERT
  TO authenticated
  WITH CHECK (
    colaborador_id IN (
      SELECT colaborador_id 
      FROM app_users 
      WHERE auth_uid = auth.uid()
      AND role = 'funcionario'
      AND colaborador_id IS NOT NULL
    )
  );

-- 3. Criar política para funcionários VEREM seus registros
CREATE POLICY "Funcionários podem ver seus próprios registros"
  ON registros_ponto FOR SELECT
  TO authenticated
  USING (
    colaborador_id IN (
      SELECT colaborador_id 
      FROM app_users 
      WHERE auth_uid = auth.uid()
      AND role = 'funcionario'
      AND colaborador_id IS NOT NULL
    )
  );

-- 4. Criar política para funcionários ATUALIZAREM seus registros
CREATE POLICY "Funcionários podem atualizar seus próprios registros"
  ON registros_ponto FOR UPDATE
  TO authenticated
  USING (
    colaborador_id IN (
      SELECT colaborador_id 
      FROM app_users 
      WHERE auth_uid = auth.uid()
      AND role = 'funcionario'
      AND colaborador_id IS NOT NULL
    )
  )
  WITH CHECK (
    colaborador_id IN (
      SELECT colaborador_id 
      FROM app_users 
      WHERE auth_uid = auth.uid()
      AND role = 'funcionario'
      AND colaborador_id IS NOT NULL
    )
  );

-- 5. Criar política para ADMINS (todas as operações)
CREATE POLICY "admins_rh_gestores_all_ponto"
  ON registros_ponto FOR ALL
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

-- 6. Verificar políticas criadas
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE tablename = 'registros_ponto'
ORDER BY policyname;

-- ============================================================================
-- FIM
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '✅ Políticas RLS de registros_ponto corrigidas!';
  RAISE NOTICE '';
  RAISE NOTICE '🎯 Agora os funcionários podem:';
  RAISE NOTICE '   • Inserir registros de ponto';
  RAISE NOTICE '   • Ver seus próprios registros';
  RAISE NOTICE '   • Atualizar seus próprios registros';
  RAISE NOTICE '';
  RAISE NOTICE '🔒 Admins têm acesso total';
END $$;
