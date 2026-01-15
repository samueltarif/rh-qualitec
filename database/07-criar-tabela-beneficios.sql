-- =====================================================
-- MIGRAÇÃO: TABELA DE BENEFÍCIOS
-- =====================================================

-- Criar tabela de benefícios (catálogo geral)
CREATE TABLE IF NOT EXISTS beneficios (
  id BIGSERIAL PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  descricao TEXT,
  valor DECIMAL(10,2) NOT NULL DEFAULT 0,
  desconto DECIMAL(10,2) NOT NULL DEFAULT 0,
  icone VARCHAR(10) DEFAULT '🎁',
  ativo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_beneficios_ativo ON beneficios(ativo);

-- Trigger para updated_at
DROP TRIGGER IF EXISTS update_beneficios_updated_at ON beneficios;
CREATE TRIGGER update_beneficios_updated_at
  BEFORE UPDATE ON beneficios
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Habilitar RLS
ALTER TABLE beneficios ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
DROP POLICY IF EXISTS "Todos podem ver benefícios" ON beneficios;
CREATE POLICY "Todos podem ver benefícios" ON beneficios
  FOR SELECT USING (ativo = true);

DROP POLICY IF EXISTS "Service role pode tudo em benefícios" ON beneficios;
CREATE POLICY "Service role pode tudo em benefícios" ON beneficios
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);

-- Inserir benefícios padrão
INSERT INTO beneficios (nome, descricao, valor, desconto, icone) VALUES
  ('Vale Refeição', 'Cartão para alimentação', 800.00, 0.00, '🍽️'),
  ('Vale Transporte', 'Auxílio para deslocamento', 300.00, 180.00, '🚌'),
  ('Plano de Saúde', 'Cobertura médica completa', 500.00, 100.00, '🏥'),
  ('Vale Alimentação', 'Cartão para supermercado', 400.00, 0.00, '🛒'),
  ('Plano Odontológico', 'Cobertura odontológica', 150.00, 50.00, '🦷'),
  ('Seguro de Vida', 'Seguro de vida em grupo', 80.00, 0.00, '🛡️')
ON CONFLICT DO NOTHING;

-- Verificar
SELECT id, nome, valor, desconto, icone FROM beneficios ORDER BY id;
