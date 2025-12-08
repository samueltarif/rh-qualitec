-- ============================================================================
-- Criar tabela de documentos e configurar Storage
-- Execute no Supabase SQL Editor
-- ============================================================================

-- 1. Criar tabela de documentos (se não existir)
CREATE TABLE IF NOT EXISTS documentos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    colaborador_id UUID NOT NULL REFERENCES colaboradores(id) ON DELETE CASCADE,
    tipo VARCHAR(50) NOT NULL, -- RG, CPF, CTPS, Contrato, ASO, Certificado, etc.
    nome VARCHAR(255) NOT NULL, -- nome original do arquivo
    descricao TEXT,
    arquivo_url TEXT NOT NULL,
    arquivo_tamanho INTEGER,
    arquivo_tipo VARCHAR(100), -- MIME type
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Criar índice para busca por colaborador
CREATE INDEX IF NOT EXISTS idx_documentos_colaborador ON documentos(colaborador_id);

-- 3. Habilitar RLS
ALTER TABLE documentos ENABLE ROW LEVEL SECURITY;

-- 4. Política de acesso (permitir tudo para usuários autenticados)
DROP POLICY IF EXISTS "Permitir acesso total documentos" ON documentos;
CREATE POLICY "Permitir acesso total documentos" ON documentos
    FOR ALL USING (true) WITH CHECK (true);

-- ============================================================================
-- IMPORTANTE: Configurar Storage manualmente no Dashboard
-- ============================================================================
-- 1. Vá em Storage → New Bucket
-- 2. Nome: documentos
-- 3. Public bucket: SIM (para URLs públicas)
-- 4. Ou configure políticas de acesso se quiser privado

-- Se quiser criar via SQL (requer permissões especiais):
-- INSERT INTO storage.buckets (id, name, public) 
-- VALUES ('documentos', 'documentos', true)
-- ON CONFLICT (id) DO NOTHING;
