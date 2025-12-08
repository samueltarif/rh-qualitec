-- =====================================================
-- VER RELAÇÃO COMPLETA ENTRE COLABORADORES E USUÁRIOS
-- =====================================================

-- Ver TODOS os colaboradores e seus emails
SELECT 
  '👥 COLABORADORES' as tipo,
  id,
  nome,
  email_pessoal,
  email_corporativo
FROM colaboradores
ORDER BY nome;

-- Ver TODOS os usuários e seus emails
SELECT 
  '🔐 APP_USERS' as tipo,
  id,
  nome,
  email,
  role
FROM app_users
ORDER BY nome;

-- Tentar vincular por email_pessoal
SELECT 
  'VINCULO POR EMAIL_PESSOAL' as tipo_vinculo,
  c.nome as nome_colaborador,
  c.email_pessoal,
  au.nome as nome_app_user,
  au.email,
  CASE 
    WHEN c.nome = au.nome THEN '✅ NOMES IGUAIS'
    ELSE '❌ NOMES DIFERENTES'
  END as status_nomes
FROM colaboradores c
INNER JOIN app_users au ON LOWER(TRIM(c.email_pessoal)) = LOWER(TRIM(au.email))
WHERE c.email_pessoal IS NOT NULL;

-- Tentar vincular por email_corporativo
SELECT 
  'VINCULO POR EMAIL_CORPORATIVO' as tipo_vinculo,
  c.nome as nome_colaborador,
  c.email_corporativo,
  au.nome as nome_app_user,
  au.email,
  CASE 
    WHEN c.nome = au.nome THEN '✅ NOMES IGUAIS'
    ELSE '❌ NOMES DIFERENTES'
  END as status_nomes
FROM colaboradores c
INNER JOIN app_users au ON LOWER(TRIM(c.email_corporativo)) = LOWER(TRIM(au.email))
WHERE c.email_corporativo IS NOT NULL;
