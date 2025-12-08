-- ============================================================================
-- CORREÇÃO SIMPLES: Políticas RLS para Colaboradores
-- Execute APENAS este SQL (aguarde alguns minutos se der erro de throttle)
-- ============================================================================

-- Remover TODAS as políticas antigas de colaboradores
DROP POLICY IF EXISTS "colaborador_view_self" ON colaboradores;
DROP POLICY IF EXISTS "gestor_view_team" ON colaboradores;
DROP POLICY IF EXISTS "admin_view_colaboradores" ON colaboradores;
DROP POLICY IF EXISTS "admin_manage_colaboradores" ON colaboradores;
DROP POLICY IF EXISTS "admin_update_colaboradores" ON colaboradores;
DROP POLICY IF EXISTS "admin_delete_colaboradores" ON colaboradores;
DROP POLICY IF EXISTS "colaboradores_select_own" ON colaboradores;
DROP POLICY IF EXISTS "app_colaboradores_select" ON colaboradores;
DROP POLICY IF EXISTS "app_admin_view_colaboradores" ON colaboradores;
DROP POLICY IF EXISTS "app_admin_manage_colaboradores" ON colaboradores;
DROP POLICY IF EXISTS "app_employee_view_own" ON colaboradores;

-- Criar UMA política simples: Admin tem acesso total
CREATE POLICY "admin_all_colaboradores" ON colaboradores
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

-- Associar colaboradores órfãos à primeira empresa (se houver)
UPDATE colaboradores
SET empresa_id = (SELECT id FROM empresas LIMIT 1)
WHERE empresa_id IS NULL;
