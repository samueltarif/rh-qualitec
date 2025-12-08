-- ============================================================================
-- MIGRATION 25: ALTERAÇÃO DE DADOS PELO FUNCIONÁRIO
-- Sistema de solicitações de alteração com aprovação para dados bancários
-- Execute no Supabase SQL Editor
-- ============================================================================

-- ============================================================================
-- 1. TABELA DE SOLICITAÇÕES DE ALTERAÇÃO DE DADOS
-- ============================================================================
CREATE TABLE IF NOT EXISTS solicitacoes_alteracao_dados (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  colaborador_id UUID NOT NULL REFERENCES colaboradores(id) ON DELETE CASCADE,
  tipo VARCHAR(50) NOT NULL CHECK (tipo IN (
    'dados_bancarios', 'endereco', 'contato_emergencia', 'dados_pessoais', 'documentos'
  )),
  dados_anteriores JSONB NOT NULL DEFAULT '{}',
  dados_novos JSONB NOT NULL DEFAULT '{}',
  status VARCHAR(30) NOT NULL DEFAULT 'pendente' CHECK (status IN (
    'pendente', 'aprovada', 'rejeitada'
  )),
  requer_aprovacao BOOLEAN NOT NULL DEFAULT false,
  motivo_rejeicao TEXT,
  aprovado_por UUID REFERENCES app_users(id),
  aprovado_em TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_solic_alt_empresa ON solicitacoes_alteracao_dados(empresa_id);
CREATE INDEX IF NOT EXISTS idx_solic_alt_colaborador ON solicitacoes_alteracao_dados(colaborador_id);
CREATE INDEX IF NOT EXISTS idx_solic_alt_status ON solicitacoes_alteracao_dados(status);
CREATE INDEX IF NOT EXISTS idx_solic_alt_tipo ON solicitacoes_alteracao_dados(tipo);
CREATE INDEX IF NOT EXISTS idx_solic_alt_pendentes ON solicitacoes_alteracao_dados(status) WHERE status = 'pendente';

-- ============================================================================
-- 2. ADICIONAR CAMPOS DE CONTATOS DE EMERGÊNCIA EXTRAS
-- ============================================================================
ALTER TABLE colaboradores ADD COLUMN IF NOT EXISTS contato_emergencia_2_nome VARCHAR(200);
ALTER TABLE colaboradores ADD COLUMN IF NOT EXISTS contato_emergencia_2_parentesco VARCHAR(50);
ALTER TABLE colaboradores ADD COLUMN IF NOT EXISTS contato_emergencia_2_telefone VARCHAR(20);
ALTER TABLE colaboradores ADD COLUMN IF NOT EXISTS contato_emergencia_3_nome VARCHAR(200);
ALTER TABLE colaboradores ADD COLUMN IF NOT EXISTS contato_emergencia_3_parentesco VARCHAR(50);
ALTER TABLE colaboradores ADD COLUMN IF NOT EXISTS contato_emergencia_3_telefone VARCHAR(20);

-- ============================================================================
-- 3. TRIGGER PARA UPDATED_AT
-- ============================================================================
DROP TRIGGER IF EXISTS update_solicitacoes_alteracao_dados_updated_at ON solicitacoes_alteracao_dados;
CREATE TRIGGER update_solicitacoes_alteracao_dados_updated_at
  BEFORE UPDATE ON solicitacoes_alteracao_dados
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 4. RLS (Row Level Security)
-- ============================================================================
ALTER TABLE solicitacoes_alteracao_dados ENABLE ROW LEVEL SECURITY;

CREATE POLICY "service_role_solic_alt" ON solicitacoes_alteracao_dados 
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ============================================================================
-- 5. COMENTÁRIOS
-- ============================================================================
COMMENT ON TABLE solicitacoes_alteracao_dados IS 'Solicitações de alteração de dados feitas pelos funcionários';
COMMENT ON COLUMN solicitacoes_alteracao_dados.requer_aprovacao IS 'Se true, precisa de aprovação do admin (ex: dados bancários)';
COMMENT ON COLUMN solicitacoes_alteracao_dados.dados_anteriores IS 'Snapshot dos dados antes da alteração';
COMMENT ON COLUMN solicitacoes_alteracao_dados.dados_novos IS 'Novos dados solicitados';

-- ============================================================================
-- FIM DA MIGRATION 25
-- ============================================================================
