-- ============================================================================
-- CAMPOS EXTRAS PARA COLABORADORES
-- Execute este SQL no Supabase SQL Editor
-- ============================================================================

-- Adicionar campos extras na tabela colaboradores
ALTER TABLE colaboradores ADD COLUMN IF NOT EXISTS unidade VARCHAR(100);
ALTER TABLE colaboradores ADD COLUMN IF NOT EXISTS regime_pagamento VARCHAR(50) DEFAULT 'mensal';
ALTER TABLE colaboradores ADD COLUMN IF NOT EXISTS escolaridade VARCHAR(100);
ALTER TABLE colaboradores ADD COLUMN IF NOT EXISTS observacoes_rh TEXT;
ALTER TABLE colaboradores ADD COLUMN IF NOT EXISTS contato_emergencia_nome VARCHAR(255);
ALTER TABLE colaboradores ADD COLUMN IF NOT EXISTS contato_emergencia_telefone VARCHAR(20);
ALTER TABLE colaboradores ADD COLUMN IF NOT EXISTS email_alternativo VARCHAR(255);

-- Benefícios
ALTER TABLE colaboradores ADD COLUMN IF NOT EXISTS recebe_vt BOOLEAN DEFAULT false;
ALTER TABLE colaboradores ADD COLUMN IF NOT EXISTS valor_vt DECIMAL(10,2) DEFAULT 0;
ALTER TABLE colaboradores ADD COLUMN IF NOT EXISTS recebe_va_vr BOOLEAN DEFAULT false;
ALTER TABLE colaboradores ADD COLUMN IF NOT EXISTS valor_va_vr DECIMAL(10,2) DEFAULT 0;
ALTER TABLE colaboradores ADD COLUMN IF NOT EXISTS desconto_inss_padrao BOOLEAN DEFAULT true;

-- Comentários
COMMENT ON COLUMN colaboradores.unidade IS 'Unidade/filial onde o colaborador trabalha';
COMMENT ON COLUMN colaboradores.regime_pagamento IS 'mensal, quinzenal, por_dia';
COMMENT ON COLUMN colaboradores.escolaridade IS 'Nível de escolaridade';
COMMENT ON COLUMN colaboradores.observacoes_rh IS 'Notas internas do RH (não visível pelo funcionário)';
COMMENT ON COLUMN colaboradores.contato_emergencia_nome IS 'Nome do contato de emergência';
COMMENT ON COLUMN colaboradores.contato_emergencia_telefone IS 'Telefone do contato de emergência';
COMMENT ON COLUMN colaboradores.recebe_vt IS 'Recebe Vale Transporte';
COMMENT ON COLUMN colaboradores.valor_vt IS 'Valor do Vale Transporte';
COMMENT ON COLUMN colaboradores.recebe_va_vr IS 'Recebe Vale Alimentação/Refeição';
COMMENT ON COLUMN colaboradores.valor_va_vr IS 'Valor do VA/VR';
COMMENT ON COLUMN colaboradores.desconto_inss_padrao IS 'Usar cálculo padrão de INSS';

-- ============================================================================
-- POLÍTICAS RLS PARA COLABORADORES (usando app_users)
-- ============================================================================

-- Remover políticas antigas se existirem
DROP POLICY IF EXISTS "app_admin_view_colaboradores" ON colaboradores;
DROP POLICY IF EXISTS "app_admin_manage_colaboradores" ON colaboradores;
DROP POLICY IF EXISTS "app_employee_view_own" ON colaboradores;

-- Admin pode ver todos os colaboradores
CREATE POLICY "app_admin_view_colaboradores" ON colaboradores
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

-- Admin pode gerenciar colaboradores
CREATE POLICY "app_admin_manage_colaboradores" ON colaboradores
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

-- Funcionário pode ver apenas seu próprio registro
CREATE POLICY "app_employee_view_own" ON colaboradores
  FOR SELECT
  TO authenticated
  USING (
    id = (
      SELECT colaborador_id FROM app_users 
      WHERE auth_uid = auth.uid() 
      AND ativo = true
    )
  );


-- ============================================================================
-- POLÍTICAS RLS PARA DOCUMENTOS (usando app_users)
-- ============================================================================

DROP POLICY IF EXISTS "app_admin_view_documentos" ON documentos;
DROP POLICY IF EXISTS "app_admin_manage_documentos" ON documentos;

CREATE POLICY "app_admin_view_documentos" ON documentos
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

CREATE POLICY "app_admin_manage_documentos" ON documentos
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

-- ============================================================================
-- POLÍTICAS RLS PARA DEPENDENTES (usando app_users)
-- ============================================================================

DROP POLICY IF EXISTS "app_admin_view_dependentes" ON dependentes;
DROP POLICY IF EXISTS "app_admin_manage_dependentes" ON dependentes;

CREATE POLICY "app_admin_view_dependentes" ON dependentes
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

CREATE POLICY "app_admin_manage_dependentes" ON dependentes
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

-- ============================================================================
-- POLÍTICAS RLS PARA DEPARTAMENTOS (usando app_users)
-- ============================================================================

DROP POLICY IF EXISTS "app_admin_view_departamentos" ON departamentos;
DROP POLICY IF EXISTS "app_employee_view_departamentos" ON departamentos;

CREATE POLICY "app_admin_view_departamentos" ON departamentos
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM app_users 
      WHERE auth_uid = auth.uid() 
      AND ativo = true
    )
  );

-- ============================================================================
-- CRIAR BUCKET DE STORAGE PARA DOCUMENTOS
-- Execute no Supabase Dashboard > Storage > Create bucket
-- Nome: documentos
-- Public: false
-- ============================================================================
