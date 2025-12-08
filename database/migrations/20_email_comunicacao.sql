-- ============================================================================
-- 20_email_comunicacao.sql - Sistema de E-mail e Comunicação
-- ============================================================================
-- Descrição: Configurações SMTP, templates de e-mail e histórico de envios
-- Data: 2024-12-04
-- ============================================================================

-- Tabela de configurações SMTP
CREATE TABLE IF NOT EXISTS configuracoes_smtp (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    empresa_id UUID REFERENCES empresa(id) ON DELETE CASCADE,
    
    -- Configurações do servidor SMTP
    servidor_smtp VARCHAR(255) NOT NULL,
    porta INTEGER NOT NULL DEFAULT 587,
    usa_ssl BOOLEAN DEFAULT true,
    usa_tls BOOLEAN DEFAULT true,
    
    -- Credenciais
    usuario_smtp VARCHAR(255) NOT NULL,
    senha_smtp TEXT NOT NULL, -- Será criptografada na aplicação
    
    -- Remetente padrão
    email_remetente VARCHAR(255) NOT NULL,
    nome_remetente VARCHAR(255) NOT NULL,
    email_resposta VARCHAR(255),
    
    -- Configurações avançadas
    timeout INTEGER DEFAULT 30,
    max_tentativas INTEGER DEFAULT 3,
    intervalo_tentativas INTEGER DEFAULT 60, -- segundos
    
    -- Limites
    limite_diario INTEGER DEFAULT 1000,
    limite_por_hora INTEGER DEFAULT 100,
    
    -- Status
    ativo BOOLEAN DEFAULT true,
    testado BOOLEAN DEFAULT false,
    ultima_verificacao TIMESTAMP WITH TIME ZONE,
    
    -- Auditoria
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id),
    
    CONSTRAINT uq_smtp_empresa UNIQUE(empresa_id)
);

-- Tabela de templates de e-mail
CREATE TABLE IF NOT EXISTS templates_email (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    empresa_id UUID REFERENCES empresa(id) ON DELETE CASCADE,
    
    -- Identificação
    codigo VARCHAR(100) NOT NULL, -- Ex: 'bem_vindo', 'aniversario', 'ferias_aprovadas'
    nome VARCHAR(255) NOT NULL,
    descricao TEXT,
    categoria VARCHAR(50) NOT NULL, -- 'sistema', 'rh', 'folha', 'ferias', 'ponto', 'documentos'
    
    -- Conteúdo
    assunto VARCHAR(500) NOT NULL,
    corpo_html TEXT NOT NULL,
    corpo_texto TEXT, -- Versão texto puro
    
    -- Variáveis disponíveis (JSON)
    variaveis_disponiveis JSONB DEFAULT '[]'::jsonb,
    -- Ex: [{"nome": "nome_colaborador", "descricao": "Nome do colaborador", "exemplo": "João Silva"}]
    
    -- Anexos padrão
    anexos_padrao JSONB DEFAULT '[]'::jsonb,
    
    -- Configurações
    prioridade VARCHAR(20) DEFAULT 'normal', -- 'baixa', 'normal', 'alta', 'urgente'
    requer_confirmacao_leitura BOOLEAN DEFAULT false,
    
    -- Destinatários automáticos
    copiar_para JSONB DEFAULT '[]'::jsonb, -- Lista de e-mails para CC
    copiar_oculto_para JSONB DEFAULT '[]'::jsonb, -- Lista de e-mails para BCC
    
    -- Status
    ativo BOOLEAN DEFAULT true,
    sistema BOOLEAN DEFAULT false, -- Templates do sistema não podem ser excluídos
    
    -- Estatísticas
    total_enviados INTEGER DEFAULT 0,
    total_abertos INTEGER DEFAULT 0,
    total_clicados INTEGER DEFAULT 0,
    
    -- Auditoria
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id),
    
    CONSTRAINT uq_template_codigo_empresa UNIQUE(empresa_id, codigo)
);

