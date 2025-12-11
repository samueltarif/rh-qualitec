-- ============================================================================
-- Migration 31: Sistema de Assinatura de Ponto
-- ============================================================================

-- 1. Criar tabela de assinaturas
CREATE TABLE IF NOT EXISTS assinaturas_ponto (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  colaborador_id UUID NOT NULL REFERENCES colaboradores(id) ON DELETE CASCADE,
  mes INTEGER NOT NULL CHECK (mes >= 1 AND mes <= 12),
  ano INTEGER NOT NULL CHECK (ano >= 2020 AND ano <= 2100),
  data_assinatura TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ip_assinatura VARCHAR(45),
  user_agent TEXT,
  hash_assinatura TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(colaborador_id, mes, ano)
);

-- 2. Índices
CREATE INDEX IF NOT EXISTS idx_assinaturas_ponto_colaborador ON assinaturas_ponto(colaborador_id);
CREATE INDEX IF NOT EXISTS idx_assinaturas_ponto_mes_ano ON assinaturas_ponto(mes, ano);
CREATE INDEX IF NOT EXISTS idx_assinaturas_ponto_data ON assinaturas_ponto(data_assinatura DESC);

-- 3. RLS
ALTER TABLE assinaturas_ponto ENABLE ROW LEVEL SECURITY;

-- Política para service_role (bypass)
CREATE POLICY "service_role_assinaturas_ponto" 
  ON assinaturas_ponto 
  FOR ALL 
  TO service_role 
  USING (true) 
  WITH CHECK (true);

-- Admin: VER todas as assinaturas
CREATE POLICY "Admin pode ver todas as assinaturas"
  ON assinaturas_ponto FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM app_users
      WHERE app_users.auth_uid = auth.uid()
      AND app_users.role = 'admin'
    )
  );

-- Admin: INSERIR assinaturas
CREATE POLICY "Admin pode inserir assinaturas"
  ON assinaturas_ponto FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM app_users
      WHERE app_users.auth_uid = auth.uid()
      AND app_users.role = 'admin'
    )
  );

-- Admin: ATUALIZAR assinaturas
CREATE POLICY "Admin pode atualizar assinaturas"
  ON assinaturas_ponto FOR UPDATE
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

-- Admin: DELETAR assinaturas
CREATE POLICY "Admin pode deletar assinaturas"
  ON assinaturas_ponto FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM app_users
      WHERE app_users.auth_uid = auth.uid()
      AND app_users.role = 'admin'
    )
  );

-- Funcionário: VER apenas suas assinaturas
CREATE POLICY "Funcionário pode ver suas próprias assinaturas"
  ON assinaturas_ponto FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 
      FROM colaboradores c
      JOIN app_users u ON u.id = c.user_id
      WHERE c.id = assinaturas_ponto.colaborador_id
      AND u.auth_uid = auth.uid()
      AND u.role = 'funcionario'
    )
  );

-- Funcionário: INSERIR apenas suas assinaturas
CREATE POLICY "Funcionário pode criar suas assinaturas"
  ON assinaturas_ponto FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 
      FROM colaboradores c
      JOIN app_users u ON u.id = c.user_id
      WHERE c.id = assinaturas_ponto.colaborador_id
      AND u.auth_uid = auth.uid()
      AND u.role = 'funcionario'
    )
  );

-- 4. Comentários
COMMENT ON TABLE assinaturas_ponto IS 'Registro de assinaturas digitais do ponto pelos funcionários';

-- ============================================================================
-- FIM
-- ============================================================================

DO $
BEGIN
  RAISE NOTICE '✅ Migration 31 executada com sucesso!';
  RAISE NOTICE '📋 Tabela assinaturas_ponto criada';
  RAISE NOTICE '🔒 RLS configurado com padrão do projeto';
  RAISE NOTICE '📊 Índices criados';
  RAISE NOTICE '';
  RAISE NOTICE '📋 Políticas criadas:';
  RAISE NOTICE '   ✓ Service role bypass';
  RAISE NOTICE '   ✓ Admin: todas operações';
  RAISE NOTICE '   ✓ Funcionário: ver e criar suas assinaturas';
END $;
