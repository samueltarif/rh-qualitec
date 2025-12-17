-- DIAGNÓSTICO COMPLETO - EMPRESA_ID E VINCULAÇÕES
-- Verificar se a remoção do empresa_id afetou as autenticações

-- 1. Verificar estrutura atual da tabela app_users
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'app_users'
ORDER BY ordinal_position;

-- 2. Verificar usuários sem empresa_id (se ainda existe a coluna)
SELECT 
  'APP_USERS SEM EMPRESA_ID' as status,
  COUNT(*) as total
FROM app_users 
WHERE empresa_id IS NULL;

-- 3. Verificar colaboradores sem empresa_id
SELECT 
  'COLABORADORES SEM EMPRESA_ID' as status,
  COUNT(*) as total
FROM colaboradores 
WHERE empresa_id IS NULL;

-- 4. Verificar vínculos auth_uid → app_users → colaboradores
SELECT 
  'VINCULOS COMPLETOS' as tipo,
  au.id as app_user_id,
  au.auth_uid,
  au.colaborador_id,
  au.nome as app_user_nome,
  c.id as colaborador_real_id,
  c.nome as colaborador_nome,
  c.empresa_id as colaborador_empresa_id,
  CASE 
    WHEN au.colaborador_id IS NULL THEN 'SEM_COLABORADOR_ID'
    WHEN c.id IS NULL THEN 'COLABORADOR_NAO_EXISTE'
    WHEN c.empresa_id IS NULL THEN 'SEM_EMPRESA_ID'
    ELSE 'OK'
  END as status_vinculo
FROM app_users au
LEFT JOIN colaboradores c ON c.id = au.colaborador_id
WHERE au.auth_uid IS NOT NULL
ORDER BY au.nome;

-- 5. Verificar usuários auth sem app_users
SELECT 
  'AUTH_USERS SEM APP_USERS' as tipo,
  auth.id as auth_uid,
  auth.email,
  auth.created_at
FROM auth.users auth
LEFT JOIN app_users au ON au.auth_uid = auth.id
WHERE au.id IS NULL
AND auth.email NOT LIKE '%@supabase%'
ORDER BY auth.created_at DESC;

-- 6. Verificar colaboradores sem auth_uid
SELECT 
  'COLABORADORES SEM AUTH' as tipo,
  c.id,
  c.nome,
  c.email,
  c.auth_uid,
  c.empresa_id
FROM colaboradores c
LEFT JOIN app_users au ON au.colaborador_id = c.id
WHERE au.id IS NULL
ORDER BY c.nome;

-- 7. Verificar empresa padrão
SELECT 
  'EMPRESA_PADRAO' as tipo,
  id,
  nome,
  created_at
FROM empresas 
ORDER BY created_at ASC
LIMIT 1;

-- 8. Verificar registros de ponto sem empresa_id (se RLS estiver ativo)
SELECT 
  'REGISTROS_PONTO' as tipo,
  COUNT(*) as total_registros,
  COUNT(DISTINCT rp.colaborador_id) as colaboradores_distintos
FROM registros_ponto rp
JOIN colaboradores c ON c.id = rp.colaborador_id
WHERE c.empresa_id IS NOT NULL;

-- 9. Verificar assinaturas_ponto
SELECT 
  'ASSINATURAS_PONTO' as tipo,
  COUNT(*) as total_assinaturas,
  COUNT(DISTINCT ap.colaborador_id) as colaboradores_com_assinatura
FROM assinaturas_ponto ap
JOIN colaboradores c ON c.id = ap.colaborador_id
WHERE c.empresa_id IS NOT NULL;