-- Tabela de histórico de e-mails enviados
CREATE TABLE IF NOT EXISTS historico_emails (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    empresa_id UUID REFERENCES empresa(id) ON DELETE CASCADE,
    template_id UUID REFERENCES templates_email(id) ON DELETE SET NULL,
    
    -- Destinatário
    destinatario_email VARCHAR(255) NOT NULL,
    destinatario_nome VARCHAR(255),
    destinatario_tipo VARCHAR(50), -- 'colaborador', 'usuario', 'externo'
    destinatario_id UUID, -- ID do colaborador ou usuário
    
    -- Conteúdo
    assunto VARCHAR(500) NOT NULL,
    corpo_html TEXT,
    corpo_texto TEXT,
    
    -- Cópias
    cc JSONB DEFAULT '[]'::jsonb,
    bcc JSONB DEFAULT '[]'::jsonb,
    
    -- Anexos
    anexos JSONB DEFAULT '[]'::jsonb,
    
    -- Status de envio
    status VARCHAR(50) NOT NULL DEFAULT 'pendente', -- 'pendente', 'enviando', 'enviado', 'falha', 'bounce'
    tentativas INTEGER DEFAULT 0,
    erro_mensagem TEXT,
    
    -- Rastreamento
    enviado_em TIMESTAMP WITH TIME ZONE,
    aberto_em TIMESTAMP WITH TIME ZONE,
    clicado_em TIMESTAMP WITH TIME ZONE,
    bounce_em TIMESTAMP WITH TIME ZONE,
    bounce_tipo VARCHAR(50), -- 'hard', 'soft', 'complaint'
    
    -- Metadados
    prioridade VARCHAR(20) DEFAULT 'normal',
    agendado_para TIMESTAMP WITH TIME ZONE,
    ip_origem VARCHAR(50),
    user_agent TEXT,
    
    -- Contexto
    contexto VARCHAR(100), -- 'admissao', 'demissao', 'ferias', 'aniversario', etc.
    contexto_id UUID, -- ID do registro relacionado
    contexto_dados JSONB, -- Dados adicionais do contexto
    
    -- Auditoria
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    
    -- Índices para performance
    CONSTRAINT chk_status_email CHECK (status IN ('pendente', 'enviando', 'enviado', 'falha', 'bounce'))
);

-- Tabela de filas de e-mail (para envio assíncrono)
CREATE TABLE IF NOT EXISTS fila_emails (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    empresa_id UUID REFERENCES empresa(id) ON DELETE CASCADE,
    
    -- Dados do e-mail
    template_id UUID REFERENCES templates_email(id) ON DELETE SET NULL,
    destinatario_email VARCHAR(255) NOT NULL,
    destinatario_nome VARCHAR(255),
    destinatario_id UUID,
    
    assunto VARCHAR(500) NOT NULL,
    corpo_html TEXT NOT NULL,
    corpo_texto TEXT,
    
    variaveis JSONB DEFAULT '{}'::jsonb,
    anexos JSONB DEFAULT '[]'::jsonb,
    
    -- Controle de fila
    prioridade INTEGER DEFAULT 5, -- 1 (mais alta) a 10 (mais baixa)
    agendado_para TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    tentativas INTEGER DEFAULT 0,
    max_tentativas INTEGER DEFAULT 3,
    
    status VARCHAR(50) DEFAULT 'pendente',
    processando_desde TIMESTAMP WITH TIME ZONE,
    erro_mensagem TEXT,
    
    -- Contexto
    contexto VARCHAR(100),
    contexto_id UUID,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT chk_prioridade CHECK (prioridade BETWEEN 1 AND 10)
);

