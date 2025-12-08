-- ============================================================================
-- Migration 27: Sistema de Holerites (VERSÃO FINAL CORRIGIDA)
-- ============================================================================
-- Descrição: Cria tabela para armazenar holerites individuais dos funcionários
-- Data: 2024-12-05
-- IMPORTANTE: Execute ESTE arquivo (27_holerites_FINAL.sql)
-- ============================================================================

-- 1. Criar tabela de holerites
CREATE TABLE IF NOT EXISTS holerites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  colaborador_id UUID NOT NULL REFERENCES colaboradores(id) ON DELETE CASCADE,
  mes INTEGER NOT NULL CHECK (mes >= 1 AND mes <= 12),
  ano INTEGER NOT NULL CHECK (ano >= 2020 AND ano <= 2100),
  
  -- Dados do colaborador (snapshot no momento da geração)
  nome_colaborador VARCHAR(255) NOT NULL,
  cpf VARCHAR(14) NOT NULL,
  cargo VARCHAR(255),
  departamento VARCHAR(255),
  
  -- Valores
  salario_base DECIMAL(10,2) NOT NULL DEFAULT 0,
  horas_trabalhadas DECIMAL(10,2) DEFAULT 0,
  horas_extras_50 DECIMAL(10,2) DEFAULT 0,
  horas_extras_100 DECIMAL(10,2) DEFAULT 0,
  
  -- Proventos
  valor_horas_extras_50 DECIMAL(10,2) DEFAULT 0,
  valor_horas_extras_100 DECIMAL(10,2) DEFAULT 0,
  adicional_noturno DECIMAL(10,2) DEFAULT 0,
  adicional_insalubridade DECIMAL(10,2) DEFAULT 0,
  adicional_periculosidade DECIMAL(10,2) DEFAULT 0,
  outros_proventos DECIMAL(10,2) DEFAULT 0,
  descricao_outros_proventos TEXT,
  total_proventos DECIMAL(10,2) NOT NULL DEFAULT 0,
  
  -- Descontos
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
  
  -- Totais
  salario_bruto DECIMAL(10,2) NOT NULL DEFAULT 0,
  salario_liquido DECIMAL(10,2) NOT NULL DEFAULT 0,
  
  -- Encargos da empresa (não aparecem no holerite do funcionário)
  fgts DECIMAL(10,2) DEFAULT 0,
  inss_patronal DECIMAL(10,2) DEFAULT 0,
  
  -- Dados bancários
  banco VARCHAR(100),
  agencia VARCHAR(20),
  conta VARCHAR(30),
  
  -- Observações
  observacoes TEXT,
  
  -- Status
  status VARCHAR(20) DEFAULT 'gerado' CHECK (status IN ('gerado', 'enviado', 'visualizado', 'pago')),
  data_pagamento DATE,
  
  -- Controle
  gerado_por UUID,
  gerado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  enviado_em TIMESTAMP WITH TIME ZONE,
  visualizado_em TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraint: Um holerite por colaborador por mês/ano
  UNIQUE(colaborador_id, mes, ano)
);

-- 2. Índices
CREATE INDEX IF NOT EXISTS idx_holerites_colaborador ON holerites(colaborador_id);
CREATE INDEX IF NOT EXISTS idx_holerites_mes_ano ON holerites(mes, ano);
CREATE INDEX IF NOT EXISTS idx_holerites_status ON holerites(status);
CREATE INDEX IF NOT EXISTS idx_holerites_data_pagamento ON holerites(data_pagamento);

-- 3. Criar função para atualizar updated_at (se não existir)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. Trigger para updated_at
DROP TRIGGER IF EXISTS update_holerites_updated_at ON holerites;
CREATE TRIGGER update_holerites_updated_at
  BEFORE UPDATE ON holerites
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 5. RLS (Row Level Security)
ALTER TABLE holerites ENABLE ROW LEVEL SECURITY;

