-- =====================================================
-- MIGRATION 23: Sistema de Gestão de Férias (ATUALIZAÇÃO)
-- =====================================================
-- Esta migration ATUALIZA a tabela ferias existente e adiciona
-- novas tabelas para um sistema completo de gestão de férias
-- =====================================================

-- =====================================================
-- 1. ADICIONAR NOVOS CAMPOS NA TABELA FERIAS EXISTENTE
-- =====================================================

-- Adicionar campo tipo de férias
ALTER TABLE ferias ADD COLUMN IF NOT EXISTS tipo VARCHAR(30) DEFAULT 'normal';

-- Adicionar campo para venda de dias (abono pecuniário já existe como dias_abono)
ALTER TABLE ferias ADD COLUMN IF NOT EXISTS vender_dias BOOLEAN DEFAULT FALSE;

-- Adicionar campo para adiantamento do 13º
ALTER TABLE ferias ADD COLUMN IF NOT EXISTS adiantamento_13 BOOLEAN DEFAULT FALSE;

-- Adicionar campo aprovador_id referenciando colaboradores
ALTER TABLE ferias ADD COLUMN IF NOT EXISTS aprovador_colaborador_id UUID REFERENCES colaboradores(id) ON DELETE SET NULL;

-- Renomear dias_gozo para dias_solicitados se necessário (manter compatibilidade)
-- ALTER TABLE ferias RENAME COLUMN dias_gozo TO dias_solicitados;

-- Adicionar constraint de tipo se não existir
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'chk_ferias_tipo'
  ) THEN
    ALTER TABLE ferias ADD CONSTRAINT chk_ferias_tipo 
      CHECK (tipo IN ('normal', 'fracionada', 'abono_pecuniario', 'coletiva'));
  END IF;
END $$;

-- =====================================================
-- 2. TABELA DE CONFIGURAÇÕES DE FÉRIAS
-- =====================================================