-- Tabela de configurações de comunicação
CREATE TABLE IF NOT EXISTS configuracoes_comunicacao (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    empresa_id UUID REFERENCES empresa(id) ON DELETE CASCADE,
    
    -- Notificações automáticas
    notificar_admissao BOOLEAN DEFAULT true,
    notificar_demissao BOOLEAN DEFAULT true,
    notificar_aniversario BOOLEAN DEFAULT true,
    notificar_ferias_aprovadas BOOLEAN DEFAULT true,
    notificar_ferias_vencendo BOOLEAN DEFAULT true,
    notificar_documentos_vencendo BOOLEAN DEFAULT true,
    notificar_ponto_inconsistente BOOLEAN DEFAULT true,
    notificar_folha_gerada BOOLEAN DEFAULT true,
    
    -- Dias de antecedência para alertas
    dias_alerta_ferias INTEGER DEFAULT 30,
    dias_alerta_documentos INTEGER DEFAULT 15,
    dias_alerta_aniversario INTEGER DEFAULT 3,
    
    -- Horários de envio
    horario_envio_inicio TIME DEFAULT '08:00:00',
    horario_envio_fim TIME DEFAULT '18:00:00',
    enviar_finais_semana BOOLEAN DEFAULT false,
    
    -- Assinatura padrão
    assinatura_html TEXT,
    assinatura_texto TEXT,
    
    -- Rodapé padrão
    rodape_html TEXT,
    rodape_texto TEXT,
    
    -- Configurações de rastreamento
    rastrear_abertura BOOLEAN DEFAULT true,
    rastrear_cliques BOOLEAN DEFAULT true,
    
    -- Listas de bloqueio
    emails_bloqueados JSONB DEFAULT '[]'::jsonb,
    dominios_bloqueados JSONB DEFAULT '[]'::jsonb,
    
    -- Auditoria
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_by UUID REFERENCES auth.users(id),
    
    CONSTRAINT uq_comunicacao_empresa UNIQUE(empresa_id)
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_smtp_empresa ON configuracoes_smtp(empresa_id);
CREATE INDEX IF NOT EXISTS idx_smtp_ativo ON configuracoes_smtp(ativo);

CREATE INDEX IF NOT EXISTS idx_templates_empresa ON templates_email(empresa_id);
CREATE INDEX IF NOT EXISTS idx_templates_codigo ON templates_email(codigo);
CREATE INDEX IF NOT EXISTS idx_templates_categoria ON templates_email(categoria);
CREATE INDEX IF NOT EXISTS idx_templates_ativo ON templates_email(ativo);

CREATE INDEX IF NOT EXISTS idx_historico_empresa ON historico_emails(empresa_id);
CREATE INDEX IF NOT EXISTS idx_historico_destinatario ON historico_emails(destinatario_email);
CREATE INDEX IF NOT EXISTS idx_historico_status ON historico_emails(status);
CREATE INDEX IF NOT EXISTS idx_historico_enviado ON historico_emails(enviado_em);
CREATE INDEX IF NOT EXISTS idx_historico_contexto ON historico_emails(contexto, contexto_id);
CREATE INDEX IF NOT EXISTS idx_historico_template ON historico_emails(template_id);

CREATE INDEX IF NOT EXISTS idx_fila_status ON fila_emails(status);
CREATE INDEX IF NOT EXISTS idx_fila_agendado ON fila_emails(agendado_para);
CREATE INDEX IF NOT EXISTS idx_fila_prioridade ON fila_emails(prioridade, agendado_para);
CREATE INDEX IF NOT EXISTS idx_fila_empresa ON fila_emails(empresa_id);

CREATE INDEX IF NOT EXISTS idx_comunicacao_empresa ON configuracoes_comunicacao(empresa_id);

-- Triggers para updated_at
CREATE TRIGGER update_smtp_updated_at
    BEFORE UPDATE ON configuracoes_smtp
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_templates_updated_at
    BEFORE UPDATE ON templates_email
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_comunicacao_updated_at
    BEFORE UPDATE ON configuracoes_comunicacao
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- RLS Policies
ALTER TABLE configuracoes_smtp ENABLE ROW LEVEL SECURITY;
ALTER TABLE templates_email ENABLE ROW LEVEL SECURITY;
ALTER TABLE historico_emails ENABLE ROW LEVEL SECURITY;
ALTER TABLE fila_emails ENABLE ROW LEVEL SECURITY;
ALTER TABLE configuracoes_comunicacao ENABLE ROW LEVEL SECURITY;

-- Policies para configuracoes_smtp
CREATE POLICY "Usuários podem ver SMTP da sua empresa"
    ON configuracoes_smtp FOR SELECT
    USING (empresa_id IN (SELECT empresa_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Admins podem gerenciar SMTP"
    ON configuracoes_smtp FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'super_admin')
            AND empresa_id = configuracoes_smtp.empresa_id
        )
    );

