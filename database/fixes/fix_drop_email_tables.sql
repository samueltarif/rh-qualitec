-- ============================================================================
-- FIX: Deletar tabelas de e-mail para recriar corretamente
-- ============================================================================
-- Execute este script PRIMEIRO no Supabase SQL Editor
-- ============================================================================

-- Desabilitar RLS temporariamente
ALTER TABLE IF EXISTS configuracoes_smtp DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS templates_email DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS historico_emails DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS fila_emails DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS configuracoes_comunicacao DISABLE ROW LEVEL SECURITY;

-- Deletar policies
DROP POLICY IF EXISTS "Usuários podem ver SMTP da sua empresa" ON configuracoes_smtp;
DROP POLICY IF EXISTS "Admins podem gerenciar SMTP" ON configuracoes_smtp;
DROP POLICY IF EXISTS "Usuários podem ver templates da sua empresa" ON templates_email;
DROP POLICY IF EXISTS "Admins e RH podem gerenciar templates" ON templates_email;
DROP POLICY IF EXISTS "Usuários podem ver histórico da sua empresa" ON historico_emails;
DROP POLICY IF EXISTS "Sistema pode inserir no histórico" ON historico_emails;
DROP POLICY IF EXISTS "Sistema pode gerenciar fila" ON fila_emails;
DROP POLICY IF EXISTS "Usuários podem ver config de comunicação" ON configuracoes_comunicacao;
DROP POLICY IF EXISTS "Admins podem gerenciar config de comunicação" ON configuracoes_comunicacao;

-- Deletar triggers
DROP TRIGGER IF EXISTS update_smtp_updated_at ON configuracoes_smtp;
DROP TRIGGER IF EXISTS update_templates_updated_at ON templates_email;
DROP TRIGGER IF EXISTS update_comunicacao_updated_at ON configuracoes_comunicacao;

-- Deletar índices
DROP INDEX IF EXISTS idx_smtp_empresa;
DROP INDEX IF EXISTS idx_smtp_ativo;
DROP INDEX IF EXISTS idx_templates_empresa;
DROP INDEX IF EXISTS idx_templates_codigo;
DROP INDEX IF EXISTS idx_templates_categoria;
DROP INDEX IF EXISTS idx_templates_ativo;
DROP INDEX IF EXISTS idx_historico_empresa;
DROP INDEX IF EXISTS idx_historico_destinatario;
DROP INDEX IF EXISTS idx_historico_status;
DROP INDEX IF EXISTS idx_historico_enviado;
DROP INDEX IF EXISTS idx_historico_contexto;
DROP INDEX IF EXISTS idx_historico_template;
DROP INDEX IF EXISTS idx_fila_status;
DROP INDEX IF EXISTS idx_fila_agendado;
DROP INDEX IF EXISTS idx_fila_prioridade;
DROP INDEX IF EXISTS idx_fila_empresa;
DROP INDEX IF EXISTS idx_comunicacao_empresa;

-- Deletar tabelas (ordem importa por causa das foreign keys)
DROP TABLE IF EXISTS historico_emails CASCADE;
DROP TABLE IF EXISTS fila_emails CASCADE;
DROP TABLE IF EXISTS templates_email CASCADE;
DROP TABLE IF EXISTS configuracoes_smtp CASCADE;
DROP TABLE IF EXISTS configuracoes_comunicacao CASCADE;

-- Verificar se foram deletadas
SELECT 
    CASE 
        WHEN COUNT(*) = 0 THEN '✅ Todas as tabelas foram deletadas com sucesso!'
        ELSE '❌ Ainda existem ' || COUNT(*) || ' tabelas'
    END as resultado
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
    'configuracoes_smtp',
    'templates_email',
    'historico_emails',
    'fila_emails',
    'configuracoes_comunicacao'
);
