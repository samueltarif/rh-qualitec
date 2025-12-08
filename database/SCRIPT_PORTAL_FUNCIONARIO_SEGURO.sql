-- ============================================================================
-- SCRIPT SEGURO: PORTAL DO FUNCIONÁRIO
-- Este script verifica se as tabelas existem antes de criar
-- Execute no Supabase SQL Editor
-- ============================================================================

-- ============================================================================
-- 1. TABELA DE SOLICITAÇÕES DO FUNCIONÁRIO
-- (Diferente da tabela 'solicitacoes' que já existe no schema)
-- ============================================================================
CREATE TABLE IF NOT EXISTS solicitacoes_funcionario (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  colaborador_id UUID NOT NULL REFERENCES colaboradores(id) ON DELETE CASCADE,
  tipo VARCHAR(50) NOT NULL,
  titulo VARCHAR(200) NOT NULL,
  descricao TEXT,
  status VARCHAR(30) NOT NULL DEFAULT 'Pendente',
  prioridade VARCHAR(20) DEFAULT 'Normal',
  data_solicitacao TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  data_resposta TIMESTAMPTZ,
  respondido_por UUID,
  resposta TEXT,
  motivo_rejeicao TEXT,
  anexos JSONB DEFAULT '[]',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Adicionar FK para respondido_por se app_users existir
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'app_users') THEN
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.table_constraints 
      WHERE constraint_name = 'solicitacoes_funcionario_respondido_por_fkey'
    ) THEN
      ALTER TABLE solicitacoes_funcionario 
        ADD CONSTRAINT solicitacoes_funcionario_respondido_por_fkey 
        FOREIGN KEY (respondido_por) REFERENCES app_users(id);
    END IF;
  END IF;
END $$;

-- Índices (IF NOT EXISTS não funciona para índices, então usamos DO block)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_solicitacoes_func_empresa') THEN
    CREATE INDEX idx_solicitacoes_func_empresa ON solicitacoes_funcionario(empresa_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_solicitacoes_func_colaborador') THEN
    CREATE INDEX idx_solicitacoes_func_colaborador ON solicitacoes_funcionario(colaborador_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_solicitacoes_func_status') THEN
    CREATE INDEX idx_solicitacoes_func_status ON solicitacoes_funcionario(status);
  END IF;
END $$;

-- ============================================================================
-- 2. TABELA DE DOCUMENTOS DO FUNCIONÁRIO (Holerites, etc)
-- ============================================================================
CREATE TABLE IF NOT EXISTS documentos_funcionario (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  colaborador_id UUID NOT NULL REFERENCES colaboradores(id) ON DELETE CASCADE,
  tipo VARCHAR(50) NOT NULL,
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

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_docs_func_empresa') THEN
    CREATE INDEX idx_docs_func_empresa ON documentos_funcionario(empresa_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_docs_func_colaborador') THEN
    CREATE INDEX idx_docs_func_colaborador ON documentos_funcionario(colaborador_id);
  END IF;
END $$;

-- ============================================================================
-- 3. TABELA DE REGISTRO DE PONTO (se não existir)
-- Nota: Já existe tabela 'ponto' no schema, esta é complementar
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
  status VARCHAR(30) DEFAULT 'Normal',
  ajustado_por UUID,
  ajustado_em TIMESTAMPTZ,
  ip_registro VARCHAR(45),
  localizacao JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(colaborador_id, data)
);

-- Adicionar FK para ajustado_por se app_users existir
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'app_users') THEN
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.table_constraints 
      WHERE constraint_name = 'registros_ponto_ajustado_por_fkey'
    ) THEN
      ALTER TABLE registros_ponto 
        ADD CONSTRAINT registros_ponto_ajustado_por_fkey 
        FOREIGN KEY (ajustado_por) REFERENCES app_users(id);
    END IF;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_registros_ponto_empresa') THEN
    CREATE INDEX idx_registros_ponto_empresa ON registros_ponto(empresa_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_registros_ponto_colaborador') THEN
    CREATE INDEX idx_registros_ponto_colaborador ON registros_ponto(colaborador_id);
  END IF;
END $$;

-- ============================================================================
-- 4. TABELA DE COMUNICADOS
-- ============================================================================
CREATE TABLE IF NOT EXISTS comunicados (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  titulo VARCHAR(200) NOT NULL,
  conteudo TEXT NOT NULL,
  tipo VARCHAR(30) DEFAULT 'Informativo',
  data_publicacao TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  data_expiracao TIMESTAMPTZ,
  publicado_por UUID,
  ativo BOOLEAN DEFAULT true,
  destino VARCHAR(30) DEFAULT 'todos',
  destino_ids UUID[] DEFAULT '{}',
  anexos JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Adicionar FK para publicado_por se app_users existir
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'app_users') THEN
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.table_constraints 
      WHERE constraint_name = 'comunicados_publicado_por_fkey'
    ) THEN
      ALTER TABLE comunicados 
        ADD CONSTRAINT comunicados_publicado_por_fkey 
        FOREIGN KEY (publicado_por) REFERENCES app_users(id);
    END IF;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_comunicados_empresa') THEN
    CREATE INDEX idx_comunicados_empresa ON comunicados(empresa_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_comunicados_ativo') THEN
    CREATE INDEX idx_comunicados_ativo ON comunicados(ativo);
  END IF;
END $$;

-- ============================================================================
-- 5. TABELA DE LEITURA DE COMUNICADOS
-- ============================================================================
CREATE TABLE IF NOT EXISTS comunicados_lidos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  comunicado_id UUID NOT NULL REFERENCES comunicados(id) ON DELETE CASCADE,
  colaborador_id UUID NOT NULL REFERENCES colaboradores(id) ON DELETE CASCADE,
  lido_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(comunicado_id, colaborador_id)
);

-- ============================================================================
-- 6. TRIGGERS PARA UPDATED_AT (se não existirem)
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
-- 7. RLS (Row Level Security)
-- ============================================================================
ALTER TABLE solicitacoes_funcionario ENABLE ROW LEVEL SECURITY;
ALTER TABLE documentos_funcionario ENABLE ROW LEVEL SECURITY;
ALTER TABLE registros_ponto ENABLE ROW LEVEL SECURITY;
ALTER TABLE comunicados ENABLE ROW LEVEL SECURITY;
ALTER TABLE comunicados_lidos ENABLE ROW LEVEL SECURITY;

-- Políticas para service_role (bypass) - DROP IF EXISTS antes de criar
DROP POLICY IF EXISTS "service_role_solicitacoes_func" ON solicitacoes_funcionario;
CREATE POLICY "service_role_solicitacoes_func" ON solicitacoes_funcionario FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "service_role_docs_func" ON documentos_funcionario;
CREATE POLICY "service_role_docs_func" ON documentos_funcionario FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "service_role_registros_ponto" ON registros_ponto;
CREATE POLICY "service_role_registros_ponto" ON registros_ponto FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "service_role_comunicados" ON comunicados;
CREATE POLICY "service_role_comunicados" ON comunicados FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "service_role_comunicados_lidos" ON comunicados_lidos;
CREATE POLICY "service_role_comunicados_lidos" ON comunicados_lidos FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ============================================================================
-- FIM DO SCRIPT
-- ============================================================================
SELECT 'Portal do Funcionário - Tabelas criadas com sucesso!' as resultado;
