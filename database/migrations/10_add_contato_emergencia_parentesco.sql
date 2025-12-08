-- ============================================================================
-- ADICIONAR CAMPO PARENTESCO NO CONTATO DE EMERGÊNCIA
-- Execute este SQL no Supabase SQL Editor
-- ============================================================================

-- Adicionar coluna de parentesco
ALTER TABLE colaboradores ADD COLUMN IF NOT EXISTS contato_emergencia_parentesco VARCHAR(50);

-- Comentário
COMMENT ON COLUMN colaboradores.contato_emergencia_parentesco IS 'Parentesco do contato de emergência (Pai, Mãe, Cônjuge, etc)';
