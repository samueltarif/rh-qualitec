-- ============================================================================
-- Fix: Adicionar campo de jornada nos colaboradores
-- ============================================================================
-- Descrição: Adiciona referência à jornada de trabalho na tabela de colaboradores
-- ============================================================================

-- Adicionar coluna de jornada (se não existir)
ALTER TABLE colaboradores 
  ADD COLUMN IF NOT EXISTS jornada_id UUID REFERENCES jornadas_trabalho(id);

-- Criar índice
CREATE INDEX IF NOT EXISTS idx_colaboradores_jornada ON colaboradores(jornada_id);

-- Comentário
COMMENT ON COLUMN colaboradores.jornada_id IS 'Referência à jornada de trabalho do colaborador';

-- ============================================================================
-- FIM
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '✅ Campo jornada_id adicionado aos colaboradores!';
  RAISE NOTICE '💡 Agora você pode vincular colaboradores às jornadas de trabalho';
END $$;
