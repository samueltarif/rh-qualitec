-- ============================================================================
-- SISTEMA DE BACKUP E SEGURANÇA - LOGS E AUDITORIA
-- Execute no Supabase SQL Editor
-- ============================================================================

-- 1. Tabela de LOGS DE ACESSO
CREATE TABLE IF NOT EXISTS logs_acesso (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Usuário
    usuario_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    usuario_email VARCHAR(255),
    usuario_nome VARCHAR(255),
    
    -- Ação
    acao VARCHAR(50) NOT NULL, -- login, logout, acesso_pagina, erro_autenticacao
    recurso VARCHAR(100), -- Página/recurso acessado
    metodo VARCHAR(10), -- GET, POST, PUT, DELETE
    
    -- Detalhes
    ip_address VARCHAR(45),
    user_agent TEXT,
    navegador VARCHAR(100),
    sistema_operacional VARCHAR(100),
    dispositivo VARCHAR(50), -- desktop, mobile, tablet
    
    -- Localização (opcional)
    pais VARCHAR(100),
    cidade VARCHAR(100),
    
    -- Status
    sucesso BOOLEAN DEFAULT true,
    mensagem_erro TEXT,
    
    -- Metadados
    duracao_ms INTEGER, -- Tempo de resposta em ms
    dados_extras JSONB DEFAULT '{}'::jsonb,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Tabela de AUDITORIA (rastreamento de mudanças)
CREATE TABLE IF NOT EXISTS auditoria (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Usuário que fez a ação
    usuario_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    usuario_email VARCHAR(255),
    usuario_nome VARCHAR(255),
    
    -- Ação realizada
    acao VARCHAR(50) NOT NULL, -- create, update, delete, export, import
    tabela VARCHAR(100) NOT NULL, -- Nome da tabela afetada
    registro_id UUID, -- ID do registro afetado
    
    -- Dados
    dados_anteriores JSONB, -- Estado antes da mudança
    dados_novos JSONB, -- Estado depois da mudança
    campos_alterados TEXT[], -- Lista de campos modificados
    
    -- Contexto
    ip_address VARCHAR(45),
    motivo TEXT, -- Motivo da alteração (opcional)
    
    -- Metadados
    dados_extras JSONB DEFAULT '{}'::jsonb,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Tabela de CONFIGURAÇÕES DE BACKUP
CREATE TABLE IF NOT EXISTS configuracoes_backup (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    empresa_id UUID REFERENCES empresas(id) ON DELETE CASCADE,
    
    -- Backup Automático
    backup_automatico BOOLEAN DEFAULT true,
    frequencia VARCHAR(20) DEFAULT 'diario', -- diario, semanal, mensal
    horario_backup TIME DEFAULT '02:00:00',
    dia_semana INTEGER, -- 1-7 para backup semanal
    dia_mes INTEGER, -- 1-31 para backup mensal
    
    -- Retenção
    manter_backups_dias INTEGER DEFAULT 30,
    manter_backups_quantidade INTEGER DEFAULT 10,
    
    -- O que incluir
    incluir_colaboradores BOOLEAN DEFAULT true,
    incluir_documentos BOOLEAN DEFAULT true,
    incluir_folha BOOLEAN DEFAULT true,
    incluir_ponto BOOLEAN DEFAULT true,
    incluir_ferias BOOLEAN DEFAULT true,
    incluir_configuracoes BOOLEAN DEFAULT true,
    
    -- Notificações
    notificar_backup_sucesso BOOLEAN DEFAULT false,
    notificar_backup_erro BOOLEAN DEFAULT true,
    emails_notificacao TEXT[],
    
    -- Segurança
    criptografar_backup BOOLEAN DEFAULT true,
    senha_backup VARCHAR(255), -- Hash da senha
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Tabela de HISTÓRICO DE BACKUPS
CREATE TABLE IF NOT EXISTS historico_backups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    empresa_id UUID REFERENCES empresas(id) ON DELETE CASCADE,
    
    -- Informações do backup
    tipo VARCHAR(20) NOT NULL, -- automatico, manual
    status VARCHAR(20) DEFAULT 'processando', -- processando, concluido, erro
    
    -- Dados
    tamanho_bytes BIGINT,
    tamanho_formatado VARCHAR(20), -- Ex: "2.5 MB"
    arquivo_url TEXT, -- URL do arquivo no storage
    arquivo_nome VARCHAR(255),
    
    -- Conteúdo
    tabelas_incluidas TEXT[],
    total_registros INTEGER,
    
    -- Resultado
    sucesso BOOLEAN,
    mensagem_erro TEXT,
    duracao_segundos INTEGER,
    
    -- Usuário que iniciou (para backups manuais)
    iniciado_por UUID REFERENCES auth.users(id),
    
    -- Metadados
    dados_extras JSONB DEFAULT '{}'::jsonb,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expira_em TIMESTAMP WITH TIME ZONE -- Data de expiração
);

-- 5. Tabela de SESSÕES ATIVAS
CREATE TABLE IF NOT EXISTS sessoes_ativas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Sessão
    token_hash VARCHAR(255) NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    dispositivo VARCHAR(50),
    
    -- Status
    ativo BOOLEAN DEFAULT true,
    ultimo_acesso TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Validade
    expira_em TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Tabela de TENTATIVAS DE LOGIN
CREATE TABLE IF NOT EXISTS tentativas_login (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    email VARCHAR(255) NOT NULL,
    ip_address VARCHAR(45),
    
    -- Resultado
    sucesso BOOLEAN DEFAULT false,
    motivo_falha VARCHAR(100), -- senha_incorreta, usuario_nao_existe, conta_bloqueada
    
    -- Segurança
    bloqueado_ate TIMESTAMP WITH TIME ZONE, -- Se IP foi bloqueado temporariamente
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Tabela de POLÍTICAS DE SEGURANÇA
CREATE TABLE IF NOT EXISTS politicas_seguranca (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    empresa_id UUID REFERENCES empresas(id) ON DELETE CASCADE,
    
    -- Senha
    senha_minimo_caracteres INTEGER DEFAULT 8,
    senha_requer_maiuscula BOOLEAN DEFAULT true,
    senha_requer_minuscula BOOLEAN DEFAULT true,
    senha_requer_numero BOOLEAN DEFAULT true,
    senha_requer_especial BOOLEAN DEFAULT true,
    senha_expira_dias INTEGER DEFAULT 90,
    senha_historico INTEGER DEFAULT 5, -- Não permitir reutilizar últimas N senhas
    
    -- Login
    max_tentativas_login INTEGER DEFAULT 5,
    bloqueio_temporario_minutos INTEGER DEFAULT 30,
    sessao_expira_horas INTEGER DEFAULT 8,
    logout_automatico_inatividade BOOLEAN DEFAULT true,
    inatividade_minutos INTEGER DEFAULT 30,
    
    -- Autenticação
    requer_2fa BOOLEAN DEFAULT false, -- Two-factor authentication
    permitir_multiplas_sessoes BOOLEAN DEFAULT true,
    
    -- Auditoria
    registrar_todos_acessos BOOLEAN DEFAULT true,
    registrar_mudancas_dados BOOLEAN DEFAULT true,
    manter_logs_dias INTEGER DEFAULT 90,
    
    -- LGPD
    termo_uso_versao VARCHAR(20),
    termo_uso_obrigatorio BOOLEAN DEFAULT true,
    politica_privacidade_versao VARCHAR(20),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Índices para performance
CREATE INDEX IF NOT EXISTS idx_logs_acesso_usuario ON logs_acesso(usuario_id);
CREATE INDEX IF NOT EXISTS idx_logs_acesso_acao ON logs_acesso(acao);
CREATE INDEX IF NOT EXISTS idx_logs_acesso_created ON logs_acesso(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_logs_acesso_ip ON logs_acesso(ip_address);

CREATE INDEX IF NOT EXISTS idx_auditoria_usuario ON auditoria(usuario_id);
CREATE INDEX IF NOT EXISTS idx_auditoria_tabela ON auditoria(tabela);
CREATE INDEX IF NOT EXISTS idx_auditoria_registro ON auditoria(registro_id);
CREATE INDEX IF NOT EXISTS idx_auditoria_created ON auditoria(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_historico_backups_empresa ON historico_backups(empresa_id);
CREATE INDEX IF NOT EXISTS idx_historico_backups_status ON historico_backups(status);
CREATE INDEX IF NOT EXISTS idx_historico_backups_created ON historico_backups(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_sessoes_ativas_usuario ON sessoes_ativas(usuario_id);
CREATE INDEX IF NOT EXISTS idx_sessoes_ativas_ativo ON sessoes_ativas(ativo);

CREATE INDEX IF NOT EXISTS idx_tentativas_login_email ON tentativas_login(email);
CREATE INDEX IF NOT EXISTS idx_tentativas_login_ip ON tentativas_login(ip_address);
CREATE INDEX IF NOT EXISTS idx_tentativas_login_created ON tentativas_login(created_at DESC);

-- 9. RLS (Row Level Security)
ALTER TABLE logs_acesso ENABLE ROW LEVEL SECURITY;
ALTER TABLE auditoria ENABLE ROW LEVEL SECURITY;
ALTER TABLE configuracoes_backup ENABLE ROW LEVEL SECURITY;
ALTER TABLE historico_backups ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessoes_ativas ENABLE ROW LEVEL SECURITY;
ALTER TABLE tentativas_login ENABLE ROW LEVEL SECURITY;
ALTER TABLE politicas_seguranca ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso (permitir tudo por enquanto - ajustar conforme necessário)
DROP POLICY IF EXISTS "Acesso total logs_acesso" ON logs_acesso;
CREATE POLICY "Acesso total logs_acesso" ON logs_acesso
    FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Acesso total auditoria" ON auditoria;
CREATE POLICY "Acesso total auditoria" ON auditoria
    FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Acesso total configuracoes_backup" ON configuracoes_backup;
CREATE POLICY "Acesso total configuracoes_backup" ON configuracoes_backup
    FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Acesso total historico_backups" ON historico_backups;
CREATE POLICY "Acesso total historico_backups" ON historico_backups
    FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Acesso total sessoes_ativas" ON sessoes_ativas;
CREATE POLICY "Acesso total sessoes_ativas" ON sessoes_ativas
    FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Acesso total tentativas_login" ON tentativas_login;
CREATE POLICY "Acesso total tentativas_login" ON tentativas_login
    FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Acesso total politicas_seguranca" ON politicas_seguranca;
CREATE POLICY "Acesso total politicas_seguranca" ON politicas_seguranca
    FOR ALL USING (true) WITH CHECK (true);

-- 10. Inserir configurações padrão
INSERT INTO configuracoes_backup (empresa_id)
SELECT id FROM empresas LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO politicas_seguranca (empresa_id)
SELECT id FROM empresas LIMIT 1
ON CONFLICT DO NOTHING;

-- 11. Função para limpar logs antigos (executar periodicamente)
CREATE OR REPLACE FUNCTION limpar_logs_antigos()
RETURNS void AS $$
BEGIN
    -- Limpar logs de acesso com mais de 90 dias
    DELETE FROM logs_acesso 
    WHERE created_at < NOW() - INTERVAL '90 days';
    
    -- Limpar tentativas de login com mais de 30 dias
    DELETE FROM tentativas_login 
    WHERE created_at < NOW() - INTERVAL '30 days';
    
    -- Limpar sessões expiradas
    DELETE FROM sessoes_ativas 
    WHERE expira_em < NOW() OR ultimo_acesso < NOW() - INTERVAL '30 days';
    
    -- Limpar backups expirados
    DELETE FROM historico_backups 
    WHERE expira_em < NOW();
END;
$$ LANGUAGE plpgsql;

-- 12. Verificar
SELECT 'Sistema de backup e segurança criado!' as status;
SELECT COUNT(*) as total_configuracoes FROM configuracoes_backup;
SELECT COUNT(*) as total_politicas FROM politicas_seguranca;
