-- ============================================================================
-- VERIFICAR: Por que Samuel não vê seu holerite?
-- ============================================================================

-- 1. Verificar se o holerite existe
SELECT 
  id,
  colaborador_id,
  nome_colaborador,
  mes,
  ano,
  salario_liquido,
  status
FROM holerites
WHERE nome_colaborador ILIKE '%SAMUEL%';

-- 2. Verificar dados do Samuel
SELECT 
  id as colaborador_id,
  nome,
  user_id
FROM colaboradores
WHERE nome ILIKE '%SAMUEL%';

-- 3. Verificar app_user do Samuel
SELECT 
  id,
  auth_uid,
  colaborador_id,
  email,
  role
FROM app_users
WHERE email = 'samuel.tarif@gmail.com';

-- 4. Verificar se o colaborador_id está correto no holerite
SELECT 
  h.id as holerite_id,
  h.colaborador_id as holerite_colaborador_id,
  h.nome_colaborador,
  c.id as colaborador_real_id,
  c.nome as colaborador_nome,
  u.id as user_id,
  u.colaborador_id as user_colaborador_id,
  u.email
FROM holerites h
LEFT JOIN colaboradores c ON c.nome ILIKE '%SAMUEL%'
LEFT JOIN app_users u ON u.email = 'samuel.tarif@gmail.com'
WHERE h.nome_colaborador ILIKE '%SAMUEL%';

-- 5. Verificar políticas RLS
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'holerites';
