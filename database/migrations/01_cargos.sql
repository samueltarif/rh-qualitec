-- ============================================================================
-- CORREÇÃO RLS PARA CARGOS - Sistema app_users
-- Execute este SQL no Supabase SQL Editor
-- ============================================================================

-- Remover políticas antigas de cargos
DROP POLICY IF EXISTS "view_cargos" ON cargos;
DROP POLICY IF EXISTS "admin_manage_cargos" ON cargos;

-- Nova política: Admin (via app_users) pode ver todos os cargos
CREATE POLICY "app_admin_view_cargos" ON cargos
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM app_users 
      WHERE auth_uid = auth.uid() 
      AND role = 'admin'
      AND ativo = true
    )
  );

-- Nova política: Admin (via app_users) pode gerenciar cargos
CREATE POLICY "app_admin_manage_cargos" ON cargos
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM app_users 
      WHERE auth_uid = auth.uid() 
      AND role = 'admin'
      AND ativo = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM app_users 
      WHERE auth_uid = auth.uid() 
      AND role = 'admin'
      AND ativo = true
    )
  );

-- Funcionários podem ver cargos (apenas leitura)
CREATE POLICY "app_employee_view_cargos" ON cargos
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM app_users 
      WHERE auth_uid = auth.uid() 
      AND ativo = true
    )
  );

-- Atualizar cargos existentes para ter nível operacional por padrão
UPDATE cargos SET nivel = 'operacional' WHERE nivel IS NULL OR nivel = '';

-- ============================================================================
-- Níveis disponíveis:
-- 'operacional': Acesso básico, sem poderes administrativos
-- 'gestao': Mesmos poderes de admin, EXCETO editar/excluir funcionários
-- ============================================================================
