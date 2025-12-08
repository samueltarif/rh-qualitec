-- ============================================
-- VERIFICAR SITUAÇÃO: USUÁRIOS E COLABORADORES
-- ============================================

-- 1. COLABORADORES COM USUÁRIO
-- Mostra colaboradores que já têm acesso ao sistema
SELECT 
  c.nome AS colaborador,
  c.cpf,
  c.email_corporativo,
  u.email AS email_login,
  u.role AS nivel_acesso,
  u.ativo AS usuario_ativo,
  CASE 
    WHEN u.role = 'admin' THEN '👑 Admin'
    ELSE '👤 Funcionário'
  END AS perfil
FROM colaboradores c
INNER JOIN app_users u ON c.id = u.colaborador_id
WHERE c.status = 'Ativo'
ORDER BY c.nome;

-- 2. COLABORADORES SEM USUÁRIO
-- Mostra colaboradores ativos que NÃO têm acesso ao sistema
SELECT 
  c.nome AS colaborador,
  c.cpf,
  c.email_corporativo,
  cg.nome AS cargo,
  '❌ Sem acesso' AS status
FROM colaboradores c
LEFT JOIN app_users u ON c.id = u.colaborador_id
LEFT JOIN cargos cg ON c.cargo_id = cg.id
WHERE c.status = 'Ativo' 
  AND u.id IS NULL
ORDER BY c.nome;

-- 3. USUÁRIOS SEM COLABORADOR
-- Mostra usuários que não estão vinculados a nenhum colaborador
SELECT 
  u.nome AS usuario,
  u.email,
  u.role,
  u.ativo,
  CASE 
    WHEN u.colaborador_id IS NULL THEN '⚠️ Sem vínculo'
    ELSE '✅ Vinculado'
  END AS status_vinculo
FROM app_users u
WHERE u.colaborador_id IS NULL
ORDER BY u.nome;

-- 4. RESUMO GERAL
SELECT 
  'Total Colaboradores Ativos' AS metrica,
  COUNT(*) AS quantidade
FROM colaboradores
WHERE status = 'Ativo'

UNION ALL

SELECT 
  'Colaboradores COM Usuário' AS metrica,
  COUNT(*) AS quantidade
FROM colaboradores c
INNER JOIN app_users u ON c.id = u.colaborador_id
WHERE c.status = 'Ativo'

UNION ALL

SELECT 
  'Colaboradores SEM Usuário' AS metrica,
  COUNT(*) AS quantidade
FROM colaboradores c
LEFT JOIN app_users u ON c.id = u.colaborador_id
WHERE c.status = 'Ativo' 
  AND u.id IS NULL

UNION ALL

SELECT 
  'Total Usuários Ativos' AS metrica,
  COUNT(*) AS quantidade
FROM app_users
WHERE ativo = true

UNION ALL

SELECT 
  'Usuários SEM Colaborador' AS metrica,
  COUNT(*) AS quantidade
FROM app_users
WHERE colaborador_id IS NULL;

-- 5. VERIFICAR DUPLICAÇÕES (MESMO CPF/EMAIL)
-- Verifica se há colaboradores duplicados
SELECT 
  cpf,
  COUNT(*) AS quantidade,
  STRING_AGG(nome, ', ') AS nomes
FROM colaboradores
WHERE cpf IS NOT NULL
GROUP BY cpf
HAVING COUNT(*) > 1;

-- 6. VERIFICAR EMAILS DUPLICADOS EM USUÁRIOS
SELECT 
  email,
  COUNT(*) AS quantidade,
  STRING_AGG(nome, ', ') AS nomes
FROM app_users
GROUP BY email
HAVING COUNT(*) > 1;

-- 7. COLABORADORES E SEUS USUÁRIOS (VISÃO COMPLETA)
SELECT 
  c.nome AS colaborador,
  c.cpf,
  c.email_corporativo,
  c.status AS status_colaborador,
  cg.nome AS cargo,
  u.email AS email_login,
  u.role AS nivel_acesso,
  u.ativo AS usuario_ativo,
  CASE 
    WHEN u.id IS NULL THEN '❌ Sem acesso'
    WHEN u.ativo = false THEN '⚠️ Acesso inativo'
    ELSE '✅ Acesso ativo'
  END AS status_acesso
FROM colaboradores c
LEFT JOIN app_users u ON c.id = u.colaborador_id
LEFT JOIN cargos cg ON c.cargo_id = cg.id
WHERE c.status = 'Ativo'
ORDER BY 
  CASE 
    WHEN u.id IS NULL THEN 1
    WHEN u.ativo = false THEN 2
    ELSE 3
  END,
  c.nome;
