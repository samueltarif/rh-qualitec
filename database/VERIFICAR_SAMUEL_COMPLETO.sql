-- ============================================================================
-- VERIFICAR DADOS COMPLETOS DO SAMUEL
-- Execute no Supabase SQL Editor
-- ============================================================================

-- 1. Dados do Samuel em auth.users
SELECT 
  id as auth_uid,
  email,
  created_at,
  last_sign_in_at
FROM auth.users
WHERE email = 'samuel.tarif@gmail.com';

-- 2. Dados do Samuel em app_users
SELECT 
  id as app_user_id,
  auth_uid,
  role,
  colaborador_id,
  ativo
FROM app_users
WHERE auth_uid = (SELECT id FROM auth.users WHERE email = 'samuel.tarif@gmail.com');

-- 3. Dados do colaborador vinculado
SELECT 
  c.id as colaborador_id,
  c.nome,
  c.cpf,
  c.empresa_id,
  e.nome_fantasia as empresa_nome,
  c.status
FROM colaboradores c
LEFT JOIN empresas e ON e.id = c.empresa_id
WHERE c.id = (
  SELECT colaborador_id 
  FROM app_users 
  WHERE auth_uid = (SELECT id FROM auth.users WHERE email = 'samuel.tarif@gmail.com')
);

-- 4. Registros de ponto do Samuel
SELECT 
  rp.id,
  rp.data,
  rp.entrada_1,
  rp.saida_1,
  rp.entrada_2,
  rp.saida_2,
  rp.status,
  rp.created_at
FROM registros_ponto rp
WHERE rp.colaborador_id = (
  SELECT colaborador_id 
  FROM app_users 
  WHERE auth_uid = (SELECT id FROM auth.users WHERE email = 'samuel.tarif@gmail.com')
)
ORDER BY rp.data DESC
LIMIT 10;

-- 5. DIAGNÓSTICO: O que está faltando?
SELECT 
  CASE 
    WHEN NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'samuel.tarif@gmail.com') 
    THEN '❌ Usuário não existe em auth.users'
    
    WHEN NOT EXISTS (
      SELECT 1 FROM app_users 
      WHERE auth_uid = (SELECT id FROM auth.users WHERE email = 'samuel.tarif@gmail.com')
    )
    THEN '❌ Usuário não existe em app_users'
    
    WHEN (
      SELECT colaborador_id FROM app_users 
      WHERE auth_uid = (SELECT id FROM auth.users WHERE email = 'samuel.tarif@gmail.com')
    ) IS NULL
    THEN '❌ app_users.colaborador_id está NULL'
    
    WHEN NOT EXISTS (
      SELECT 1 FROM colaboradores 
      WHERE id = (
        SELECT colaborador_id FROM app_users 
        WHERE auth_uid = (SELECT id FROM auth.users WHERE email = 'samuel.tarif@gmail.com')
      )
    )
    THEN '❌ Colaborador não existe'
    
    WHEN (
      SELECT empresa_id FROM colaboradores 
      WHERE id = (
        SELECT colaborador_id FROM app_users 
        WHERE auth_uid = (SELECT id FROM auth.users WHERE email = 'samuel.tarif@gmail.com')
      )
    ) IS NULL
    THEN '❌ colaboradores.empresa_id está NULL'
    
    ELSE '✅ Tudo OK! Samuel tem todos os vínculos corretos'
  END as diagnostico;

-- ============================================================================
-- RESULTADO ESPERADO:
-- ============================================================================
-- Todas as queries devem retornar dados
-- O diagnóstico deve ser: ✅ Tudo OK!
-- Se alguma query não retornar dados, esse é o problema!
-- ============================================================================