-- Remover políticas existentes (se houver)
DROP POLICY IF EXISTS "Admin pode ver todos os holerites" ON holerites;
DROP POLICY IF EXISTS "Admin pode inserir holerites" ON holerites;
DROP POLICY IF EXISTS "Admin pode atualizar holerites" ON holerites;
DROP POLICY IF EXISTS "Admin pode deletar holerites" ON holerites;
DROP POLICY IF EXISTS "Funcionário pode ver seus próprios holerites" ON holerites;
DROP POLICY IF EXISTS "Funcionário pode marcar holerite como visualizado" ON holerites;

-- Admin pode ver todos os holerites
CREATE POLICY "Admin pode ver todos os holerites"
  ON holerites FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM app_users
      WHERE app_users.auth_uid = auth.uid()
      AND app_users.role = 'admin'
    )
  );

-- Admin pode inserir holerites
CREATE POLICY "Admin pode inserir holerites"
  ON holerites FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM app_users
      WHERE app_users.auth_uid = auth.uid()
      AND app_users.role = 'admin'
    )
  );

-- Admin pode atualizar holerites
CREATE POLICY "Admin pode atualizar holerites"
  ON holerites FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM app_users
      WHERE app_users.auth_uid = auth.uid()
      AND app_users.role = 'admin'
    )
  );

-- Admin pode deletar holerites
CREATE POLICY "Admin pode deletar holerites"
  ON holerites FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM app_users
      WHERE app_users.auth_uid = auth.uid()
      AND app_users.role = 'admin'
    )
  );

-- Funcionário pode ver apenas seus próprios holerites
-- CORRIGIDO: colaboradores.user_id → app_users.id
CREATE POLICY "Funcionário pode ver seus próprios holerites"
  ON holerites FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM app_users u
      JOIN colaboradores c ON c.user_id = u.id
      WHERE u.auth_uid = auth.uid()
      AND u.role = 'funcionario'
      AND c.id = holerites.colaborador_id
    )
  );

-- Funcionário pode atualizar apenas o campo visualizado_em do seu holerite
CREATE POLICY "Funcionário pode marcar holerite como visualizado"
  ON holerites FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM app_users u
      JOIN colaboradores c ON c.user_id = u.id
      WHERE u.auth_uid = auth.uid()
      AND u.role = 'funcionario'
      AND c.id = holerites.colaborador_id
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM app_users u
      JOIN colaboradores c ON c.user_id = u.id
      WHERE u.auth_uid = auth.uid()
      AND u.role = 'funcionario'
      AND c.id = holerites.colaborador_id
    )
  );

-- 6. Comentários
COMMENT ON TABLE holerites IS 'Armazena os holerites individuais dos funcionários';
COMMENT ON COLUMN holerites.colaborador_id IS 'Referência ao colaborador';
COMMENT ON COLUMN holerites.mes IS 'Mês de referência (1-12)';
COMMENT ON COLUMN holerites.ano IS 'Ano de referência';
COMMENT ON COLUMN holerites.status IS 'Status do holerite: gerado, enviado, visualizado, pago';

-- ============================================================================
-- FIM DA MIGRATION 27
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '✅ Migration 27 executada com sucesso!';
  RAISE NOTICE '📋 Tabela holerites criada';
  RAISE NOTICE '🔒 RLS configurado (funcionários veem apenas seus holerites)';
  RAISE NOTICE '📊 Índices criados para performance';
  RAISE NOTICE '';
  RAISE NOTICE '🎯 Próximos passos:';
  RAISE NOTICE '1. Acesse /folha-pagamento como admin';
  RAISE NOTICE '2. Gere holerites para um período';
  RAISE NOTICE '3. Faça login como funcionário';
  RAISE NOTICE '4. Verifique a aba "Holerites" em /employee';
  RAISE NOTICE '';
  RAISE NOTICE '📝 Estrutura detectada:';
  RAISE NOTICE '   • colaboradores.user_id → app_users.id';
  RAISE NOTICE '   • app_users.auth_uid → auth.uid()';
END $$;
