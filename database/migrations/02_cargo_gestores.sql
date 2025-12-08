-- ============================================================================
-- TABELA DE VÍNCULO: CARGOS DE GESTÃO <-> FUNCIONÁRIOS
-- Execute este SQL no Supabase SQL Editor
-- ============================================================================

-- Criar tabela de vínculo entre cargos de gestão e funcionários
CREATE TABLE IF NOT EXISTS cargo_gestores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cargo_id UUID NOT NULL REFERENCES cargos(id) ON DELETE CASCADE,
  colaborador_id UUID NOT NULL REFERENCES colaboradores(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES app_users(id),
  
  UNIQUE(cargo_id, colaborador_id)
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_cargo_gestores_cargo ON cargo_gestores(cargo_id);
CREATE INDEX IF NOT EXISTS idx_cargo_gestores_colaborador ON cargo_gestores(colaborador_id);

-- Comentário
COMMENT ON TABLE cargo_gestores IS 'Vínculo entre cargos de gestão e funcionários que ocupam esses cargos';

-- Habilitar RLS
ALTER TABLE cargo_gestores ENABLE ROW LEVEL SECURITY;

-- Políticas RLS: Admin pode gerenciar
CREATE POLICY "app_admin_view_cargo_gestores" ON cargo_gestores
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

CREATE POLICY "app_admin_manage_cargo_gestores" ON cargo_gestores
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

-- Funcionários podem ver quem são os gestores
CREATE POLICY "app_employee_view_cargo_gestores" ON cargo_gestores
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM app_users 
      WHERE auth_uid = auth.uid() 
      AND ativo = true
    )
  );