CREATE TABLE IF NOT EXISTS config_ferias (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dias_minimos_fracionamento INTEGER DEFAULT 5,
  dias_maximos_venda INTEGER DEFAULT 10,
  antecedencia_minima_dias INTEGER DEFAULT 30,
  permite_fracionamento BOOLEAN DEFAULT TRUE,
  max_fracoes INTEGER DEFAULT 3,
  permite_abono_pecuniario BOOLEAN DEFAULT TRUE,
  notificar_vencimento_dias INTEGER DEFAULT 60,
  notificar_aprovador BOOLEAN DEFAULT TRUE,
  notificar_rh BOOLEAN DEFAULT TRUE,
  bloquear_ferias_coletivas BOOLEAN DEFAULT FALSE,
  periodos_bloqueados JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 3. TABELA DE PROGRAMAÇÃO DE FÉRIAS (CALENDÁRIO ANUAL)
-- =====================================================

CREATE TABLE IF NOT EXISTS programacao_ferias (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  colaborador_id UUID NOT NULL REFERENCES colaboradores(id) ON DELETE CASCADE,
  ferias_id UUID REFERENCES ferias(id) ON DELETE CASCADE,
  ano_referencia INTEGER NOT NULL,
  mes_previsto INTEGER CHECK (mes_previsto BETWEEN 1 AND 12),
  data_inicio_prevista DATE,
  data_fim_prevista DATE,
  dias_previstos INTEGER,
  confirmada BOOLEAN DEFAULT FALSE,
  observacoes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 4. TABELA DE HISTÓRICO DE FÉRIAS
-- =====================================================

CREATE TABLE IF NOT EXISTS historico_ferias (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ferias_id UUID NOT NULL REFERENCES ferias(id) ON DELETE CASCADE,
  acao VARCHAR(50) NOT NULL,
  usuario_id UUID REFERENCES users(id),
  dados_anteriores JSONB,
  dados_novos JSONB,
  observacoes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 5. ÍNDICES ADICIONAIS
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_ferias_tipo ON ferias(tipo);
CREATE INDEX IF NOT EXISTS idx_ferias_aprovador_colab ON ferias(aprovador_colaborador_id);
CREATE INDEX IF NOT EXISTS idx_programacao_ferias_colaborador ON programacao_ferias(colaborador_id);
CREATE INDEX IF NOT EXISTS idx_programacao_ferias_ano ON programacao_ferias(ano_referencia);
CREATE INDEX IF NOT EXISTS idx_historico_ferias_ferias ON historico_ferias(ferias_id);

-- =====================================================
-- 6. INSERIR CONFIGURAÇÃO PADRÃO
-- =====================================================

INSERT INTO config_ferias (
  dias_minimos_fracionamento,
  dias_maximos_venda,
  antecedencia_minima_dias,
  permite_fracionamento,
  max_fracoes,
  permite_abono_pecuniario,
  notificar_vencimento_dias
) 
SELECT 5, 10, 30, TRUE, 3, TRUE, 60
WHERE NOT EXISTS (SELECT 1 FROM config_ferias LIMIT 1);

-- =====================================================
-- 7. TRIGGERS
-- =====================================================

-- Trigger para config_ferias
DROP TRIGGER IF EXISTS trigger_config_ferias_updated_at ON config_ferias;
CREATE TRIGGER trigger_config_ferias_updated_at
  BEFORE UPDATE ON config_ferias
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Trigger para programacao_ferias
DROP TRIGGER IF EXISTS trigger_programacao_ferias_updated_at ON programacao_ferias;
CREATE TRIGGER trigger_programacao_ferias_updated_at
  BEFORE UPDATE ON programacao_ferias
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- =====================================================
-- 8. VIEW PARA FÉRIAS COM DADOS COMPLETOS
-- =====================================================

CREATE OR REPLACE VIEW vw_ferias_completo AS
SELECT 
  f.id,
  f.colaborador_id,
  c.nome AS colaborador_nome,
  c.matricula,
  c.email_corporativo AS colaborador_email,
  car.nome AS cargo,
  d.nome AS departamento,
  f.periodo_aquisitivo_inicio,
  f.periodo_aquisitivo_fim,
  f.data_inicio,
  f.data_fim,
  f.dias_gozo AS dias_solicitados,
  f.dias_abono AS dias_venda,
  f.valor_abono,
  f.valor_ferias,
  f.valor_terco,
  f.valor_total,
  COALESCE(f.tipo, 'normal') AS tipo,
  COALESCE(f.vender_dias, FALSE) AS vender_dias,
  COALESCE(f.adiantamento_13, FALSE) AS adiantamento_13,
  f.status::TEXT AS status,
  f.solicitado_em AS created_at,
  f.aprovado_por,
  u.nome AS aprovador_nome,
  f.aprovado_em AS data_aprovacao,
  f.motivo_rejeicao,
  f.observacoes,
  f.updated_at,
  -- Calcular dias até vencer período concessivo
  CASE 
    WHEN f.periodo_aquisitivo_fim + INTERVAL '12 months' > CURRENT_DATE 
    THEN (f.periodo_aquisitivo_fim + INTERVAL '12 months')::DATE - CURRENT_DATE
    ELSE 0
  END AS dias_ate_vencer,
  -- Status do período
  CASE 
    WHEN f.periodo_aquisitivo_fim + INTERVAL '12 months' < CURRENT_DATE THEN 'vencido'
    WHEN f.periodo_aquisitivo_fim + INTERVAL '12 months' < CURRENT_DATE + INTERVAL '60 days' THEN 'vencendo'
    ELSE 'ok'
  END AS status_periodo
FROM ferias f
JOIN colaboradores c ON c.id = f.colaborador_id
LEFT JOIN cargos car ON car.id = c.cargo_id
LEFT JOIN departamentos d ON d.id = c.departamento_id
LEFT JOIN users u ON u.id = f.aprovado_por;

-- =====================================================
-- 9. FUNÇÃO PARA CALCULAR SALDO DE FÉRIAS
-- =====================================================

CREATE OR REPLACE FUNCTION calcular_saldo_ferias(p_colaborador_id UUID)
RETURNS TABLE (
  periodo_inicio DATE,
  periodo_fim DATE,
  dias_direito INTEGER,
  dias_gozados INTEGER,
  dias_vendidos INTEGER,
  dias_saldo INTEGER,
  data_limite DATE,
  status TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    f.periodo_aquisitivo_inicio,
    f.periodo_aquisitivo_fim,
    30 AS dias_direito,
    COALESCE(SUM(CASE WHEN f.status::TEXT IN ('Aprovada', 'Em_Andamento', 'Concluida') THEN f.dias_gozo ELSE 0 END), 0)::INTEGER AS dias_gozados,
    COALESCE(SUM(CASE WHEN f.status::TEXT IN ('Aprovada', 'Em_Andamento', 'Concluida') THEN f.dias_abono ELSE 0 END), 0)::INTEGER AS dias_vendidos,
    (30 - COALESCE(SUM(CASE WHEN f.status::TEXT IN ('Aprovada', 'Em_Andamento', 'Concluida') THEN f.dias_gozo + f.dias_abono ELSE 0 END), 0))::INTEGER AS dias_saldo,
    (f.periodo_aquisitivo_fim + INTERVAL '12 months')::DATE AS data_limite,
    CASE 
      WHEN f.periodo_aquisitivo_fim + INTERVAL '12 months' < CURRENT_DATE THEN 'vencido'
      WHEN f.periodo_aquisitivo_fim > CURRENT_DATE THEN 'em_aquisicao'
      ELSE 'adquirido'
    END AS status
  FROM ferias f
  WHERE f.colaborador_id = p_colaborador_id
  GROUP BY f.periodo_aquisitivo_inicio, f.periodo_aquisitivo_fim
  ORDER BY f.periodo_aquisitivo_inicio DESC;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- FIM DA MIGRATION
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE '✅ Sistema de Férias atualizado!';
  RAISE NOTICE '📋 Tabela ferias: campos adicionados (tipo, vender_dias, adiantamento_13)';
  RAISE NOTICE '📋 Tabela config_ferias: configurações do sistema';
  RAISE NOTICE '📋 Tabela programacao_ferias: calendário anual';
  RAISE NOTICE '📋 Tabela historico_ferias: auditoria';
  RAISE NOTICE '📋 View vw_ferias_completo: dados consolidados';
  RAISE NOTICE '💡 Acesse a página de Férias no painel admin';
END $$;
