-- ============================================================================
-- SISTEMA DE INTEGRAÇÕES - APIs EXTERNAS, CONTABILIDADE, BANCOS
-- Execute no Supabase SQL Editor
-- ============================================================================

-- 1. Tabela de CONFIGURAÇÕES DE INTEGRAÇÕES
CREATE TABLE IF NOT EXISTS configuracoes_integracoes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    empresa_id UUID REFERENCES empresas(id) ON DELETE CASCADE,
    
    -- Contabilidade
    contabilidade_ativa BOOLEAN DEFAULT false,
    contabilidade_tipo VARCHAR(50), -- dominio, contabil, outros
    contabilidade_url VARCHAR(255),
    contabilidade_api_key TEXT,
    contabilidade_usuario VARCHAR(100),
    contabilidade_senha TEXT,
    contabilidade_sincronizar_automatico BOOLEAN DEFAULT false,
    contabilidade_frequencia VARCHAR(20) DEFAULT 'mensal', -- diario, semanal, mensal
    
    -- eSocial
    esocial_ativo BOOLEAN DEFAULT false,
    esocial_certificado_digital TEXT,
    esocial_senha_certificado TEXT,
    esocial_ambiente VARCHAR(20) DEFAULT 'producao', -- producao, homologacao
    esocial_enviar_automatico BOOLEAN DEFAULT false,
    
    -- Bancos - Pagamento
    banco_pagamento_ativo BOOLEAN DEFAULT false,
    banco_pagamento_codigo VARCHAR(10),
    banco_pagamento_nome VARCHAR(100),
    banco_pagamento_agencia VARCHAR(10),
    banco_pagamento_conta VARCHAR(20),
    banco_pagamento_tipo_conta VARCHAR(20), -- corrente, poupanca
    banco_pagamento_api_key TEXT,
    banco_pagamento_gerar_cnab BOOLEAN DEFAULT true,
    banco_pagamento_layout VARCHAR(50) DEFAULT 'cnab240', -- cnab240, cnab400
    
    -- Ponto Eletrônico
    ponto_ativo BOOLEAN DEFAULT false,
    ponto_tipo VARCHAR(50), -- rep, ahgora, outros
    ponto_url VARCHAR(255),
    ponto_api_key TEXT,
    ponto_sincronizar_automatico BOOLEAN DEFAULT true,
    ponto_frequencia_minutos INTEGER DEFAULT 60,
    
    -- Email/SMTP
    smtp_ativo BOOLEAN DEFAULT false,
    smtp_host VARCHAR(255),
    smtp_porta INTEGER DEFAULT 587,
    smtp_usuario VARCHAR(255),
    smtp_senha TEXT,
    smtp_seguranca VARCHAR(20) DEFAULT 'tls', -- tls, ssl, none
    smtp_remetente_nome VARCHAR(100),
    smtp_remetente_email VARCHAR(255),
    
    -- WhatsApp/SMS
    whatsapp_ativo BOOLEAN DEFAULT false,
    whatsapp_api_key TEXT,
    whatsapp_numero VARCHAR(20),
    sms_ativo BOOLEAN DEFAULT false,
    sms_api_key TEXT,
    
    -- Webhooks
    webhook_url VARCHAR(255),
    webhook_eventos TEXT[], -- eventos que disparam webhook
    webhook_ativo BOOLEAN DEFAULT false,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Tabela de LOGS DE SINCRONIZAÇÃO
