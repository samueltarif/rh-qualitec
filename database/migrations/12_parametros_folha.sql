-- ============================================================================
-- 12_parametros_folha.sql - Parâmetros de Folha de Pagamento
-- ============================================================================
-- Descrição: Configurações de alíquotas, benefícios e descontos padrão
-- ============================================================================

CREATE TABLE IF NOT EXISTS parametros_folha (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- INSS (Alíquotas progressivas - SEM dedução)
  inss_faixa1_ate DECIMAL(10,2) DEFAULT 1320.00,
  inss_faixa1_aliquota DECIMAL(5,2) DEFAULT 7.5,
  
  inss_faixa2_ate DECIMAL(10,2) DEFAULT 2571.29,
  inss_faixa2_aliquota DECIMAL(5,2) DEFAULT 9.0,
  
  inss_faixa3_ate DECIMAL(10,2) DEFAULT 3856.94,
  inss_faixa3_aliquota DECIMAL(5,2) DEFAULT 12.0,
  
  inss_faixa4_ate DECIMAL(10,2) DEFAULT 7507.49,
  inss_faixa4_aliquota DECIMAL(5,2) DEFAULT 14.0,
  
  -- IRRF (Alíquotas progressivas)
  irrf_faixa1_ate DECIMAL(10,2) DEFAULT 2112.00,
  irrf_faixa1_aliquota DECIMAL(5,2) DEFAULT 0.0,
  irrf_faixa1_deducao DECIMAL(10,2) DEFAULT 0.0,
  
  irrf_faixa2_ate DECIMAL(10,2) DEFAULT 2826.65,
  irrf_faixa2_aliquota DECIMAL(5,2) DEFAULT 7.5,
  irrf_faixa2_deducao DECIMAL(10,2) DEFAULT 158.40,
  
  irrf_faixa3_ate DECIMAL(10,2) DEFAULT 3751.05,
  irrf_faixa3_aliquota DECIMAL(5,2) DEFAULT 15.0,
  irrf_faixa3_deducao DECIMAL(10,2) DEFAULT 370.40,
  
  irrf_faixa4_ate DECIMAL(10,2) DEFAULT 4664.68,
  irrf_faixa4_aliquota DECIMAL(5,2) DEFAULT 22.5,
  irrf_faixa4_deducao DECIMAL(10,2) DEFAULT 651.73,
  
  irrf_faixa5_aliquota DECIMAL(5,2) DEFAULT 27.5,
  irrf_faixa5_deducao DECIMAL(10,2) DEFAULT 884.96,
  
  -- FGTS
  fgts_aliquota DECIMAL(5,2) DEFAULT 8.0,
  
  -- Benefícios Padrão
  vale_transporte_desconto_max DECIMAL(5,2) DEFAULT 6.0,
  vale_alimentacao_valor DECIMAL(10,2) DEFAULT 0.0,
  vale_refeicao_valor DECIMAL(10,2) DEFAULT 0.0,
  
  -- Outros
  salario_familia_valor DECIMAL(10,2) DEFAULT 62.04,
  salario_familia_limite DECIMAL(10,2) DEFAULT 1819.26,
  
  -- Metadados
  vigencia_inicio DATE DEFAULT CURRENT_DATE,
  vigencia_fim DATE,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger para updated_at
CREATE TRIGGER tr_parametros_folha_updated_at
  BEFORE UPDATE ON parametros_folha
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Comentários
COMMENT ON TABLE parametros_folha IS 'Parâmetros e alíquotas para cálculo de folha de pagamento';
COMMENT ON COLUMN parametros_folha.inss_faixa1_aliquota IS 'Alíquota em % (ex: 7.5 para 7,5%)';
COMMENT ON COLUMN parametros_folha.fgts_aliquota IS 'Alíquota do FGTS em % (padrão 8%)';
COMMENT ON COLUMN parametros_folha.vale_transporte_desconto_max IS 'Desconto máximo de VT em % do salário';

-- Inserir parâmetros padrão (tabela 2024)
INSERT INTO parametros_folha (
  vigencia_inicio,
  ativo
) VALUES (
  '2024-01-01',
  true
) ON CONFLICT DO NOTHING;

-- ============================================================================
-- RLS (Row Level Security)
-- ============================================================================

ALTER TABLE parametros_folha ENABLE ROW LEVEL SECURITY;

-- Admin pode tudo
CREATE POLICY "admin_all_parametros_folha" ON parametros_folha
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM app_users 
      WHERE auth_uid = auth.uid() 
      AND role = 'admin'
    )
  );

-- Funcionários podem apenas visualizar
CREATE POLICY "employee_view_parametros_folha" ON parametros_folha
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
-- FIM
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '✅ Tabela parametros_folha criada com sucesso!';
  RAISE NOTICE '📋 Parâmetros padrão (tabela 2024) inseridos';
  RAISE NOTICE '💡 Configure os valores em /configuracoes/folha';
END $$;
