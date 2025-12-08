-- ============================================================================
-- Migration 27: Sistema de Holerites (SEM RLS INICIALMENTE)
-- ============================================================================
-- Cria tabela primeiro, depois adiciona RLS
-- ============================================================================

-- 1. Criar tabela
CREATE TABLE IF NOT EXISTS holerites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  colaborador_id UUID NOT NULL REFERENCES colaboradores(id) ON DELETE CASCADE,
  mes INTEGER NOT NULL CHECK (mes >= 1 AND mes <= 12),
  ano INTEGER NOT NULL CHECK (ano >= 2020 AND ano <= 2100),
  
  nome_colaborador VARCHAR(255) NOT NULL,
  cpf VARCHAR(14) NOT NULL,
  cargo VARCHAR(255),
  departamento VARCHAR(255),
  
  salario_base DECIMAL(10,2) NOT NULL DEFAULT 0,
  horas_trabalhadas DECIMAL(10,2) DEFAULT 0,
  horas_extras_50 DECIMAL(10,2) DEFAULT 0,
  horas_extras_100 DECIMAL(10,2) DEFAULT 0,
  
  valor_horas_extras_50 DECIMAL(10,2) DEFAULT 0,
  valor_horas_extras_100 DECIMAL(10,2) DEFAULT 0,
  adicional_noturno DECIMAL(10,2) DEFAULT 0,
  adicional_insalubridade DECIMAL(10,2) DEFAULT 0,
  adicional_periculosidade DECIMAL(10,2) DEFAULT 0,
  outros_proventos DECIMAL(10,2) DEFAULT 0,
  descricao_outros_proventos TEXT,
  total_proventos DECIMAL(10,2) NOT NULL DEFAULT 0,
  
  inss DECIMAL(10,2) DEFAULT 0,
  irrf DECIMAL(10,2) DEFAULT 0,
  vale_transporte DECIMAL(10,2) DEFAULT 0,
  vale_refeicao DECIMAL(10,2) DEFAULT 0,
  plano_saude DECIMAL(10,2) DEFAULT 0,
  faltas DECIMAL(10,2) DEFAULT 0,
  atrasos DECIMAL(10,2) DEFAULT 0,
  outros_descontos DECIMAL(10,2) DEFAULT 0,
  descricao_outros_descontos TEXT,
  total_descontos DECIMAL(10,2) NOT NULL DEFAULT 0,
  
  salario_bruto DECIMAL(10,2) NOT NULL DEFAULT 0,
  salario_liquido DECIMAL(10,2) NOT NULL DEFAULT 0,
  
  fgts DECIMAL(10,2) DEFAULT 0,
  inss_patronal DECIMAL(10,2) DEFAULT 0,
  
  banco VARCHAR(100),
  agencia VARCHAR(20),
  conta VARCHAR(30),
  
  observacoes TEXT,
  
  status VARCHAR(20) DEFAULT 'gerado' CHECK (status IN ('gerado', 'enviado', 'visualizado', 'pago')),
  data_pagamento DATE,
  
  gerado_por UUID,
  gerado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  enviado_em TIMESTAMP WITH TIME ZONE,
  visualizado_em TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(colaborador_id, mes, ano)
);

-- 2. Índices
CREATE INDEX IF NOT EXISTS idx_holerites_colaborador ON holerites(colaborador_id);
CREATE INDEX IF NOT EXISTS idx_holerites_mes_ano ON holerites(mes, ano);
CREATE INDEX IF NOT EXISTS idx_holerites_status ON holerites(status);

-- 3. Função updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. Trigger
DROP TRIGGER IF EXISTS update_holerites_updated_at ON holerites;
CREATE TRIGGER update_holerites_updated_at
  BEFORE UPDATE ON holerites
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 5. Comentários
COMMENT ON TABLE holerites IS 'Holerites individuais dos funcionários';

-- ============================================================================
-- AGORA SIM: HABILITAR RLS E CRIAR POLÍTICAS
-- ============================================================================

ALTER TABLE holerites ENABLE ROW LEVEL SECURITY;

-- Limpar políticas antigas
DROP POLICY IF EXISTS "admin_all_holerites" ON holerites;
DROP POLICY IF EXISTS "funcionario_own_holerites" ON holerites;

-- Admin: todas as operações
CREATE POLICY "admin_all_holerites"
  ON holerites
  FOR ALL
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

-- Funcionário: ver e atualizar apenas seus holerites
CREATE POLICY "funcionario_own_holerites"
  ON holerites
  FOR ALL
  TO authenticated
  USING (
    colaborador_id IN (
      SELECT c.id 
      FROM colaboradores c
      JOIN app_users u ON u.id = c.user_id
      WHERE u.auth_uid = auth.uid()
      AND u.role = 'funcionario'
    )
  )
  WITH CHECK (
    colaborador_id IN (
      SELECT c.id 
      FROM colaboradores c
      JOIN app_users u ON u.id = c.user_id
      WHERE u.auth_uid = auth.uid()
      AND u.role = 'funcionario'
    )
  );

-- ============================================================================
-- FIM
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '✅ Migration 27 executada com sucesso!';
  RAISE NOTICE '📋 Tabela holerites criada';
  RAISE NOTICE '🔒 RLS configurado';
  RAISE NOTICE '📊 Índices criados';
  RAISE NOTICE '';
  RAISE NOTICE '🎯 Teste agora:';
  RAISE NOTICE '1. /folha-pagamento → Gerar Holerites';
  RAISE NOTICE '2. /employee → Aba Holerites';
END $$;
