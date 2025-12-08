-- ============================================================================
-- POLÍTICAS RLS PARA DEPARTAMENTOS
-- Execute este SQL no Supabase SQL Editor
-- ============================================================================

-- Desabilitar RLS temporariamente (para facilitar)
ALTER TABLE departamentos DISABLE ROW LEVEL SECURITY;

-- Ou se preferir manter RLS, use estas políticas:
-- DROP POLICY IF EXISTS "admin_all_departamentos" ON departamentos;
-- DROP POLICY IF EXISTS "view_departamentos" ON departamentos;
-- DROP POLICY IF EXISTS "admin_manage_departamentos" ON departamentos;
-- DROP POLICY IF EXISTS "app_admin_view_departamentos" ON departamentos;
-- DROP POLICY IF EXISTS "app_employee_view_departamentos" ON departamentos;

-- CREATE POLICY "admin_full_departamentos" ON departamentos
--   FOR ALL
--   TO authenticated
--   USING (
--     EXISTS (
--       SELECT 1 FROM app_users 
--       WHERE auth_uid = auth.uid() 
--       AND role = 'admin'
--       AND ativo = true
--     )
--   )
--   WITH CHECK (
--     EXISTS (
--       SELECT 1 FROM app_users 
--       WHERE auth_uid = auth.uid() 
--       AND role = 'admin'
--       AND ativo = true
--     )
--   );
