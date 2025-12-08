-- ============================================================================
-- TIPOS E CATEGORIAS DE DOCUMENTOS RH
-- Execute no Supabase SQL Editor
-- ============================================================================

-- 1. Criar tabela de CATEGORIAS de documentos
CREATE TABLE IF NOT EXISTS categorias_documentos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome VARCHAR(100) NOT NULL UNIQUE,
    descricao TEXT,
    cor VARCHAR(20) DEFAULT 'blue', -- Para UI
    icone VARCHAR(50) DEFAULT 'heroicons:document-text',
    ativo BOOLEAN DEFAULT true,
    ordem INTEGER DEFAULT 0, -- Para ordenação na UI
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Criar tabela de TIPOS de documentos
CREATE TABLE IF NOT EXISTS tipos_documentos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    categoria_id UUID REFERENCES categorias_documentos(id) ON DELETE SET NULL,
    nome VARCHAR(100) NOT NULL,
    descricao TEXT,
    
    -- Configurações do tipo
    requer_periodo BOOLEAN DEFAULT false, -- Se precisa data_inicio/data_fim
    requer_horas BOOLEAN DEFAULT false, -- Se precisa campo horas
    requer_aprovacao BOOLEAN DEFAULT false, -- Se precisa aprovação
    requer_arquivo BOOLEAN DEFAULT true, -- Se arquivo é obrigatório
    
    -- Validade
    tem_validade BOOLEAN DEFAULT false, -- Se o documento expira
    dias_validade INTEGER, -- Quantos dias é válido
    
    -- Notificações
    notificar_vencimento BOOLEAN DEFAULT false,
    dias_aviso_vencimento INTEGER DEFAULT 30, -- Avisar X dias antes
    
    -- Campos customizados (JSON)
    campos_extras JSONB DEFAULT '[]'::jsonb,
    
    -- Status
    ativo BOOLEAN DEFAULT true,
    ordem INTEGER DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(categoria_id, nome)
);

