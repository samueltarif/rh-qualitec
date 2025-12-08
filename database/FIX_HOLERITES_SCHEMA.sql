-- ============================================================================
-- FIX: Recriar tabela holerites com todas as colunas necessárias
-- ============================================================================
-- Execute este script no SQL Editor do Supabase
-- ============================================================================

-- 1. Desabilitar RLS temporariamente
ALTER TABLE IF EXISTS holerites DISABLE ROW LEVEL SECURITY;

-- 2. Dropar políticas
DROP POLICY IF EXISTS "admin_all_holerites" ON holerites;
DROP POLICY IF EXISTS "funcionario_own_holerites" ON holerites;

-- 3. Dropar tabela antiga
DROP TABLE IF EXISTS holerites CASCADE;

-- 4. Recriar tabela com TODAS as colunas
CREATE TABLE holerites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  colaborador_id UUID NOT NULL REFERENCES colaboradores(id) ON DELETE CASCADE,
  mes INTEGER NOT NULL CHECK (mes >= 1 AND mes <= 12),
  ano INTEGER NOT NULL CHECK (ano >= 2020 AND ano <= 2100),
  
  -- Dados do colaborador
  nome_colaborador VARCHAR(255) NOT NULL,
  cpf VARCHAR(14) NOT NULL,
  cargo VARCHAR(255),
  departamento VARCHAR(255),
  
  -- Proventos
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
  
  -- Encargos (empresa)
  fgts DECIMAL(10,2) DEFAULT 0,
  inss_patronal DECIMAL(10,2) DEFAULT 0,
  
  -- Dados bancários
  banco VARCHAR(100),
  agencia VARCHAR(20),
  conta VARCHAR(30),
  
  -- Observações
  observacoes TEXT,
  
  -- Status e controle
  status VARCHAR(20) DEFAULT 'gerado' CHECK (status IN ('gerado', 'enviado', 'visualizado', 'pago')),
  data_pagamento DATE,
  
  -- Auditoria
  gerado_por UUID,
  gerado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  enviado_em TIMESTAMP WITH TIME ZONE,
  visualizado_em TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraint única
  UNIQUE(colaborador_id, mes, ano)
);

-- 5. Criar índices
CREATE INDEX idx_holerites_colaborador ON holerites(colaborador_id);
CREATE INDEX idx_holerites_mes_ano ON holerites(mes, ano);
CREATE INDEX idx_holerites_status ON holerites(status);
CREATE INDEX idx_holerites_gerado_em ON holerites(gerado_em);

-- 6. Trigger para updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_holerites_updated_at ON holerites;
CREATE TRIGGER update_holerites_updated_at
  BEFORE UPDATE ON holerites
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 7. Habilitar RLS
ALTER TABLE holerites ENABLE ROW LEVEL SECURITY;

-- 8. Criar políticas
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

-- Funcionário: ver apenas seus holerites
CREATE POLICY "funcionario_own_holerites"
  ON holerites
  FOR SELECT
  TO authenticated
  USING (
    colaborador_id IN (
      SELECT c.id 
      FROM colaboradores c
      JOIN app_users u ON u.id = c.user_id
      WHERE u.auth_uid = auth.uid()
      AND u.role = 'funcionario'
    )
  );

-- 9. Comentários
COMMENT ON TABLE holerites IS 'Holerites (contracheques) dos colaboradores';
COMMENT ON COLUMN holerites.banco IS 'Nome do banco para pagamento';
COMMENT ON COLUMN holerites.agencia IS 'Agência bancária';
COMMENT ON COLUMN holerites.conta IS 'Número da conta bancária';

-- ============================================================================
-- VERIFICAÇÃO
-- ============================================================================

-- Verificar estrutura da tabela
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'holerites'
ORDER BY ordinal_position;

-- ============================================================================
-- RESULTADO ESPERADO
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '✅ Tabela holerites recriada com sucesso!';
  RAISE NOTICE '';
  RAISE NOTICE '📋 Colunas incluídas:';
  RAISE NOTICE '   - banco, agencia, conta (dados bancários)';
  RAISE NOTICE '   - Todos os campos de proventos e descontos';
  RAISE NOTICE '   - Status e auditoria completos';
  RAISE NOTICE '';
  RAISE NOTICE '🔒 RLS configurado:';
  RAISE NOTICE '   - Admin: acesso total';
  RAISE NOTICE '   - Funcionário: visualizar apenas seus holerites';
  RAISE NOTICE '';
  RAISE NOTICE '🎯 Próximos passos:';
  RAISE NOTICE '   1. Reinicie o servidor Nuxt (Ctrl+C e npm run dev)';
  RAISE NOTICE '   2. Acesse /folha-pagamento';
  RAISE NOTICE '   3. Clique em "Gerar Holerites"';
  RAISE NOTICE '   4. Selecione mês/ano e colaboradores';
END $$;
