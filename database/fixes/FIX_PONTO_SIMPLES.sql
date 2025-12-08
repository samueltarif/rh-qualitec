-- ============================================================================
-- FIX SIMPLES: Políticas RLS para registros_ponto
-- Execute este SQL no Supabase SQL Editor
-- ============================================================================

-- PASSO 1: Remover TODAS as políticas antigas
-- ============================================================================
DROP POLICY IF EXISTS "funcionarios_view_own_ponto" ON registros_ponto;
DROP POLICY IF EXISTS "funcionarios_insert_own_ponto" ON registros_ponto;
DROP POLICY IF EXISTS "funcionarios_update_own_ponto" ON registros_ponto;
DROP POLICY IF EXISTS "admins_all_ponto" ON registros_ponto;
DROP POLICY IF EXISTS "service_role_ponto" ON registros_ponto;
DROP POLICY IF EXISTS "users_select_ponto" ON registros_ponto;
DROP POLICY IF EXISTS "users_insert_ponto" ON registros_ponto;
DROP POLICY IF EXISTS "users_update_ponto" ON registros_ponto;
DROP POLICY IF EXISTS "users_delete_ponto" ON registros_ponto;
DROP POLICY IF EXISTS "admins_rh_all_ponto" ON registros_ponto;
DROP POLICY IF EXISTS "admins_rh_gestores_all_ponto" ON registros_ponto;

-- PASSO 2: Criar políticas CORRETAS
-- ============================================================================

-- 1. Service role tem acesso total (SEMPRE PRIMEIRO)
CREATE POLICY "service_role_ponto" ON registros_ponto
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- 2. Admins, RH e Gestores podem fazer TUDO
CREATE POLICY "admins_rh_gestores_all_ponto" ON registros_ponto
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

-- 3. Funcionários podem VER seus próprios registros
CREATE POLICY "funcionarios_view_own_ponto" ON registros_ponto
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM app_users
      WHERE auth_uid = auth.uid()
      AND colaborador_id = registros_ponto.colaborador_id
      AND role = 'funcionario'
    )
  );

-- 4. Funcionários podem INSERIR seus próprios registros
CREATE POLICY "funcionarios_insert_own_ponto" ON registros_ponto
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM app_users
      WHERE auth_uid = auth.uid()
      AND colaborador_id = registros_ponto.colaborador_id
      AND role = 'funcionario'
    )
  );

-- 5. Funcionários podem ATUALIZAR seus próprios registros (apenas hoje)
CREATE POLICY "funcionarios_update_own_ponto" ON registros_ponto
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM app_users
      WHERE auth_uid = auth.uid()
      AND colaborador_id = registros_ponto.colaborador_id
      AND role = 'funcionario'
    )
    AND registros_ponto.data = CURRENT_DATE
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM app_users
      WHERE auth_uid = auth.uid()
      AND colaborador_id = registros_ponto.colaborador_id
      AND role = 'funcionario'
    )
    AND registros_ponto.data = CURRENT_DATE
  );

-- PASSO 3: Garantir que RLS está ativo
-- ============================================================================
ALTER TABLE registros_ponto ENABLE ROW LEVEL SECURITY;

-- PASSO 4: Verificação
-- ============================================================================

-- Verificar políticas criadas
SELECT 
  policyname, 
  cmd as comando
FROM pg_policies
WHERE tablename = 'registros_ponto'
ORDER BY policyname;

-- Verificar usuários e vínculos
SELECT 
  u.id,
  u.role,
  u.colaborador_id,
  c.nome as colaborador_nome,
  c.empresa_id
FROM app_users u
LEFT JOIN colaboradores c ON c.id = u.colaborador_id
ORDER BY u.created_at DESC
LIMIT 10;

-- Verificar registros de ponto
SELECT 
  rp.id,
  c.nome as colaborador,
  rp.data,
  rp.entrada_1,
  rp.status
FROM registros_ponto rp
LEFT JOIN colaboradores c ON c.id = rp.colaborador_id
ORDER BY rp.data DESC
LIMIT 5;

-- ============================================================================
-- ✅ PRONTO! Agora:
-- 1. Reinicie o servidor Nuxt (Ctrl+C e npm run dev)
-- 2. Teste o registro de ponto
-- ============================================================================
