-- ============================================
-- EXECUTAR AGORA: FIX SILVANA
-- ============================================
-- Copie e cole este SQL no Supabase SQL Editor

-- PASSO 1: Ver situação atual
SELECT 
  'ANTES DO FIX' AS momento,
  c.nome AS colaborador,
  c.email_corporativo,
  u.email AS usuario_email,
  u.role,
  u.colaborador_id,
  CASE 
    WHEN u.colaborador_id IS NULL THEN '❌ SEM VÍNCULO'
    WHEN u.colaborador_id = c.id THEN '✅ VINCULADO'
    ELSE '⚠️ VÍNCULO ERRADO'
  END AS status
FROM colaboradores c
LEFT JOIN app_users u ON LOWER(c.email_corporativo) = LOWER(u.email)
WHERE LOWER(c.email_corporativo) = 'silvana@qualitec.ind.br'
   OR LOWER(u.email) = 'silvana@qualitec.ind.br';

-- PASSO 2: Vincular Silvana
UPDATE app_users
SET 
  colaborador_id = (
    SELECT id 
    FROM colaboradores 
    WHERE LOWER(email_corporativo) = 'silvana@qualitec.ind.br'
    LIMIT 1
  ),
  updated_at = NOW()
WHERE LOWER(email) = 'silvana@qualitec.ind.br';

-- PASSO 3: Verificar resultado
SELECT 
  'DEPOIS DO FIX' AS momento,
  c.nome AS colaborador,
  c.email_corporativo,
  u.email AS usuario_email,
  u.role,
  u.colaborador_id,
  CASE 
    WHEN u.colaborador_id IS NULL THEN '❌ SEM VÍNCULO'
    WHEN u.colaborador_id = c.id THEN '✅ VINCULADO CORRETAMENTE'
    ELSE '⚠️ VÍNCULO ERRADO'
  END AS status
FROM colaboradores c
INNER JOIN app_users u ON c.id = u.colaborador_id
WHERE LOWER(c.email_corporativo) = 'silvana@qualitec.ind.br'
   OR LOWER(u.email) = 'silvana@qualitec.ind.br';

-- PASSO 4: Verificar lista "sem acesso"
SELECT 
  'COLABORADORES SEM ACESSO' AS lista,
  c.nome,
  c.email_corporativo,
  c.status
FROM colaboradores c
LEFT JOIN app_users u ON c.id = u.colaborador_id
WHERE c.status = 'Ativo' 
  AND u.id IS NULL
  AND LOWER(c.email_corporativo) != 'silvana@qualitec.ind.br';

-- Se retornar vazio ou sem Silvana = ✅ SUCESSO!
