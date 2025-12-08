-- ============================================================================
-- 20_email_comunicacao.sql - Sistema de E-mail e Comunicação
-- ============================================================================
-- COPIE ESTE ARQUIVO COMPLETO E COLE NO SUPABASE SQL EDITOR
-- ============================================================================

-- Criar extensão uuid se não existir
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabela de configurações SMTP
CREATE TABLE IF NOT EXISTS configuracoes_smtp (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    empresa_id UUID REFERENCES empresa(id) ON DELETE CASCADE,
    
    servidor_smtp VARCHAR(255) NOT NULL,
    porta INTEGER NOT NULL DEFAULT 587,
    usa_ssl BOOLEAN DEFAULT true,
    usa_tls BOOLEAN DEFAULT true,
    
    usuario_smtp VARCHAR(255) NOT NULL,
    senha_smtp TEXT NOT NULL,
    
    email_remetente VARCHAR(255) NOT NULL,
    nome_remetente VARCHAR(255) NOT NULL,
    email_resposta VARCHAR(255),
    
    timeout INTEGER DEFAULT 30,
    max_tentativas INTEGER DEFAULT 3,
    intervalo_tentativas INTEGER DEFAULT 60,
    
    limite_diario INTEGER DEFAULT 1000,
    limite_por_hora INTEGER DEFAULT 100,
    
    ativo BOOLEAN DEFAULT true,
    testado BOOLEAN DEFAULT false,
    ultima_verificacao TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID,
    updated_by UUID,
    
    CONSTRAINT uq_smtp_empresa UNIQUE(empresa_id)
);

-- Tabela de templates de e-mail
CREATE TABLE IF NOT EXISTS templates_email (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    empresa_id UUID REFERENCES empresa(id) ON DELETE CASCADE,
    
    codigo VARCHAR(100) NOT NULL,
    nome VARCHAR(255) NOT NULL,
    descricao TEXT,
    categoria VARCHAR(50) NOT NULL,
    
    assunto VARCHAR(500) NOT NULL,
    corpo_html TEXT NOT NULL,
    corpo_texto TEXT,
    
    variaveis_disponiveis JSONB DEFAULT '[]'::jsonb,
    anexos_padrao JSONB DEFAULT '[]'::jsonb,
    
    prioridade VARCHAR(20) DEFAULT 'normal',
    requer_confirmacao_leitura BOOLEAN DEFAULT false,
    
    copiar_para JSONB DEFAULT '[]'::jsonb,
    copiar_oculto_para JSONB DEFAULT '[]'::jsonb,
    
    ativo BOOLEAN DEFAULT true,
    sistema BOOLEAN DEFAULT false,
    
    total_enviados INTEGER DEFAULT 0,
    total_abertos INTEGER DEFAULT 0,
    total_clicados INTEGER DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID,
    updated_by UUID,
    
    CONSTRAINT uq_template_codigo_empresa UNIQUE(empresa_id, codigo)
);

-- Tabela de histórico de e-mails
CREATE TABLE IF NOT EXISTS historico_emails (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    empresa_id UUID REFERENCES empresa(id) ON DELETE CASCADE,
    template_id UUID REFERENCES templates_email(id) ON DELETE SET NULL,
    
    destinatario_email VARCHAR(255) NOT NULL,
    destinatario_nome VARCHAR(255),
    destinatario_tipo VARCHAR(50),
    destinatario_id UUID,
    
    assunto VARCHAR(500) NOT NULL,
    corpo_html TEXT,
    corpo_texto TEXT,
    
    cc JSONB DEFAULT '[]'::jsonb,
    bcc JSONB DEFAULT '[]'::jsonb,
    anexos JSONB DEFAULT '[]'::jsonb,
    
    status VARCHAR(50) NOT NULL DEFAULT 'pendente',
    tentativas INTEGER DEFAULT 0,
    erro_mensagem TEXT,
    
    enviado_em TIMESTAMP WITH TIME ZONE,
    aberto_em TIMESTAMP WITH TIME ZONE,
    clicado_em TIMESTAMP WITH TIME ZONE,
    bounce_em TIMESTAMP WITH TIME ZONE,
    bounce_tipo VARCHAR(50),
    
    prioridade VARCHAR(20) DEFAULT 'normal',
    agendado_para TIMESTAMP WITH TIME ZONE,
    ip_origem VARCHAR(50),
    user_agent TEXT,
    
    contexto VARCHAR(100),
    contexto_id UUID,
    contexto_dados JSONB,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID,
    
    CONSTRAINT chk_status_email CHECK (status IN ('pendente', 'enviando', 'enviado', 'falha', 'bounce'))
);

-- Tabela de fila de e-mails
CREATE TABLE IF NOT EXISTS fila_emails (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    empresa_id UUID REFERENCES empresa(id) ON DELETE CASCADE,
    
    template_id UUID REFERENCES templates_email(id) ON DELETE SET NULL,
    destinatario_email VARCHAR(255) NOT NULL,
    destinatario_nome VARCHAR(255),
    destinatario_id UUID,
    
    assunto VARCHAR(500) NOT NULL,
    corpo_html TEXT NOT NULL,
    corpo_texto TEXT,
    
    variaveis JSONB DEFAULT '{}'::jsonb,
    anexos JSONB DEFAULT '[]'::jsonb,
    
    prioridade INTEGER DEFAULT 5,
    agendado_para TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    tentativas INTEGER DEFAULT 0,
    max_tentativas INTEGER DEFAULT 3,
    
    status VARCHAR(50) DEFAULT 'pendente',
    processando_desde TIMESTAMP WITH TIME ZONE,
    erro_mensagem TEXT,
    
    contexto VARCHAR(100),
    contexto_id UUID,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT chk_prioridade CHECK (prioridade BETWEEN 1 AND 10)
);