CREATE TABLE IF NOT EXISTS logs_sincronizacao (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    empresa_id UUID REFERENCES empresas(id) ON DELETE CASCADE,
    
    -- Integração
    tipo_integracao VARCHAR(50) NOT NULL, -- contabilidade, esocial, banco, ponto
    acao VARCHAR(50) NOT NULL, -- enviar, receber, sincronizar
    
    -- Dados
    registros_enviados INTEGER DEFAULT 0,
    registros_recebidos INTEGER DEFAULT 0,
    registros_erro INTEGER DEFAULT 0,
    
    -- Status
    status VARCHAR(20) DEFAULT 'processando', -- processando, sucesso, erro, parcial
    mensagem TEXT,
    detalhes JSONB DEFAULT '{}'::jsonb,
    
    -- Tempo
    iniciado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    concluido_em TIMESTAMP WITH TIME ZONE,
    duracao_segundos INTEGER,
    
    -- Usuário (se manual)
    iniciado_por UUID REFERENCES auth.users(id),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Tabela de MAPEAMENTO DE CONTAS CONTÁBEIS
CREATE TABLE IF NOT EXISTS mapeamento_contas_contabeis (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    empresa_id UUID REFERENCES empresas(id) ON DELETE CASCADE,
    
    -- Tipo de lançamento
    tipo_lancamento VARCHAR(50) NOT NULL, -- salario, inss, fgts, irrf, vale_transporte, etc
    descricao VARCHAR(200),
    
    -- Contas contábeis
    conta_debito VARCHAR(50),
    conta_credito VARCHAR(50),
    centro_custo VARCHAR(50),
    historico_padrao TEXT,
    
    -- Status
    ativo BOOLEAN DEFAULT true,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Tabela de ARQUIVOS CNAB GERADOS
CREATE TABLE IF NOT EXISTS arquivos_cnab (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    empresa_id UUID REFERENCES empresas(id) ON DELETE CASCADE,
    
    -- Arquivo
    nome_arquivo VARCHAR(255) NOT NULL,
    tipo_arquivo VARCHAR(20) NOT NULL, -- cnab240, cnab400
    finalidade VARCHAR(50) NOT NULL, -- pagamento_salario, pagamento_fornecedor
    
    -- Banco
    banco_codigo VARCHAR(10),
    banco_nome VARCHAR(100),
    
    -- Dados
    total_registros INTEGER DEFAULT 0,
    valor_total DECIMAL(15,2) DEFAULT 0,
    data_pagamento DATE,
    
    -- Arquivo
    arquivo_url TEXT,
    arquivo_conteudo TEXT, -- Conteúdo do CNAB
    
    -- Status
    status VARCHAR(20) DEFAULT 'gerado', -- gerado, enviado, processado, erro
    processado_em TIMESTAMP WITH TIME ZONE,
    mensagem_retorno TEXT,
    
    -- Referência
    folha_pagamento_id UUID, -- Referência à folha
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id)
);

-- 5. Tabela de EVENTOS eSocial
CREATE TABLE IF NOT EXISTS eventos_esocial (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    empresa_id UUID REFERENCES empresas(id) ON DELETE CASCADE,
    
    -- Evento
    tipo_evento VARCHAR(10) NOT NULL, -- S-1000, S-2200, S-2299, etc
    nome_evento VARCHAR(100),
    
    -- Colaborador (se aplicável)
    colaborador_id UUID REFERENCES colaboradores(id) ON DELETE CASCADE,
    
    -- Dados
    xml_envio TEXT,
    xml_retorno TEXT,
    
    -- Status
    status VARCHAR(20) DEFAULT 'pendente', -- pendente, enviado, processado, erro, rejeitado
    numero_recibo VARCHAR(50),
    protocolo VARCHAR(50),
    
    -- Mensagens
    mensagem_erro TEXT,
    codigo_erro VARCHAR(20),
    
    -- Datas
    data_evento DATE,
    enviado_em TIMESTAMP WITH TIME ZONE,
    processado_em TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id)
);