-- Policies para templates_email
CREATE POLICY "Usuários podem ver templates da sua empresa"
    ON templates_email FOR SELECT
    USING (empresa_id IN (SELECT empresa_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Admins e RH podem gerenciar templates"
    ON templates_email FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'super_admin', 'rh')
            AND empresa_id = templates_email.empresa_id
        )
    );

-- Policies para historico_emails
CREATE POLICY "Usuários podem ver histórico da sua empresa"
    ON historico_emails FOR SELECT
    USING (empresa_id IN (SELECT empresa_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Sistema pode inserir no histórico"
    ON historico_emails FOR INSERT
    WITH CHECK (empresa_id IN (SELECT empresa_id FROM users WHERE id = auth.uid()));

-- Policies para fila_emails
CREATE POLICY "Sistema pode gerenciar fila"
    ON fila_emails FOR ALL
    USING (empresa_id IN (SELECT empresa_id FROM users WHERE id = auth.uid()));

-- Policies para configuracoes_comunicacao
CREATE POLICY "Usuários podem ver config de comunicação"
    ON configuracoes_comunicacao FOR SELECT
    USING (empresa_id IN (SELECT empresa_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Admins podem gerenciar config de comunicação"
    ON configuracoes_comunicacao FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'super_admin')
            AND empresa_id = configuracoes_comunicacao.empresa_id
        )
    );

-- Inserir templates padrão do sistema
-- Primeiro, vamos buscar o ID da empresa
DO $$
DECLARE
    v_empresa_id UUID;
BEGIN
    -- Buscar o ID da primeira empresa
    SELECT id INTO v_empresa_id FROM empresa LIMIT 1;
    
    -- Se não houver empresa, não inserir templates
    IF v_empresa_id IS NOT NULL THEN
        -- Template: Boas-vindas
        INSERT INTO templates_email (codigo, nome, descricao, categoria, assunto, corpo_html, corpo_texto, variaveis_disponiveis, sistema, empresa_id)
        VALUES (
            'bem_vindo',
            'Boas-vindas ao Colaborador',
            'E-mail de boas-vindas enviado na admissão',
            'rh',
            'Bem-vindo(a) à {{nome_empresa}}!',
            '<h2>Olá {{nome_colaborador}}!</h2><p>É com grande satisfação que damos as boas-vindas à equipe da <strong>{{nome_empresa}}</strong>.</p><p>Seu primeiro dia será em <strong>{{data_admissao}}</strong>.</p><p>Estamos ansiosos para trabalhar com você!</p>',
            'Olá {{nome_colaborador}}! É com grande satisfação que damos as boas-vindas à equipe da {{nome_empresa}}. Seu primeiro dia será em {{data_admissao}}. Estamos ansiosos para trabalhar com você!',
            '[{"nome":"nome_colaborador","descricao":"Nome do colaborador"},{"nome":"nome_empresa","descricao":"Nome da empresa"},{"nome":"data_admissao","descricao":"Data de admissão"}]'::jsonb,
            true,
            v_empresa_id
        )
        ON CONFLICT (empresa_id, codigo) DO NOTHING;

        -- Template: Aniversário
        INSERT INTO templates_email (codigo, nome, descricao, categoria, assunto, corpo_html, corpo_texto, variaveis_disponiveis, sistema, empresa_id)
        VALUES (
            'aniversario',
            'Feliz Aniversário',
            'E-mail de parabéns no aniversário do colaborador',
            'rh',
            'Feliz Aniversário, {{nome_colaborador}}! 🎉',
            '<h2>Parabéns, {{nome_colaborador}}! 🎂</h2><p>A equipe da <strong>{{nome_empresa}}</strong> deseja um feliz aniversário!</p><p>Que este novo ano seja repleto de realizações e felicidade.</p>',
            'Parabéns, {{nome_colaborador}}! A equipe da {{nome_empresa}} deseja um feliz aniversário! Que este novo ano seja repleto de realizações e felicidade.',
            '[{"nome":"nome_colaborador","descricao":"Nome do colaborador"},{"nome":"nome_empresa","descricao":"Nome da empresa"}]'::jsonb,
            true,
            v_empresa_id
        )
        ON CONFLICT (empresa_id, codigo) DO NOTHING;

        -- Template: Férias Aprovadas
        INSERT INTO templates_email (codigo, nome, descricao, categoria, assunto, corpo_html, corpo_texto, variaveis_disponiveis, sistema, empresa_id)
        VALUES (
            'ferias_aprovadas',
            'Férias Aprovadas',
            'Notificação de aprovação de férias',
            'ferias',
            'Suas férias foram aprovadas!',
            '<h2>Olá {{nome_colaborador}}!</h2><p>Suas férias foram <strong>aprovadas</strong>!</p><p><strong>Período:</strong> {{data_inicio}} a {{data_fim}}</p><p><strong>Total de dias:</strong> {{total_dias}}</p><p>Aproveite seu descanso!</p>',
            'Olá {{nome_colaborador}}! Suas férias foram aprovadas! Período: {{data_inicio}} a {{data_fim}}. Total de dias: {{total_dias}}. Aproveite seu descanso!',
            '[{"nome":"nome_colaborador","descricao":"Nome do colaborador"},{"nome":"data_inicio","descricao":"Data de início"},{"nome":"data_fim","descricao":"Data de fim"},{"nome":"total_dias","descricao":"Total de dias"}]'::jsonb,
            true,
            v_empresa_id
        )
        ON CONFLICT (empresa_id, codigo) DO NOTHING;

        -- Template: Documento Vencendo
        INSERT INTO templates_email (codigo, nome, descricao, categoria, assunto, corpo_html, corpo_texto, variaveis_disponiveis, sistema, empresa_id)
        VALUES (
            'documento_vencendo',
            'Documento Vencendo',
            'Alerta de documento próximo ao vencimento',
            'documentos',
            'Atenção: {{tipo_documento}} vencendo em breve',
            '<h2>Olá {{nome_colaborador}}!</h2><p>Seu documento <strong>{{tipo_documento}}</strong> está próximo ao vencimento.</p><p><strong>Data de vencimento:</strong> {{data_vencimento}}</p><p>Por favor, providencie a renovação o quanto antes.</p>',
            'Olá {{nome_colaborador}}! Seu documento {{tipo_documento}} está próximo ao vencimento. Data de vencimento: {{data_vencimento}}. Por favor, providencie a renovação o quanto antes.',
            '[{"nome":"nome_colaborador","descricao":"Nome do colaborador"},{"nome":"tipo_documento","descricao":"Tipo do documento"},{"nome":"data_vencimento","descricao":"Data de vencimento"}]'::jsonb,
            true,
            v_empresa_id
        )
        ON CONFLICT (empresa_id, codigo) DO NOTHING;

        -- Template: Holerite Disponível
        INSERT INTO templates_email (codigo, nome, descricao, categoria, assunto, corpo_html, corpo_texto, variaveis_disponiveis, sistema, empresa_id)
        VALUES (
            'holerite_disponivel',
            'Holerite Disponível',
            'Notificação de holerite disponível para visualização',
            'folha',
            'Seu holerite de {{mes_referencia}} está disponível',
            '<h2>Olá {{nome_colaborador}}!</h2><p>Seu holerite referente a <strong>{{mes_referencia}}</strong> já está disponível para consulta.</p><p>Acesse o sistema para visualizar.</p>',
            'Olá {{nome_colaborador}}! Seu holerite referente a {{mes_referencia}} já está disponível para consulta. Acesse o sistema para visualizar.',
            '[{"nome":"nome_colaborador","descricao":"Nome do colaborador"},{"nome":"mes_referencia","descricao":"Mês de referência"}]'::jsonb,
            true,
            v_empresa_id
        )
        ON CONFLICT (empresa_id, codigo) DO NOTHING;
    END IF;
END $$;

-- Comentários nas tabelas
COMMENT ON TABLE configuracoes_smtp IS 'Configurações do servidor SMTP para envio de e-mails';
COMMENT ON TABLE templates_email IS 'Templates de e-mail reutilizáveis com variáveis dinâmicas';
COMMENT ON TABLE historico_emails IS 'Histórico completo de todos os e-mails enviados';
COMMENT ON TABLE fila_emails IS 'Fila de e-mails para processamento assíncrono';
COMMENT ON TABLE configuracoes_comunicacao IS 'Configurações gerais de comunicação e notificações';

-- ============================================================================
-- FIM DA MIGRATION
-- ============================================================================