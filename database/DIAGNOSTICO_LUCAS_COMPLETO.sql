-- DIAGNÓSTICO COMPLETO DO LUCAS
-- Verificar se Lucas existe e está vinculado corretamente

-- 1. Verificar usuário Lucas no auth
SELECT 
  'AUTH USERS' as tabela,
  id,
  email,
  created_at
FROM auth.users 
WHERE email ILIKE '%lucas%' OR email = 'samuel.tarif@gmail.com';

-- 2. Verificar app_users
SELECT 
  'APP_USERS' as tabela,
  id,
  auth_uid,
  colaborador_id,
  nome,
  email
FROM app_users 
WHERE email ILIKE '%lucas%' OR auth_uid IN (
  SELECT id FROM auth.users WHERE email ILIKE '%lucas%' OR email = 'samuel.tarif@gmail.com'
);

-- 3. Verificar colaboradores
SELECT 
  'COLABORADORES' as tabela,
  id,
  nome,
  email,
  status
FROM colaboradores 
WHERE nome ILIKE '%lucas%' OR email ILIKE '%lucas%';

-- 4. Verificar registros de ponto do Lucas
SELECT 
  'REGISTROS_PONTO' as tabela,
  rp.id,
  rp.colaborador_id,
  c.nome as colaborador_nome,
  rp.data,
  rp.entrada,
  rp.saida
FROM registros_ponto rp
JOIN colaboradores c ON c.id = rp.colaborador_id
WHERE c.nome ILIKE '%lucas%'
ORDER BY rp.data DESC
LIMIT 5;

-- 5. Verificar assinaturas de ponto
SELECT 
  'ASSINATURAS_PONTO' as tabela,
  ap.id,
  ap.colaborador_id,
  c.nome as colaborador_nome,
  ap.mes,
  ap.ano,
  ap.data_assinatura
FROM assinaturas_ponto ap
JOIN colaboradores c ON c.id = ap.colaborador_id
WHERE c.nome ILIKE '%lucas%'
ORDER BY ap.data_assinatura DESC;