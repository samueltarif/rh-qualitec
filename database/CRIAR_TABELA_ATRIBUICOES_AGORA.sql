-- ============================================
-- CRIAR TABELA CURSOS_ATRIBUICOES - AGORA
-- ============================================

-- Criar tabela de atribuições de cursos
CREATE TABLE IF NOT EXISTS cursos_atribuicoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  curso_id UUID NOT NULL REFERENCES cursos(id) ON DELETE CASCADE,
  colaborador_id UUID NOT NULL REFERENCES colaboradores(id) ON DELETE CASCADE,
  data_atribuicao TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  data_conclusao TIMESTAMP WITH TIME ZONE,
  progresso INTEGER DEFAULT 0 CHECK (progresso >= 0 AND progresso <= 100),
  status VARCHAR(20) DEFAULT 'nao_iniciado' CHECK (status IN ('nao_iniciado', 'em_andamento', 'concluido')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(curso_id, colaborador_id)
);

-- Criar índices
CREATE INDEX IF NOT EXISTS idx_cursos_atribuicoes_curso ON cursos_atribuicoes(curso_id);
CREATE INDEX IF NOT EXISTS idx_cursos_atribuicoes_colaborador ON cursos_atribuicoes(colaborador_id);
CREATE INDEX IF NOT EXISTS idx_cursos_atribuicoes_status ON cursos_atribuicoes(status);

-- Habilitar RLS
ALTER TABLE cursos_atribuicoes ENABLE ROW LEVEL SECURITY;

-- Políticas RLS básicas (permissivas para teste)
DROP POLICY IF EXISTS "Admins gerenciam atribuições" ON cursos_atribuicoes;
CREATE POLICY "Admins gerenciam atribuições" 
  ON cursos_atribuicoes FOR ALL 
  USING (true);

-- Verificar criação
SELECT 'Tabela cursos_atribuicoes criada com sucesso!' as resultado;
SELECT COUNT(*) as total_atribuicoes FROM cursos_atribuicoes;