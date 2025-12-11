-- ============================================================================
-- Migration 31: Sistema de Assinatura de Ponto (SEM RLS)
-- ============================================================================

-- 1. Criar tabela de assinaturas
CREATE TABLE IF NOT EXISTS assinaturas_ponto (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  colaborador_id UUID NOT NULL REFERENCES colaboradores(id) ON DELETE CASCADE,
  mes INTEGER NOT NULL CHECK (mes >= 1 AND mes <= 12),
  ano INTEGER NOT NULL CHECK (ano >= 2020 AND ano <= 2100),
  data_assinatura TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ip_assinatura VARCHAR(45),
  user_agent TEXT,
  hash_assinatura TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(colaborador_id, mes, ano)
);

-- 2. Índices
CREATE INDEX IF NOT EXISTS idx_assinaturas_ponto_colaborador ON assinaturas_ponto(colaborador_id);
CREATE INDEX IF NOT EXISTS idx_assinaturas_ponto_mes_ano ON assinaturas_ponto(mes, ano);
CREATE INDEX IF NOT EXISTS idx_assinaturas_ponto_data ON assinaturas_ponto(data_assinatura DESC);

-- 3. Comentários
COMMENT ON TABLE assinaturas_ponto IS 'Registro de assinaturas digitais do ponto pelos funcionários';
