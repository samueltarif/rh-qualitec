-- ============================================================================
-- SISTEMA DE NOTIFICAÇÕES E ALERTAS RH
-- Execute no Supabase SQL Editor
-- ============================================================================

-- 1. Tabela de CONFIGURAÇÕES de notificações
CREATE TABLE IF NOT EXISTS configuracoes_notificacoes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    empresa_id UUID REFERENCES empresas(id) ON DELETE CASCADE,
    
    -- Notificações de Documentos
    notificar_documentos_vencendo BOOLEAN DEFAULT true,
    dias_antecedencia_documentos INTEGER DEFAULT 30,
    
    -- Notificações de Contratos
    notificar_contratos_vencendo BOOLEAN DEFAULT true,
    dias_antecedencia_contratos INTEGER DEFAULT 60,
    
    -- Notificações de Férias
    notificar_ferias_vencendo BOOLEAN DEFAULT true,
    dias_antecedencia_ferias INTEGER DEFAULT 30,
    notificar_ferias_programadas BOOLEAN DEFAULT true,
    dias_antecedencia_ferias_programadas INTEGER DEFAULT 15,
    
    -- Notificações de Aniversários
    notificar_aniversarios BOOLEAN DEFAULT true,
    dias_antecedencia_aniversarios INTEGER DEFAULT 1,
    notificar_aniversarios_empresa BOOLEAN DEFAULT true,
    dias_antecedencia_aniversarios_empresa INTEGER DEFAULT 7,
    
    -- Notificações de Exames Médicos
    notificar_exames_vencendo BOOLEAN DEFAULT true,
    dias_antecedencia_exames INTEGER DEFAULT 30,
    
    -- Notificações de Período de Experiência
    notificar_experiencia_vencendo BOOLEAN DEFAULT true,
    dias_antecedencia_experiencia INTEGER DEFAULT 15,
    
    -- Notificações de Ponto
    notificar_faltas_injustificadas BOOLEAN DEFAULT true,
    notificar_atrasos_frequentes BOOLEAN DEFAULT true,
    limite_atrasos_mes INTEGER DEFAULT 3,
    notificar_horas_extras_excessivas BOOLEAN DEFAULT true,
    limite_horas_extras_mes INTEGER DEFAULT 40,
    
    -- Notificações de Folha
    notificar_folha_processada BOOLEAN DEFAULT true,
    notificar_erros_folha BOOLEAN DEFAULT true,
    
    -- Notificações de Afastamentos
    notificar_afastamentos_longos BOOLEAN DEFAULT true,
    dias_afastamento_longo INTEGER DEFAULT 15,
    notificar_retorno_afastamento BOOLEAN DEFAULT true,
    dias_antecedencia_retorno INTEGER DEFAULT 3,
    
    -- Notificações de Treinamentos
    notificar_certificados_vencendo BOOLEAN DEFAULT true,
    dias_antecedencia_certificados INTEGER DEFAULT 60,
    
    -- Canais de Notificação
    enviar_email BOOLEAN DEFAULT true,
    enviar_sistema BOOLEAN DEFAULT true,
    enviar_push BOOLEAN DEFAULT false,
    
    -- Destinatários padrão
    notificar_rh BOOLEAN DEFAULT true,
    notificar_gestor BOOLEAN DEFAULT true,
    notificar_colaborador BOOLEAN DEFAULT false,
    
    -- Horários de envio
    horario_envio_diario TIME DEFAULT '08:00:00',
    dias_envio_semanal INTEGER[] DEFAULT ARRAY[1,2,3,4,5], -- 1=Segunda, 7=Domingo
    
    -- Resumo diário
    enviar_resumo_diario BOOLEAN DEFAULT true,
    horario_resumo_diario TIME DEFAULT '07:00:00',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Tabela de TIPOS de alertas
CREATE TABLE IF NOT EXISTS tipos_alertas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    codigo VARCHAR(50) NOT NULL UNIQUE,
    nome VARCHAR(100) NOT NULL,
    descricao TEXT,
    categoria VARCHAR(50) NOT NULL, -- documentos, ferias, ponto, folha, etc
    icone VARCHAR(50) DEFAULT 'heroicons:bell',
    cor VARCHAR(20) DEFAULT 'blue',
    prioridade VARCHAR(20) DEFAULT 'media', -- baixa, media, alta, critica
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Tabela de ALERTAS gerados
CREATE TABLE IF NOT EXISTS alertas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    empresa_id UUID REFERENCES empresas(id) ON DELETE CASCADE,
    tipo_alerta_id UUID REFERENCES tipos_alertas(id) ON DELETE CASCADE,
    
    -- Referências
    colaborador_id UUID REFERENCES colaboradores(id) ON DELETE CASCADE,
    documento_id UUID,
    referencia_tipo VARCHAR(50), -- documento, ferias, contrato, exame, etc
    referencia_id UUID,
    
    -- Conteúdo
    titulo VARCHAR(200) NOT NULL,
    mensagem TEXT NOT NULL,
    dados_extras JSONB DEFAULT '{}'::jsonb,
    
    -- Status
    status VARCHAR(20) DEFAULT 'pendente', -- pendente, lido, resolvido, ignorado
    prioridade VARCHAR(20) DEFAULT 'media',
    data_vencimento DATE,
    
    -- Leitura
    lido_em TIMESTAMP WITH TIME ZONE,
    lido_por UUID REFERENCES auth.users(id),
    
    -- Resolução
    resolvido_em TIMESTAMP WITH TIME ZONE,
    resolvido_por UUID REFERENCES auth.users(id),
    observacao_resolucao TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Tabela de NOTIFICAÇÕES enviadas
