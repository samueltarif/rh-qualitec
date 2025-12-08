-- ============================================================================
-- VERIFICAR DADOS DO USUÁRIO LOGADO
-- Execute no Supabase SQL Editor
-- ============================================================================

-- 1. Ver todos os usuários e seus vínculos
SELECT 
  u.id as app_user_id,
  u.auth_uid,
  u.role,
  u.colaborador_id,
  c.nome as colaborador_nome,
  c.empresa_id,
  e.nome_fantasia as empresa_nome
FROM app_users u
LEFT JOIN colaboradores c ON c.id = u.colaborador_id
LEFT JOIN empresas e ON e.id = c.empresa_id
ORDER BY u.created_at DESC;

-- 2. Ver usuários SEM colaborador_id (PROBLEMA!)
SELECT 
  id,
  auth_uid,
  role,
  colaborador_id
FROM app_users
WHERE colaborador_id IS NULL;

-- 3. Ver colaboradores SEM empresa_id (PROBLEMA!)
SELECT 
  id,
  nome,
  empresa_id
FROM colaboradores
WHERE empresa_id IS NULL;

-- 4. Ver registros de ponto do Samuel
SELECT 
  rp.id,
  rp.colaborador_id,
  rp.empresa_id,
  rp.data,
  rp.entrada_1,
  rp.status,
  c.nome as colaborador_nome
FROM registros_ponto rp
JOIN colaboradores c ON c.id = rp.colaborador_id
WHERE c.nome LIKE '%SAMUEL%'
ORDER BY rp.data DESC;

-- 5. Ver empresas disponíveis
SELECT id, nome_fantasia, razao_social
FROM empresas
LIMIT 5;
