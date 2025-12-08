-- ============================================================================
-- TABELA DOCUMENTOS RH - Atestados, Declarações, etc.
-- Execute no Supabase SQL Editor
-- ============================================================================

-- 1. Criar tabela
CREATE TABLE IF NOT EXISTS documentos_rh (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    colaborador_id UUID NOT NULL REFERENCES colaboradores(id) ON DELETE CASCADE,
    
    -- Tipo do documento
    tipo VARCHAR(50) NOT NULL, -- Atestado, Declaracao_Horas, Declaracao_Comparecimento, Licenca, Ferias, Advertencia, Outros
    
    -- Período
    data_inicio DATE,
    data_fim DATE,
    horas DECIMAL(5,2), -- Para declaração de horas
    
    -- Arquivo
    arquivo_url TEXT,
    
    -- Status e observações
    status VARCHAR(20) DEFAULT 'Pendente', -- Pendente, Aprovado, Rejeitado
    observacoes TEXT,
    
    -- Metadados
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Índices
CREATE INDEX IF NOT EXISTS idx_documentos_rh_colaborador ON documentos_rh(colaborador_id);
CREATE INDEX IF NOT EXISTS idx_documentos_rh_tipo ON documentos_rh(tipo);
CREATE INDEX IF NOT EXISTS idx_documentos_rh_status ON documentos_rh(status);
CREATE INDEX IF NOT EXISTS idx_documentos_rh_data ON documentos_rh(data_inicio);

-- 3. RLS
ALTER TABLE documentos_rh ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Acesso total documentos_rh" ON documentos_rh;
CREATE POLICY "Acesso total documentos_rh" ON documentos_rh
    FOR ALL USING (true) WITH CHECK (true);

-- 4. Verificar
SELECT 'Tabela documentos_rh criada!' as status;
SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'documentos_rh';