CREATE TABLE IF NOT EXISTS notificacoes_enviadas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    alerta_id UUID REFERENCES alertas(id) ON DELETE CASCADE,
    
    -- Destinatário
    usuario_id UUID REFERENCES auth.users(id),
    email_destino VARCHAR(255),
    
    -- Canal
    canal VARCHAR(20) NOT NULL, -- email, sistema, push
    
    -- Status
    status VARCHAR(20) DEFAULT 'pendente', -- pendente, enviado, erro, lido
    erro_mensagem TEXT,
    
    -- Timestamps
    enviado_em TIMESTAMP WITH TIME ZONE,
    lido_em TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Tabela de REGRAS de notificação customizadas
CREATE TABLE IF NOT EXISTS regras_notificacao (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    empresa_id UUID REFERENCES empresas(id) ON DELETE CASCADE,
    
    nome VARCHAR(100) NOT NULL,
    descricao TEXT,
    
    -- Condição
    tipo_evento VARCHAR(50) NOT NULL, -- documento_vencendo, aniversario, etc
    condicao JSONB DEFAULT '{}'::jsonb, -- Condições específicas
    
    -- Ação
    dias_antecedencia INTEGER DEFAULT 30,
    recorrencia VARCHAR(20) DEFAULT 'unica', -- unica, diaria, semanal
    
    -- Destinatários
    notificar_rh BOOLEAN DEFAULT true,
    notificar_gestor BOOLEAN DEFAULT false,
    notificar_colaborador BOOLEAN DEFAULT false,
    emails_adicionais TEXT[], -- Emails extras
    
    -- Template
    template_titulo VARCHAR(200),
    template_mensagem TEXT,
    
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Índices
CREATE INDEX IF NOT EXISTS idx_alertas_empresa ON alertas(empresa_id);
CREATE INDEX IF NOT EXISTS idx_alertas_colaborador ON alertas(colaborador_id);
CREATE INDEX IF NOT EXISTS idx_alertas_status ON alertas(status);
CREATE INDEX IF NOT EXISTS idx_alertas_prioridade ON alertas(prioridade);
CREATE INDEX IF NOT EXISTS idx_alertas_data_vencimento ON alertas(data_vencimento);
CREATE INDEX IF NOT EXISTS idx_alertas_created ON alertas(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notificacoes_enviadas_alerta ON notificacoes_enviadas(alerta_id);
CREATE INDEX IF NOT EXISTS idx_notificacoes_enviadas_usuario ON notificacoes_enviadas(usuario_id);
CREATE INDEX IF NOT EXISTS idx_regras_notificacao_empresa ON regras_notificacao(empresa_id);

-- 7. RLS
ALTER TABLE configuracoes_notificacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE tipos_alertas ENABLE ROW LEVEL SECURITY;
ALTER TABLE alertas ENABLE ROW LEVEL SECURITY;
ALTER TABLE notificacoes_enviadas ENABLE ROW LEVEL SECURITY;
ALTER TABLE regras_notificacao ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Acesso total configuracoes_notificacoes" ON configuracoes_notificacoes;
CREATE POLICY "Acesso total configuracoes_notificacoes" ON configuracoes_notificacoes
    FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Acesso total tipos_alertas" ON tipos_alertas;
CREATE POLICY "Acesso total tipos_alertas" ON tipos_alertas
    FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Acesso total alertas" ON alertas;
CREATE POLICY "Acesso total alertas" ON alertas
    FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Acesso total notificacoes_enviadas" ON notificacoes_enviadas;
CREATE POLICY "Acesso total notificacoes_enviadas" ON notificacoes_enviadas
    FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Acesso total regras_notificacao" ON regras_notificacao;
CREATE POLICY "Acesso total regras_notificacao" ON regras_notificacao
    FOR ALL USING (true) WITH CHECK (true);

-- 8. Inserir tipos de alertas padrão
INSERT INTO tipos_alertas (codigo, nome, descricao, categoria, icone, cor, prioridade) VALUES
    -- Documentos
    ('DOC_VENCENDO', 'Documento Vencendo', 'Documento próximo do vencimento', 'documentos', 'heroicons:document-text', 'amber', 'media'),
    ('DOC_VENCIDO', 'Documento Vencido', 'Documento já venceu', 'documentos', 'heroicons:document-text', 'red', 'alta'),
    ('DOC_PENDENTE', 'Documento Pendente', 'Documento obrigatório não enviado', 'documentos', 'heroicons:document-text', 'orange', 'media'),
    
    -- Férias
    ('FERIAS_VENCENDO', 'Férias Vencendo', 'Período aquisitivo próximo de vencer', 'ferias', 'heroicons:sun', 'amber', 'alta'),
    ('FERIAS_PROGRAMADAS', 'Férias Programadas', 'Férias agendadas se aproximando', 'ferias', 'heroicons:sun', 'blue', 'baixa'),
    ('FERIAS_RETORNO', 'Retorno de Férias', 'Colaborador retornando de férias', 'ferias', 'heroicons:sun', 'green', 'baixa'),
    
    -- Contratos
    ('CONTRATO_VENCENDO', 'Contrato Vencendo', 'Contrato temporário próximo do fim', 'contratos', 'heroicons:document-check', 'amber', 'alta'),
    ('EXPERIENCIA_VENCENDO', 'Experiência Vencendo', 'Período de experiência terminando', 'contratos', 'heroicons:clock', 'amber', 'alta'),
    
    -- Exames Médicos
    ('EXAME_VENCENDO', 'Exame Vencendo', 'ASO ou exame periódico vencendo', 'saude', 'heroicons:heart', 'amber', 'alta'),
    ('EXAME_VENCIDO', 'Exame Vencido', 'ASO ou exame periódico vencido', 'saude', 'heroicons:heart', 'red', 'critica'),
    
    -- Ponto
    ('FALTA_INJUSTIFICADA', 'Falta Injustificada', 'Colaborador faltou sem justificativa', 'ponto', 'heroicons:x-circle', 'red', 'media'),
    ('ATRASOS_FREQUENTES', 'Atrasos Frequentes', 'Colaborador com muitos atrasos no mês', 'ponto', 'heroicons:clock', 'orange', 'media'),
    ('HORAS_EXTRAS_EXCESSIVAS', 'Horas Extras Excessivas', 'Colaborador com muitas horas extras', 'ponto', 'heroicons:clock', 'amber', 'media'),
    
    -- Aniversários
    ('ANIVERSARIO', 'Aniversário', 'Aniversário de colaborador', 'pessoal', 'heroicons:cake', 'pink', 'baixa'),
    ('ANIVERSARIO_EMPRESA', 'Aniversário de Empresa', 'Aniversário de admissão', 'pessoal', 'heroicons:building-office', 'purple', 'baixa'),
    
    -- Afastamentos
    ('AFASTAMENTO_LONGO', 'Afastamento Longo', 'Colaborador afastado há muito tempo', 'afastamentos', 'heroicons:user-minus', 'orange', 'media'),
    ('RETORNO_AFASTAMENTO', 'Retorno de Afastamento', 'Colaborador retornando de afastamento', 'afastamentos', 'heroicons:user-plus', 'green', 'baixa'),
    
    -- Treinamentos
    ('CERTIFICADO_VENCENDO', 'Certificado Vencendo', 'Certificado/NR próximo do vencimento', 'treinamentos', 'heroicons:academic-cap', 'amber', 'media'),
    ('CERTIFICADO_VENCIDO', 'Certificado Vencido', 'Certificado/NR vencido', 'treinamentos', 'heroicons:academic-cap', 'red', 'alta'),
    
    -- Folha
    ('FOLHA_PROCESSADA', 'Folha Processada', 'Folha de pagamento processada', 'folha', 'heroicons:banknotes', 'green', 'baixa'),
    ('ERRO_FOLHA', 'Erro na Folha', 'Erro detectado no processamento', 'folha', 'heroicons:exclamation-triangle', 'red', 'critica'),
    
    -- Sistema
    ('BACKUP_REALIZADO', 'Backup Realizado', 'Backup automático concluído', 'sistema', 'heroicons:server', 'green', 'baixa'),
    ('ERRO_SISTEMA', 'Erro no Sistema', 'Erro crítico detectado', 'sistema', 'heroicons:exclamation-circle', 'red', 'critica')
ON CONFLICT (codigo) DO NOTHING;

-- 9. Inserir configuração padrão (se existir empresa)
INSERT INTO configuracoes_notificacoes (empresa_id)
SELECT id FROM empresas LIMIT 1
ON CONFLICT DO NOTHING;

-- 10. Verificar
SELECT 'Sistema de notificações criado!' as status;
SELECT COUNT(*) as total_tipos_alertas FROM tipos_alertas;
