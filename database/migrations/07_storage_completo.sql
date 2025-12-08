-- ============================================================================
-- CRIAR TABELA DE DOCUMENTOS
-- O bucket 'colaboradores-docs' já existe no Storage
-- Execute este SQL no Supabase SQL Editor
-- ============================================================================

-- 1. Criar tabela de metadados dos documentos
CREATE TABLE IF NOT EXISTS documentos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    colaborador_id UUID NOT NULL REFERENCES colaboradores(id) ON DELETE CASCADE,
    tipo VARCHAR(50) NOT NULL,  -- RG, CPF, CTPS, Contrato, ASO, etc.
    nome VARCHAR(255) NOT NULL, -- nome original do arquivo
    descricao TEXT,
    arquivo_url TEXT NOT NULL,  -- URL pública do arquivo
    arquivo_tamanho INTEGER,    -- tamanho em bytes
    arquivo_tipo VARCHAR(100),  -- MIME type
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Índice para busca rápida por colaborador
CREATE INDEX IF NOT EXISTS idx_documentos_colaborador ON documentos(colaborador_id);

-- 3. Habilitar RLS
ALTER TABLE documentos ENABLE ROW LEVEL SECURITY;

-- 4. Política de acesso
DROP POLICY IF EXISTS "Acesso total documentos" ON documentos;
CREATE POLICY "Acesso total documentos" ON documentos
    FOR ALL USING (true) WITH CHECK (true);

-- 5. Verificar se a tabela foi criada
SELECT 'Tabela documentos criada!' as status;
SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'documentos';
