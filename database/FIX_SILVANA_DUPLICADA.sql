-- ============================================
-- FIX: SILVANA APARECENDO COMO "SEM ACESSO"
-- ============================================

-- PASSO 1: VERIFICAR SITUAÇÃO ATUAL DA SILVANA
SELECT 
  'COLABORADOR SILVANA' AS tipo,
  c.id,
  c.nome,
  c.cpf,
  c.email_corporativo,
  c.status
FROM colaboradores c
WHERE LOWER(c.nome) LIKE '%silvana%'
  OR LOWER(c.email_corporativo) LIKE '%silvana%';

SELECT 
  'USUÁRIO SILVANA' AS tipo,
  u.id,
  u.nome,
  u.email,
  u.role,
  u.colaborador_id,
  u.ativo
FROM app_users u
WHERE LOWER(u.nome) LIKE '%silvana%'
  OR LOWER(u.email) LIKE '%silvana%';

-- PASSO 2: VERIFICAR SE HÁ VÍNCULO
SELECT 
  'VÍNCULO' AS tipo,
  c.nome AS colaborador_nome,
  c.email_corporativo,
  u.email AS usuario_email,
  u.role,
  CASE 
    WHEN u.colaborador_id = c.id THEN '✅ Vinculado'
    WHEN u.colaborador_id IS NULL THEN '⚠️ Usuário sem vínculo'
    ELSE '❌ Vínculo incorreto'
  END AS status_vinculo
FROM colaboradores c
LEFT JOIN app_users u ON c.id = u.colaborador_id
WHERE LOWER(c.nome) LIKE '%silvana%'
   OR LOWER(c.email_corporativo) LIKE '%silvana%';

-- PASSO 3: SOLUÇÃO - VINCULAR SILVANA CORRETAMENTE
-- Opção A: Se Silvana tem colaborador, vincular usuário ao colaborador
UPDATE app_users
SET colaborador_id = (
  SELECT id 
  FROM colaboradores 
  WHERE LOWER(email_corporativo) = 'silvana@qualitec.ind.br'
    OR LOWER(nome) LIKE '%silvana%bevilacqua%'
  LIMIT 1
),
updated_at = NOW()
WHERE LOWER(email) = 'silvana@qualitec.ind.br'
  AND colaborador_id IS NULL;

-- PASSO 4: VERIFICAR RESULTADO
SELECT 
  'APÓS FIX' AS tipo,
  c.nome AS colaborador,
  c.email_corporativo,
  u.email AS usuario_email,
  u.role,
  u.colaborador_id,
  CASE 
    WHEN u.colaborador_id = c.id THEN '✅ Vinculado corretamente'
    ELSE '❌ Ainda com problema'
  END AS status
FROM colaboradores c
LEFT JOIN app_users u ON c.id = u.colaborador_id
WHERE LOWER(c.nome) LIKE '%silvana%'
   OR LOWER(c.email_corporativo) LIKE '%silvana%';

-- PASSO 5: VERIFICAR LISTA "SEM ACESSO" APÓS FIX
-- Esta query simula o que o sistema faz
SELECT 
  c.nome,
  c.email_corporativo,
  c.status,
  CASE 
    WHEN u.id IS NULL THEN '❌ Aparece em "sem acesso"'
    ELSE '✅ NÃO aparece em "sem acesso"'
  END AS aparece_lista
FROM colaboradores c
LEFT JOIN app_users u ON c.id = u.colaborador_id
WHERE c.status = 'Ativo'
  AND (LOWER(c.nome) LIKE '%silvana%' OR LOWER(c.email_corporativo) LIKE '%silvana%');
