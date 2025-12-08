-- ============================================================================
-- SCRIPT COMPLETO: PORTAL DO FUNCIONÁRIO
-- Execute este SQL no Supabase SQL Editor
-- ============================================================================

-- ============================================================================
-- 1. TABELA DE SOLICITAÇÕES DO FUNCIONÁRIO
-- ============================================================================
CREATE TABLE IF NOT EXISTS solicitacoes_funcionario (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  colaborador_id UUID NOT NULL REFERENCES colaboradores(id) ON DELETE CASCADE,
  tipo VARCHAR(50) NOT NULL CHECK (tipo IN (
    'ferias', 'abono', 'atestado', 'declaracao', 'alteracao_dados',
    'holerite', 'informe_rendimentos', 'carta_referencia', 'outros'
  )),
  titulo VARCHAR(200) NOT NULL,
  descricao TEXT,
  status VARCHAR(30) NOT NULL DEFAULT 'Pendente' CHECK (status IN (
    'Pendente', 'Em_Analise', 'Aprovada', 'Rejeitada', 'Cancelada', 'Concluida'
  )),
  prioridade VARCHAR(20) DEFAULT 'Normal' CHECK (prioridade IN ('Baixa', 'Normal', 'Alta', 'Urgente')),
  data_solicitacao TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  data_resposta TIMESTAMPTZ,
  respondido_por UUID REFERENCES app_users(id),
  resposta TEXT,
  motivo_rejeicao TEXT,
  anexos JSONB DEFAULT '[]',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_solicitacoes_func_empresa ON solicitacoes_funcionario(empresa_id);
CREATE INDEX IF NOT EXISTS idx_solicitacoes_func_colaborador ON solicitacoes_funcionario(colaborador_id);
CREATE INDEX IF NOT EXISTS idx_solicitacoes_func_status ON solicitacoes_funcionario(status);
CREATE INDEX IF NOT EXISTS idx_solicitacoes_func_tipo ON solicitacoes_funcionario(tipo);

-- ============================================================================
-- 2. TABELA DE DOCUMENTOS DO FUNCIONÁRIO
-- ============================================================================
CREATE TABLE IF NOT EXISTS documentos_funcionario (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  colaborador_id UUID NOT NULL REFERENCES colaboradores(id) ON DELETE CASCADE,
  tipo VARCHAR(50) NOT NULL CHECK (tipo IN (
    'holerite', 'informe_rendimentos', 'ferias', 'rescisao', 
    'contrato', 'aditivo', 'advertencia', 'certificado', 'outros'
  )),
  titulo VARCHAR(200) NOT NULL,
  descricao TEXT,
  competencia VARCHAR(7),
  ano_referencia INTEGER,
  arquivo_url TEXT,
  arquivo_nome VARCHAR(255),
  arquivo_tamanho INTEGER,
  disponivel_para_funcionario BOOLEAN DEFAULT true,
  visualizado_em TIMESTAMPTZ,
  baixado_em TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_docs_func_empresa ON documentos_funcionario(empresa_id);
CREATE INDEX IF NOT EXISTS idx_docs_func_colaborador ON documentos_funcionario(colaborador_id);
CREATE INDEX IF NOT EXISTS idx_docs_func_tipo ON documentos_funcionario(tipo);

-- ============================================================================
-- 3. TABELA DE REGISTRO DE PONTO
-- ============================================================================
CREATE TABLE IF NOT EXISTS registros_ponto (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  colaborador_id UUID NOT NULL REFERENCES colaboradores(id) ON DELETE CASCADE,
  data DATE NOT NULL,
  entrada_1 TIME,
  saida_1 TIME,
  entrada_2 TIME,
  saida_2 TIME,
  entrada_3 TIME,
  saida_3 TIME,
  horas_trabalhadas INTERVAL,
  horas_extras INTERVAL,
  horas_falta INTERVAL,
  observacoes TEXT,
  justificativa TEXT,
  status VARCHAR(30) DEFAULT 'Normal' CHECK (status IN (
    'Normal', 'Falta', 'Atestado', 'Ferias', 'Folga', 'Feriado', 'Ajustado'
  )),
  ajustado_por UUID REFERENCES app_users(id),
  ajustado_em TIMESTAMPTZ,
  ip_registro VARCHAR(45),
  localizacao JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(colaborador_id, data)
);

CREATE INDEX IF NOT EXISTS idx_ponto_empresa ON registros_ponto(empresa_id);
CREATE INDEX IF NOT EXISTS idx_ponto_colaborador ON registros_ponto(colaborador_id);
CREATE INDEX IF NOT EXISTS idx_ponto_data ON registros_ponto(data DESC);

-- ============================================================================
-- 4. TABELA DE BANCO DE HORAS
-- ============================================================================
CREATE TABLE IF NOT EXISTS banco_horas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  colaborador_id UUID NOT NULL REFERENCES colaboradores(id) ON DELETE CASCADE,
  data DATE NOT NULL,
  tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('credito', 'debito', 'compensacao')),
  horas INTERVAL NOT NULL,
  descricao TEXT,
  registro_ponto_id UUID REFERENCES registros_ponto(id),
  aprovado_por UUID REFERENCES app_users(id),
  aprovado_em TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_banco_horas_colaborador ON banco_horas(colaborador_id);

-- ============================================================================
-- 5. TABELA DE COMUNICADOS
-- ============================================================================
CREATE TABLE IF NOT EXISTS comunicados (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  titulo VARCHAR(200) NOT NULL,
  conteudo TEXT NOT NULL,
  tipo VARCHAR(30) DEFAULT 'Informativo' CHECK (tipo IN (
    'Informativo', 'Importante', 'Urgente', 'Evento', 'Beneficio'
  )),
  data_publicacao TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  data_expiracao TIMESTAMPTZ,
  publicado_por UUID REFERENCES app_users(id),
  ativo BOOLEAN DEFAULT true,
  destino VARCHAR(30) DEFAULT 'todos' CHECK (destino IN ('todos', 'departamento', 'cargo', 'individual')),
  destino_ids UUID[] DEFAULT '{}',
  anexos JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_comunicados_empresa ON comunicados(empresa_id);
CREATE INDEX IF NOT EXISTS idx_comunicados_ativo ON comunicados(ativo);

-- ============================================================================
-- 6. TABELA DE LEITURA DE COMUNICADOS
-- ============================================================================
CREATE TABLE IF NOT EXISTS comunicados_lidos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  comunicado_id UUID NOT NULL REFERENCES comunicados(id) ON DELETE CASCADE,
  colaborador_id UUID NOT NULL REFERENCES colaboradores(id) ON DELETE CASCADE,
  lido_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(comunicado_id, colaborador_id)
);

-- ============================================================================
-- 7. TRIGGERS PARA UPDATED_AT
-- ============================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_solicitacoes_funcionario_updated_at ON solicitacoes_funcionario;
CREATE TRIGGER update_solicitacoes_funcionario_updated_at
  BEFORE UPDATE ON solicitacoes_funcionario
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_documentos_funcionario_updated_at ON documentos_funcionario;
CREATE TRIGGER update_documentos_funcionario_updated_at
  BEFORE UPDATE ON documentos_funcionario
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_registros_ponto_updated_at ON registros_ponto;
CREATE TRIGGER update_registros_ponto_updated_at
  BEFORE UPDATE ON registros_ponto
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_comunicados_updated_at ON comunicados;
CREATE TRIGGER update_comunicados_updated_at
  BEFORE UPDATE ON comunicados
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 8. RLS (Row Level Security)
-- ============================================================================
ALTER TABLE solicitacoes_funcionario ENABLE ROW LEVEL SECURITY;
ALTER TABLE documentos_funcionario ENABLE ROW LEVEL SECURITY;
ALTER TABLE registros_ponto ENABLE ROW LEVEL SECURITY;
ALTER TABLE banco_horas ENABLE ROW LEVEL SECURITY;
ALTER TABLE comunicados ENABLE ROW LEVEL SECURITY;
ALTER TABLE comunicados_lidos ENABLE ROW LEVEL SECURITY;

-- Políticas para service_role (bypass)
CREATE POLICY "service_role_solicitacoes" ON solicitacoes_funcionario FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role_docs_func" ON documentos_funcionario FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role_ponto" ON registros_ponto FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role_banco_horas" ON banco_horas FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role_comunicados" ON comunicados FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "service_role_comunicados_lidos" ON comunicados_lidos FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ============================================================================
-- FIM DO SCRIPT
-- ============================================================================
SELECT 'Portal do Funcionário criado com sucesso!' as resultado;
