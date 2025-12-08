-- ============================================================================
-- FIX: Políticas RLS CORRETAS para registros_ponto
-- ============================================================================

-- Remover TODAS as políticas antigas
DROP POLICY IF EXISTS "funcionarios_view_own_ponto" ON registros_ponto;
DROP POLICY IF EXISTS "funcionarios_insert_own_ponto" ON registros_ponto;
DROP POLICY IF EXISTS "funcionarios_update_own_ponto" ON registros_ponto;
DROP POLICY IF EXISTS "admins_all_ponto" ON registros_ponto;
DROP POLICY IF EXISTS "service_role_ponto" ON registros_ponto;
DROP POLICY IF EXISTS "users_select_ponto" ON registros_ponto;
DROP POLICY IF EXISTS "users_insert_ponto" ON registros_ponto;
DROP POLICY IF EXISTS "users_update_ponto" ON registros_ponto;
DROP POLICY IF EXISTS "users_delete_ponto" ON registros_ponto;

-- Política SIMPLES: Admins e RH podem fazer TUDO
CREATE POLICY "admins_rh_all_ponto" ON registros_ponto
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM app_users
      WHERE auth_uid = auth.uid()
      AND role IN ('admin', 'rh', 'gestor')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM app_users
      WHERE auth_uid = auth.uid()
      AND role IN ('admin', 'rh', 'gestor')
    )
  );

-- Política: Funcionários podem VER seus próprios registros
CREATE POLICY "funcionarios_view_own_ponto" ON registros_ponto
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM app_users
      WHERE auth_uid = auth.uid()
      AND colaborador_id = registros_ponto.colaborador_id
    )
  );

-- Política: Funcionários podem INSERIR seus próprios registros
CREATE POLICY "funcionarios_insert_own_ponto" ON registros_ponto
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM app_users
      WHERE auth_uid = auth.uid()
      AND colaborador_id = registros_ponto.colaborador_id
    )
  );

-- Service role tem acesso total (para APIs)
CREATE POLICY "service_role_ponto" ON registros_ponto
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
