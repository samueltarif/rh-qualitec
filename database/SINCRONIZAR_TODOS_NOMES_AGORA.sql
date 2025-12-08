-- =====================================================
-- SINCRONIZAR TODOS OS NOMES AGORA
-- =====================================================
-- Atualizar nomes em app_users baseado em colaboradores
-- usando email_pessoal OU email_corporativo

-- PASSO 1: Ver o que vai ser atualizado
SELECT 
  'ANTES' as momento,
  c.nome as nome_colaborador,
  au.nome as nome_app_user_ANTES,
  COALESCE(c.email_pessoal, c.email_corporativo) as email_usado,
  CASE 
    WHEN c.nome != au.nome THEN '⚠️ VAI ATUALIZAR'
    ELSE '✅ JÁ IGUAL'
  END as acao
FROM colaboradores c
INNER JOIN app_users au ON (
  LOWER(TRIM(au.email)) = LOWER(TRIM(c.email_pessoal))
  OR LOWER(TRIM(au.email)) = LOWER(TRIM(c.email_corporativo))
)
WHERE (c.email_pessoal IS NOT NULL OR c.email_corporativo IS NOT NULL)
ORDER BY c.nome;

-- PASSO 2: ATUALIZAR TODOS OS NOMES
UPDATE app_users au
SET 
  nome = c.nome,
  updated_at = NOW()
FROM colaboradores c
WHERE (
  LOWER(TRIM(au.email)) = LOWER(TRIM(c.email_pessoal))
  OR LOWER(TRIM(au.email)) = LOWER(TRIM(c.email_corporativo))
)
AND (c.email_pessoal IS NOT NULL OR c.email_corporativo IS NOT NULL)
AND au.nome != c.nome;

-- PASSO 3: Ver o resultado
SELECT 
  'DEPOIS' as momento,
  c.nome as nome_colaborador,
  au.nome as nome_app_user_DEPOIS,
  au.email,
  '✅ SINCRONIZADO' as status
FROM colaboradores c
INNER JOIN app_users au ON (
  LOWER(TRIM(au.email)) = LOWER(TRIM(c.email_pessoal))
  OR LOWER(TRIM(au.email)) = LOWER(TRIM(c.email_corporativo))
)
WHERE (c.email_pessoal IS NOT NULL OR c.email_corporativo IS NOT NULL)
ORDER BY c.nome;

-- RESUMO
SELECT 
  '✅ SINCRONIZAÇÃO CONCLUÍDA' as status,
  COUNT(*) as total_atualizados
FROM colaboradores c
INNER JOIN app_users au ON (
  LOWER(TRIM(au.email)) = LOWER(TRIM(c.email_pessoal))
  OR LOWER(TRIM(au.email)) = LOWER(TRIM(c.email_corporativo))
)
WHERE c.nome = au.nome;