-- 3. Atualizar tabela documentos_rh para usar os novos tipos
ALTER TABLE documentos_rh 
    ADD COLUMN IF NOT EXISTS tipo_documento_id UUID REFERENCES tipos_documentos(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS categoria_id UUID REFERENCES categorias_documentos(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS data_validade DATE,
    ADD COLUMN IF NOT EXISTS campos_extras_valores JSONB DEFAULT '{}'::jsonb;

-- 4. Índices
CREATE INDEX IF NOT EXISTS idx_categorias_documentos_ativo ON categorias_documentos(ativo);
CREATE INDEX IF NOT EXISTS idx_categorias_documentos_ordem ON categorias_documentos(ordem);
CREATE INDEX IF NOT EXISTS idx_tipos_documentos_categoria ON tipos_documentos(categoria_id);
CREATE INDEX IF NOT EXISTS idx_tipos_documentos_ativo ON tipos_documentos(ativo);
CREATE INDEX IF NOT EXISTS idx_documentos_rh_tipo_documento ON documentos_rh(tipo_documento_id);
CREATE INDEX IF NOT EXISTS idx_documentos_rh_categoria ON documentos_rh(categoria_id);
CREATE INDEX IF NOT EXISTS idx_documentos_rh_validade ON documentos_rh(data_validade);

-- 5. RLS
ALTER TABLE categorias_documentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE tipos_documentos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Acesso total categorias_documentos" ON categorias_documentos;
CREATE POLICY "Acesso total categorias_documentos" ON categorias_documentos
    FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Acesso total tipos_documentos" ON tipos_documentos;
CREATE POLICY "Acesso total tipos_documentos" ON tipos_documentos
    FOR ALL USING (true) WITH CHECK (true);

-- 6. Inserir categorias padrão
INSERT INTO categorias_documentos (nome, descricao, cor, icone, ordem) VALUES
    ('Admissão', 'Documentos necessários para contratação', 'blue', 'heroicons:user-plus', 1),
    ('Pessoais', 'Documentos pessoais do colaborador', 'green', 'heroicons:identification', 2),
    ('Médicos', 'Atestados, exames, laudos médicos', 'red', 'heroicons:heart', 3),
    ('Trabalhistas', 'Contratos, aditivos, rescisões', 'purple', 'heroicons:briefcase', 4),
    ('Férias', 'Solicitações e comprovantes de férias', 'cyan', 'heroicons:sun', 5),
    ('Ponto', 'Justificativas, declarações de horas', 'amber', 'heroicons:clock', 6),
    ('Disciplinares', 'Advertências, suspensões', 'orange', 'heroicons:exclamation-triangle', 7),
    ('Benefícios', 'Vale transporte, plano de saúde, etc', 'emerald', 'heroicons:gift', 8),
    ('Treinamentos', 'Certificados, comprovantes', 'indigo', 'heroicons:academic-cap', 9),
    ('Outros', 'Documentos diversos', 'slate', 'heroicons:document', 10)
ON CONFLICT (nome) DO NOTHING;

-- 7. Inserir tipos padrão
INSERT INTO tipos_documentos (categoria_id, nome, descricao, requer_periodo, requer_horas, requer_aprovacao, requer_arquivo, tem_validade, dias_validade, notificar_vencimento, dias_aviso_vencimento, ordem) 
SELECT 
    c.id,
    t.nome,
    t.descricao,
    t.requer_periodo,
    t.requer_horas,
    t.requer_aprovacao,
    t.requer_arquivo,
    t.tem_validade,
    t.dias_validade,
    t.notificar_vencimento,
    t.dias_aviso_vencimento,
    t.ordem
FROM (VALUES
    -- Admissão
    ('Admissão', 'RG', 'Registro Geral', false, false, false, true, false, NULL, false, 30, 1),
    ('Admissão', 'CPF', 'Cadastro de Pessoa Física', false, false, false, true, false, NULL, false, 30, 2),
    ('Admissão', 'Título de Eleitor', 'Título de Eleitor', false, false, false, true, false, NULL, false, 30, 3),
    ('Admissão', 'Carteira de Trabalho', 'CTPS Digital ou Física', false, false, false, true, false, NULL, false, 30, 4),
    ('Admissão', 'Comprovante de Residência', 'Comprovante atualizado', false, false, false, true, true, 90, true, 15, 5),
    ('Admissão', 'Certidão de Nascimento/Casamento', 'Estado civil', false, false, false, true, false, NULL, false, 30, 6),
    ('Admissão', 'Foto 3x4', 'Foto recente', false, false, false, true, false, NULL, false, 30, 7),
    
    -- Pessoais
    ('Pessoais', 'CNH', 'Carteira Nacional de Habilitação', false, false, false, true, true, 365, true, 30, 1),
    ('Pessoais', 'Certificado de Reservista', 'Para homens', false, false, false, true, false, NULL, false, 30, 2),
    ('Pessoais', 'Certidão de Nascimento Filhos', 'Dependentes', false, false, false, true, false, NULL, false, 30, 3),
    ('Pessoais', 'Cartão Vacina Filhos', 'Até 7 anos', false, false, false, true, true, 365, true, 30, 4),
    
    -- Médicos
    ('Médicos', 'Atestado Médico', 'Afastamento por doença', true, false, true, true, false, NULL, false, 30, 1),
    ('Médicos', 'ASO - Admissional', 'Atestado de Saúde Ocupacional', false, false, false, true, true, 365, true, 30, 2),
    ('Médicos', 'ASO - Periódico', 'Exame periódico', false, false, false, true, true, 365, true, 30, 3),
    ('Médicos', 'ASO - Demissional', 'Exame demissional', false, false, false, true, false, NULL, false, 30, 4),
    ('Médicos', 'Laudo Médico', 'Laudos diversos', false, false, false, true, false, NULL, false, 30, 5),
    
    -- Trabalhistas
    ('Trabalhistas', 'Contrato de Trabalho', 'Contrato assinado', false, false, false, true, false, NULL, false, 30, 1),
    ('Trabalhistas', 'Aditivo Contratual', 'Alterações contratuais', false, false, false, true, false, NULL, false, 30, 2),
    ('Trabalhistas', 'Termo de Rescisão', 'TRCT', false, false, false, true, false, NULL, false, 30, 3),
    ('Trabalhistas', 'Acordo de Compensação', 'Banco de horas', false, false, true, true, true, 365, true, 30, 4),
    
    -- Férias
    ('Férias', 'Solicitação de Férias', 'Pedido de férias', true, false, true, false, false, NULL, false, 30, 1),
    ('Férias', 'Recibo de Férias', 'Comprovante assinado', true, false, false, true, false, NULL, false, 30, 2),
    ('Férias', 'Abono Pecuniário', 'Venda de férias', false, false, true, true, false, NULL, false, 30, 3),
    
    -- Ponto
    ('Ponto', 'Declaração de Comparecimento', 'Consultas, exames', true, true, false, true, false, NULL, false, 30, 1),
    ('Ponto', 'Justificativa de Falta', 'Justificar ausência', true, false, true, true, false, NULL, false, 30, 2),
    ('Ponto', 'Declaração de Horas Extras', 'Comprovante de HE', true, true, true, true, false, NULL, false, 30, 3),
    ('Ponto', 'Atestado de Acompanhamento', 'Acompanhar familiar', true, false, true, true, false, NULL, false, 30, 4),
    
    -- Disciplinares
    ('Disciplinares', 'Advertência Verbal', 'Registro de advertência', false, false, false, true, false, NULL, false, 30, 1),
    ('Disciplinares', 'Advertência Escrita', 'Advertência formal', false, false, false, true, false, NULL, false, 30, 2),
    ('Disciplinares', 'Suspensão', 'Suspensão disciplinar', true, false, false, true, false, NULL, false, 30, 3),
    
    -- Benefícios
    ('Benefícios', 'Vale Transporte', 'Solicitação VT', false, false, false, true, true, 365, true, 30, 1),
    ('Benefícios', 'Plano de Saúde', 'Adesão plano', false, false, false, true, true, 365, true, 30, 2),
    ('Benefícios', 'Vale Alimentação', 'Solicitação VA', false, false, false, true, true, 365, true, 30, 3),
    ('Benefícios', 'Seguro de Vida', 'Adesão seguro', false, false, false, true, true, 365, true, 30, 4),
    
    -- Treinamentos
    ('Treinamentos', 'Certificado de Curso', 'Comprovante de treinamento', false, false, false, true, false, NULL, false, 30, 1),
    ('Treinamentos', 'Certificado NR', 'Normas Regulamentadoras', false, false, false, true, true, 730, true, 60, 2),
    ('Treinamentos', 'Certificado Técnico', 'Certificações técnicas', false, false, false, true, true, 1095, true, 60, 3),
    
    -- Outros
    ('Outros', 'Procuração', 'Procuração', false, false, false, true, true, 365, true, 30, 1),
    ('Outros', 'Declaração Diversos', 'Declarações gerais', false, false, false, true, false, NULL, false, 30, 2),
    ('Outros', 'Termo de Responsabilidade', 'Termos diversos', false, false, false, true, false, NULL, false, 30, 3)
) AS t(categoria_nome, nome, descricao, requer_periodo, requer_horas, requer_aprovacao, requer_arquivo, tem_validade, dias_validade, notificar_vencimento, dias_aviso_vencimento, ordem)
JOIN categorias_documentos c ON c.nome = t.categoria_nome
ON CONFLICT DO NOTHING;

-- 8. Verificar
SELECT 'Sistema de tipos de documentos criado!' as status;
SELECT COUNT(*) as total_categorias FROM categorias_documentos;
SELECT COUNT(*) as total_tipos FROM tipos_documentos;

