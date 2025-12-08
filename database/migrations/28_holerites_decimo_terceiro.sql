-- ============================================================================
-- Migration 28: Adicionar suporte para 13º Salário nos Holerites
-- ============================================================================

-- Adicionar campos para 13º salário
ALTER TABLE holerites 
ADD COLUMN IF NOT EXISTS tipo VARCHAR(50) DEFAULT 'mensal' CHECK (tipo IN ('mensal', 'decimo_terceiro', 'ferias', 'rescisao'));

ALTER TABLE holerites 
ADD COLUMN IF NOT EXISTS parcela_13 VARCHAR(20) CHECK (parcela_13 IN ('1', '2', 'integral'));

ALTER TABLE holerites 
ADD COLUMN IF NOT EXISTS meses_trabalhados INTEGER CHECK (meses_trabalhados >= 0 AND meses_trabalhados <= 12);

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_holerites_tipo ON holerites(tipo);
CREATE INDEX IF NOT EXISTS idx_holerites_parcela_13 ON holerites(parcela_13);
CREATE INDEX IF NOT EXISTS idx_holerites_tipo_ano ON holerites(tipo, ano);
CREATE INDEX IF NOT EXISTS idx_holerites_colaborador_tipo ON holerites(colaborador_id, tipo);

-- Comentários
COMMENT ON COLUMN holerites.tipo IS 'Tipo do holerite: mensal, decimo_terceiro, ferias, rescisao';
COMMENT ON COLUMN holerites.parcela_13 IS 'Parcela do 13º salário: 1 (primeira), 2 (segunda), integral';
COMMENT ON COLUMN holerites.meses_trabalhados IS 'Número de meses trabalhados no ano (para cálculo proporcional do 13º)';
