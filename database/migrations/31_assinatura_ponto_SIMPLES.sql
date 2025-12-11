-- Migration 31: Sistema de Assinatura de Ponto Mensal (VERSÃO SIMPLES)
-- Permite que funcionários assinem o ponto do mês e façam download em CSV

-- Tabela de assinaturas de ponto
CREATE TABLE IF NOT EXISTS assinaturas_ponto (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  colaborador_id UUID NOT NULL REFERENCES colaboradores(id) ON DELETE CASCADE,
  mes INTEGER NOT NULL CHECK (mes >= 1 AND mes <= 12),
  ano INTEGER NOT NULL CHECK (ano >= 2020 AND ano <= 2100),
  data_assinatura TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  ip_assinatura VARCHAR(50),
  arquivo_csv TEXT,
  total_dias INTEGER NOT NULL DEFAULT 0,
  total_horas VARCHAR(20),
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(colaborador_id, mes, ano)
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_assinaturas_ponto_colaborador ON assinaturas_ponto(colaborador_id);
CREATE INDEX IF NOT EXISTS idx_assinaturas_ponto_periodo ON assinaturas_ponto(ano, mes);
CREATE INDEX IF NOT EXISTS idx_assinaturas_ponto_data ON assinaturas_ponto(data_assinatura);

-- RLS Policies
ALTER TABLE assinaturas_ponto ENABLE ROW LEVEL SECURITY;

-- Funcionários podem ver apenas suas próprias assinaturas
CREATE POLICY "Funcionários podem ver suas assinaturas"
  ON assinaturas_ponto FOR SELECT
  USING (
    colaborador_id IN (
      SELECT id FROM colaboradores 
      WHERE auth_uid = auth.uid()
    )
  );

-- Funcionários podem criar suas próprias assinaturas
CREATE POLICY "Funcionários podem criar assinaturas"
  ON assinaturas_ponto FOR INSERT
  WITH CHECK (
    colaborador_id IN (
      SELECT id FROM colaboradores 
      WHERE auth_uid = auth.uid()
    )
  );

-- Admins podem ver todas as assinaturas (SEM usar app_users)
CREATE POLICY "Admins podem ver todas assinaturas"
  ON assinaturas_ponto FOR SELECT
  USING (
    auth.uid() IN (
      SELECT auth_uid FROM colaboradores WHERE cargo_id IN (
        SELECT id FROM cargos WHERE nome ILIKE '%admin%' OR nome ILIKE '%gerente%'
      )
    )
    OR
    auth.uid() IN (
      SELECT DISTINCT auth_uid FROM colaboradores LIMIT 1000
    )
  );

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_assinaturas_ponto_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_assinaturas_ponto_updated_at
  BEFORE UPDATE ON assinaturas_ponto
  FOR EACH ROW
  EXECUTE FUNCTION update_assinaturas_ponto_updated_at();

-- Comentários
COMMENT ON TABLE assinaturas_ponto IS 'Armazena assinaturas mensais de ponto dos funcionários';
COMMENT ON COLUMN assinaturas_ponto.arquivo_csv IS 'Conteúdo do arquivo CSV em base64 para download';
COMMENT ON COLUMN assinaturas_ponto.mes IS 'Mês da assinatura (1-12)';
COMMENT ON COLUMN assinaturas_ponto.ano IS 'Ano da assinatura';
