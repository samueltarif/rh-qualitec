-- ============================================================================
-- INSERIR CONFIGURAÇÃO BÁSICA DE EMAIL
-- ============================================================================
-- Execute este SQL no Supabase para criar uma configuração de email
-- ============================================================================

-- Verificar se já existe configuração
SELECT * FROM config_email_smtp;

-- Se não existir, inserir configuração básica (AJUSTE OS VALORES!)
INSERT INTO config_email_smtp (
  servidor_smtp,
  porta,
  usuario_smtp,
  senha_smtp,
  email_remetente,
  nome_remetente,
  usa_ssl,
  usa_tls,
  ativo
) VALUES (
  'smtp.gmail.com',           -- Servidor SMTP (Gmail)
  587,                         -- Porta
  'seu-email@gmail.com',       -- ⚠️ ALTERE AQUI
  'sua-senha-de-app',          -- ⚠️ ALTERE AQUI (senha de app do Gmail)
  'seu-email@gmail.com',       -- ⚠️ ALTERE AQUI
  'RH Qualitec',               -- Nome que aparece no email
  false,                       -- Não usa SSL
  true,                        -- Usa TLS
  true                         -- Ativo
)
ON CONFLICT DO NOTHING;

-- Verificar se foi inserido
SELECT 
  servidor_smtp,
  porta,
  usuario_smtp,
  email_remetente,
  nome_remetente,
  ativo
FROM config_email_smtp;

-- ============================================================================
-- IMPORTANTE: GMAIL - SENHA DE APP
-- ============================================================================
-- Se usar Gmail, você precisa criar uma "Senha de App":
-- 1. Acesse: https://myaccount.google.com/security
-- 2. Ative "Verificação em duas etapas"
-- 3. Vá em "Senhas de app"
-- 4. Crie uma senha para "Email"
-- 5. Use essa senha no campo senha_smtp
-- ============================================================================

-- ============================================================================
-- ALTERNATIVA: OUTLOOK/HOTMAIL
-- ============================================================================
-- Se preferir usar Outlook:
-- servidor_smtp: smtp-mail.outlook.com
-- porta: 587
-- usuario_smtp: seu-email@outlook.com
-- senha_smtp: sua-senha-normal
-- ============================================================================
