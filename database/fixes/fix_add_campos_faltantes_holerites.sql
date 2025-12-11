-- ============================================
-- FIX: Adicionar Campos Faltantes na Tabela Holerites
-- ============================================
-- Este script adiciona todos os campos que estavam faltando
-- para suportar os 24 campos do modal de edição

-- PROVENTOS
ALTER TABLE holerites ADD COLUMN IF NOT EXISTS bonus DECIMAL(10,2) DEFAULT 0;
ALTER TABLE holerites ADD COLUMN IF NOT EXISTS comissoes DECIMAL(10,2) DEFAULT 0;

-- DESCONTOS
ALTER TABLE holerites ADD COLUMN IF NOT EXISTS adiantamento DECIMAL(10,2) DEFAULT 0;
ALTER TABLE holerites ADD COLUMN IF NOT EXISTS emprestimos DECIMAL(10,2) DEFAULT 0;

-- BENEFÍCIOS
ALTER TABLE holerites ADD COLUMN IF NOT EXISTS vale_alimentacao DECIMAL(10,2) DEFAULT 0;
ALTER TABLE holerites ADD COLUMN IF NOT EXISTS plano_odontologico DECIMAL(10,2) DEFAULT 0;
ALTER TABLE holerites ADD COLUMN IF NOT EXISTS seguro_vida DECIMAL(10,2) DEFAULT 0;
ALTER TABLE holerites ADD COLUMN IF NOT EXISTS auxilio_creche DECIMAL(10,2) DEFAULT 0;
ALTER TABLE holerites ADD COLUMN IF NOT EXISTS auxilio_educacao DECIMAL(10,2) DEFAULT 0;
ALTER TABLE holerites ADD COLUMN IF NOT EXISTS auxilio_combustivel DECIMAL(10,2) DEFAULT 0;
ALTER TABLE holerites ADD COLUMN IF NOT EXISTS outros_beneficios DECIMAL(10,2) DEFAULT 0;

-- Verificar se as colunas foram criadas
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'holerites' 
  AND column_name IN (
    'bonus', 
    'comissoes', 
    'adiantamento', 
    'emprestimos',
    'vale_alimentacao',
    'plano_odontologico',
    'seguro_vida',
    'auxilio_creche',
    'auxilio_educacao',
    'auxilio_combustivel',
    'outros_beneficios'
  )
ORDER BY column_name;