-- 6. Tabela de TEMPLATES DE EMAIL
CREATE TABLE IF NOT EXISTS templates_email (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    empresa_id UUID REFERENCES empresas(id) ON DELETE CASCADE,
    
    -- Template
    codigo VARCHAR(50) NOT NULL UNIQUE,
    nome VARCHAR(100) NOT NULL,
    descricao TEXT,
    
    -- Conteúdo
    assunto VARCHAR(255) NOT NULL,
    corpo_html TEXT NOT NULL,
    corpo_texto TEXT,
    
    -- Variáveis disponíveis
    variaveis_disponiveis TEXT[], -- {{nome}}, {{cargo}}, {{salario}}, etc
    
    -- Anexos padrão
    incluir_holerite BOOLEAN DEFAULT false,
    incluir_informe_rendimentos BOOLEAN DEFAULT false,
    
    -- Status
    ativo BOOLEAN DEFAULT true,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Tabela de HISTÓRICO DE EMAILS ENVIADOS
CREATE TABLE IF NOT EXISTS historico_emails (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    empresa_id UUID REFERENCES empresas(id) ON DELETE CASCADE,
    
    -- Destinatário
    destinatario_email VARCHAR(255) NOT NULL,
    destinatario_nome VARCHAR(255),
    colaborador_id UUID REFERENCES colaboradores(id) ON DELETE SET NULL,
    
    -- Email
    template_id UUID REFERENCES templates_email(id) ON DELETE SET NULL,
    assunto VARCHAR(255) NOT NULL,
    corpo TEXT,
    
    -- Anexos
    anexos JSONB DEFAULT '[]'::jsonb,
    
    -- Status
    status VARCHAR(20) DEFAULT 'pendente', -- pendente, enviado, erro, aberto
    mensagem_erro TEXT,
    
    -- Rastreamento
    enviado_em TIMESTAMP WITH TIME ZONE,
    aberto_em TIMESTAMP WITH TIME ZONE,
    clicado_em TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Tabela de WEBHOOKS CONFIGURADOS
CREATE TABLE IF NOT EXISTS webhooks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    empresa_id UUID REFERENCES empresas(id) ON DELETE CASCADE,
    
    -- Webhook
    nome VARCHAR(100) NOT NULL,
    url VARCHAR(255) NOT NULL,
    metodo VARCHAR(10) DEFAULT 'POST', -- POST, PUT
    
    -- Eventos
    eventos TEXT[] NOT NULL, -- colaborador_criado, folha_processada, etc
    
    -- Autenticação
    auth_tipo VARCHAR(20), -- bearer, basic, api_key
    auth_valor TEXT,
    
    -- Headers customizados
    headers JSONB DEFAULT '{}'::jsonb,
    
    -- Configurações
    timeout_segundos INTEGER DEFAULT 30,
    retry_tentativas INTEGER DEFAULT 3,
    
    -- Status
    ativo BOOLEAN DEFAULT true,
    ultima_execucao TIMESTAMP WITH TIME ZONE,
    total_execucoes INTEGER DEFAULT 0,
    total_erros INTEGER DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. Tabela de LOGS DE WEBHOOKS
CREATE TABLE IF NOT EXISTS logs_webhooks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    webhook_id UUID REFERENCES webhooks(id) ON DELETE CASCADE,
    
    -- Execução
    evento VARCHAR(50) NOT NULL,
    payload JSONB,
    
    -- Resposta
    status_code INTEGER,
    resposta TEXT,
    
    -- Status
    sucesso BOOLEAN DEFAULT false,
    mensagem_erro TEXT,
    tentativa INTEGER DEFAULT 1,
    
    -- Tempo
    duracao_ms INTEGER,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. Índices
CREATE INDEX IF NOT EXISTS idx_logs_sincronizacao_empresa ON logs_sincronizacao(empresa_id);
CREATE INDEX IF NOT EXISTS idx_logs_sincronizacao_tipo ON logs_sincronizacao(tipo_integracao);
CREATE INDEX IF NOT EXISTS idx_logs_sincronizacao_status ON logs_sincronizacao(status);
CREATE INDEX IF NOT EXISTS idx_logs_sincronizacao_created ON logs_sincronizacao(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_mapeamento_contas_empresa ON mapeamento_contas_contabeis(empresa_id);
CREATE INDEX IF NOT EXISTS idx_mapeamento_contas_tipo ON mapeamento_contas_contabeis(tipo_lancamento);

CREATE INDEX IF NOT EXISTS idx_arquivos_cnab_empresa ON arquivos_cnab(empresa_id);
CREATE INDEX IF NOT EXISTS idx_arquivos_cnab_status ON arquivos_cnab(status);
CREATE INDEX IF NOT EXISTS idx_arquivos_cnab_data ON arquivos_cnab(data_pagamento);

CREATE INDEX IF NOT EXISTS idx_eventos_esocial_empresa ON eventos_esocial(empresa_id);
CREATE INDEX IF NOT EXISTS idx_eventos_esocial_colaborador ON eventos_esocial(colaborador_id);
CREATE INDEX IF NOT EXISTS idx_eventos_esocial_tipo ON eventos_esocial(tipo_evento);
CREATE INDEX IF NOT EXISTS idx_eventos_esocial_status ON eventos_esocial(status);

CREATE INDEX IF NOT EXISTS idx_historico_emails_empresa ON historico_emails(empresa_id);
CREATE INDEX IF NOT EXISTS idx_historico_emails_colaborador ON historico_emails(colaborador_id);
CREATE INDEX IF NOT EXISTS idx_historico_emails_status ON historico_emails(status);

CREATE INDEX IF NOT EXISTS idx_webhooks_empresa ON webhooks(empresa_id);
CREATE INDEX IF NOT EXISTS idx_webhooks_ativo ON webhooks(ativo);

CREATE INDEX IF NOT EXISTS idx_logs_webhooks_webhook ON logs_webhooks(webhook_id);
CREATE INDEX IF NOT EXISTS idx_logs_webhooks_created ON logs_webhooks(created_at DESC);

-- 11. RLS
ALTER TABLE configuracoes_integracoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE logs_sincronizacao ENABLE ROW LEVEL SECURITY;
ALTER TABLE mapeamento_contas_contabeis ENABLE ROW LEVEL SECURITY;
ALTER TABLE arquivos_cnab ENABLE ROW LEVEL SECURITY;
ALTER TABLE eventos_esocial ENABLE ROW LEVEL SECURITY;
ALTER TABLE templates_email ENABLE ROW LEVEL SECURITY;
ALTER TABLE historico_emails ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE logs_webhooks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Acesso total configuracoes_integracoes" ON configuracoes_integracoes;
CREATE POLICY "Acesso total configuracoes_integracoes" ON configuracoes_integracoes
    FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Acesso total logs_sincronizacao" ON logs_sincronizacao;
CREATE POLICY "Acesso total logs_sincronizacao" ON logs_sincronizacao
    FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Acesso total mapeamento_contas_contabeis" ON mapeamento_contas_contabeis;
CREATE POLICY "Acesso total mapeamento_contas_contabeis" ON mapeamento_contas_contabeis
    FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Acesso total arquivos_cnab" ON arquivos_cnab;
CREATE POLICY "Acesso total arquivos_cnab" ON arquivos_cnab
    FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Acesso total eventos_esocial" ON eventos_esocial;
CREATE POLICY "Acesso total eventos_esocial" ON eventos_esocial
    FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Acesso total templates_email" ON templates_email;
CREATE POLICY "Acesso total templates_email" ON templates_email
    FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Acesso total historico_emails" ON historico_emails;
CREATE POLICY "Acesso total historico_emails" ON historico_emails
    FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Acesso total webhooks" ON webhooks;
CREATE POLICY "Acesso total webhooks" ON webhooks
    FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Acesso total logs_webhooks" ON logs_webhooks;
CREATE POLICY "Acesso total logs_webhooks" ON logs_webhooks
    FOR ALL USING (true) WITH CHECK (true);

-- 12. Inserir configuração padrão
INSERT INTO configuracoes_integracoes (empresa_id)
SELECT id FROM empresas LIMIT 1
ON CONFLICT DO NOTHING;

-- 13. Inserir mapeamentos contábeis padrão
INSERT INTO mapeamento_contas_contabeis (empresa_id, tipo_lancamento, descricao, conta_debito, conta_credito, historico_padrao) 
SELECT 
    e.id,
    m.tipo_lancamento,
    m.descricao,
    m.conta_debito,
    m.conta_credito,
    m.historico_padrao
FROM empresas e
CROSS JOIN (VALUES
    ('salario', 'Salários', '3.1.1.01', '1.1.1.01', 'Pagamento de salários ref. {{mes}}/{{ano}}'),
    ('inss_empresa', 'INSS Patronal', '3.2.1.01', '2.1.1.01', 'INSS Patronal ref. {{mes}}/{{ano}}'),
    ('inss_colaborador', 'INSS Colaborador', '1.1.1.01', '2.1.1.02', 'INSS descontado ref. {{mes}}/{{ano}}'),
    ('fgts', 'FGTS', '3.2.1.02', '2.1.1.03', 'FGTS ref. {{mes}}/{{ano}}'),
    ('irrf', 'IRRF', '1.1.1.01', '2.1.1.04', 'IRRF descontado ref. {{mes}}/{{ano}}'),
    ('vale_transporte', 'Vale Transporte', '3.2.2.01', '1.1.1.01', 'Vale transporte ref. {{mes}}/{{ano}}'),
    ('vale_alimentacao', 'Vale Alimentação', '3.2.2.02', '1.1.1.01', 'Vale alimentação ref. {{mes}}/{{ano}}'),
    ('plano_saude', 'Plano de Saúde', '3.2.2.03', '1.1.1.01', 'Plano de saúde ref. {{mes}}/{{ano}}'),
    ('ferias', 'Férias', '3.1.1.02', '1.1.1.01', 'Pagamento de férias - {{colaborador}}'),
    ('decimo_terceiro', '13º Salário', '3.1.1.03', '1.1.1.01', 'Pagamento 13º salário ref. {{ano}}'),
    ('rescisao', 'Rescisão', '3.1.1.04', '1.1.1.01', 'Rescisão contratual - {{colaborador}}')
) AS m(tipo_lancamento, descricao, conta_debito, conta_credito, historico_padrao)
LIMIT 1
ON CONFLICT DO NOTHING;

-- 14. Inserir templates de email padrão
INSERT INTO templates_email (empresa_id, codigo, nome, descricao, assunto, corpo_html, variaveis_disponiveis) 
SELECT 
    e.id,
    t.codigo,
    t.nome,
    t.descricao,
    t.assunto,
    t.corpo_html,
    t.variaveis_disponiveis
FROM empresas e
CROSS JOIN (VALUES
    (
        'holerite',
        'Envio de Holerite',
        'Template para envio mensal de holerite',
        'Holerite {{mes}}/{{ano}} - {{empresa}}',
        '<p>Olá <strong>{{nome}}</strong>,</p><p>Segue em anexo seu holerite referente a {{mes}}/{{ano}}.</p><p>Atenciosamente,<br>{{empresa}}</p>',
        ARRAY['{{nome}}', '{{cargo}}', '{{mes}}', '{{ano}}', '{{empresa}}']
    ),
    (
        'admissao',
        'Boas-vindas - Admissão',
        'Email de boas-vindas para novos colaboradores',
        'Bem-vindo(a) à {{empresa}}!',
        '<p>Olá <strong>{{nome}}</strong>,</p><p>Seja muito bem-vindo(a) à {{empresa}}!</p><p>Estamos felizes em tê-lo(a) em nossa equipe.</p><p>Seu primeiro dia será em {{data_admissao}}.</p><p>Atenciosamente,<br>RH {{empresa}}</p>',
        ARRAY['{{nome}}', '{{cargo}}', '{{data_admissao}}', '{{empresa}}']
    ),
    (
        'aniversario',
        'Feliz Aniversário',
        'Mensagem de aniversário para colaboradores',
        'Feliz Aniversário, {{nome}}! 🎉',
        '<p>Olá <strong>{{nome}}</strong>,</p><p>A equipe {{empresa}} deseja um feliz aniversário! 🎂🎉</p><p>Que este novo ano seja repleto de realizações!</p><p>Parabéns!<br>Equipe {{empresa}}</p>',
        ARRAY['{{nome}}', '{{empresa}}']
    )
) AS t(codigo, nome, descricao, assunto, corpo_html, variaveis_disponiveis)
LIMIT 1
ON CONFLICT (codigo) DO NOTHING;

-- 15. Verificar
SELECT 'Sistema de integrações criado!' as status;
SELECT COUNT(*) as total_configuracoes FROM configuracoes_integracoes;
SELECT COUNT(*) as total_mapeamentos FROM mapeamento_contas_contabeis;
SELECT COUNT(*) as total_templates FROM templates_email;