-- Tabela de configurações de comunicação
CREATE TABLE IF NOT EXISTS configuracoes_comunicacao (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    empresa_id UUID REFERENCES empresa(id) ON DELETE CASCADE,
    
    notificar_admissao BOOLEAN DEFAULT true,
    notificar_demissao BOOLEAN DEFAULT true,
    notificar_aniversario BOOLEAN DEFAULT true,
    notificar_ferias_aprovadas BOOLEAN DEFAULT true,
    notificar_ferias_vencendo BOOLEAN DEFAULT true,
    notificar_documentos_vencendo BOOLEAN DEFAULT true,
    notificar_ponto_inconsistente BOOLEAN DEFAULT true,
    notificar_folha_gerada BOOLEAN DEFAULT true,
    
    dias_alerta_ferias INTEGER DEFAULT 30,
    dias_alerta_documentos INTEGER DEFAULT 15,
    dias_alerta_aniversario INTEGER DEFAULT 3,
    
    horario_envio_inicio TIME DEFAULT '08:00:00',
    horario_envio_fim TIME DEFAULT '18:00:00',
    enviar_finais_semana BOOLEAN DEFAULT false,
    
    assinatura_html TEXT,
    assinatura_texto TEXT,
    rodape_html TEXT,
    rodape_texto TEXT,
    
    rastrear_abertura BOOLEAN DEFAULT true,
    rastrear_cliques BOOLEAN DEFAULT true,
    
    emails_bloqueados JSONB DEFAULT '[]'::jsonb,
    dominios_bloqueados JSONB DEFAULT '[]'::jsonb,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_by UUID,
    
    CONSTRAINT uq_comunicacao_empresa UNIQUE(empresa_id)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_smtp_empresa ON configuracoes_smtp(empresa_id);
CREATE INDEX IF NOT EXISTS idx_templates_empresa ON templates_email(empresa_id);
CREATE INDEX IF NOT EXISTS idx_historico_empresa ON historico_emails(empresa_id);
CREATE INDEX IF NOT EXISTS idx_fila_empresa ON fila_emails(empresa_id);
CREATE INDEX IF NOT EXISTS idx_comunicacao_empresa ON configuracoes_comunicacao(empresa_id);

-- RLS
ALTER TABLE configuracoes_smtp ENABLE ROW LEVEL SECURITY;
ALTER TABLE templates_email ENABLE ROW LEVEL SECURITY;
ALTER TABLE historico_emails ENABLE ROW LEVEL SECURITY;
ALTER TABLE fila_emails ENABLE ROW LEVEL SECURITY;
ALTER TABLE configuracoes_comunicacao ENABLE ROW LEVEL SECURITY;

-- Inserir templates padrão
DO $$
DECLARE
    v_empresa_id UUID;
BEGIN
    SELECT id INTO v_empresa_id FROM empresa LIMIT 1;
    
    IF v_empresa_id IS NOT NULL THEN
        INSERT INTO templates_email (codigo, nome, descricao, categoria, assunto, corpo_html, corpo_texto, variaveis_disponiveis, sistema, empresa_id)
        VALUES 
        ('bem_vindo', 'Boas-vindas ao Colaborador', 'E-mail de boas-vindas enviado na admissão', 'rh', 'Bem-vindo(a) à {{nome_empresa}}!', '<h2>Olá {{nome_colaborador}}!</h2><p>É com grande satisfação que damos as boas-vindas à equipe da <strong>{{nome_empresa}}</strong>.</p>', 'Olá {{nome_colaborador}}! Bem-vindo à {{nome_empresa}}.', '[{"nome":"nome_colaborador","descricao":"Nome do colaborador"}]'::jsonb, true, v_empresa_id),
        ('aniversario', 'Feliz Aniversário', 'E-mail de parabéns no aniversário', 'rh', 'Feliz Aniversário, {{nome_colaborador}}! 🎉', '<h2>Parabéns, {{nome_colaborador}}! 🎂</h2><p>A equipe da <strong>{{nome_empresa}}</strong> deseja um feliz aniversário!</p>', 'Parabéns! Feliz aniversário!', '[{"nome":"nome_colaborador","descricao":"Nome do colaborador"}]'::jsonb, true, v_empresa_id),
        ('ferias_aprovadas', 'Férias Aprovadas', 'Notificação de aprovação de férias', 'ferias', 'Suas férias foram aprovadas!', '<h2>Olá {{nome_colaborador}}!</h2><p>Suas férias foram <strong>aprovadas</strong>!</p>', 'Suas férias foram aprovadas!', '[{"nome":"nome_colaborador","descricao":"Nome do colaborador"}]'::jsonb, true, v_empresa_id),
        ('documento_vencendo', 'Documento Vencendo', 'Alerta de documento próximo ao vencimento', 'documentos', 'Atenção: {{tipo_documento}} vencendo em breve', '<h2>Olá {{nome_colaborador}}!</h2><p>Seu documento <strong>{{tipo_documento}}</strong> está próximo ao vencimento.</p>', 'Seu documento está vencendo.', '[{"nome":"nome_colaborador","descricao":"Nome do colaborador"}]'::jsonb, true, v_empresa_id),
        ('holerite_disponivel', 'Holerite Disponível', 'Notificação de holerite disponível', 'folha', 'Seu holerite de {{mes_referencia}} está disponível', '<h2>Olá {{nome_colaborador}}!</h2><p>Seu holerite já está disponível para consulta.</p>', 'Seu holerite está disponível.', '[{"nome":"nome_colaborador","descricao":"Nome do colaborador"}]'::jsonb, true, v_empresa_id)
        ON CONFLICT (empresa_id, codigo) DO NOTHING;
    END IF;
END $$;
