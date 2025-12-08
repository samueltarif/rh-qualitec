-- ============================================================================
-- VER TODOS OS USUÁRIOS DO SISTEMA
-- Execute no Supabase SQL Editor
-- ============================================================================

-- 1. Usuários completos (auth + app_users + colaborador)
SELECT 
  au.email as email_login,
  u.role,
  u.ativo,
  u.colaborador_id,
  c.nome as colaborador_nome,
  c.empresa_id,
  au.created_at as criado_em,
  au.last_sign_in_at as ultimo_login
FROM auth.users au
LEFT JOIN app_users u ON u.auth_uid = au.id
LEFT JOIN colaboradores c ON c.id = u.colaborador_id
ORDER BY au.created_at DESC;

-- 2. Contar usuários por tipo
SELECT 
  COALESCE(u.role, 'sem_vinculo') as tipo,
  COUNT(*) as total
FROM auth.users au
LEFT JOIN app_users u ON u.auth_uid = au.id
GROUP BY u.role;

-- 3. Usuários que podem fazer login
SELECT 
  au.email,
  u.role,
  CASE 
    WHEN u.ativo = true THEN '✅ Ativo'
    WHEN u.ativo = false THEN '❌ Inativo'
    ELSE '⚠️ Sem vínculo'
  END as status
FROM auth.users au
LEFT JOIN app_users u ON u.auth_uid = au.id
ORDER BY u.ativo DESC NULLS LAST, au.email;

-- ============================================================================
-- RESULTADO ESPERADO:
-- ============================================================================
-- Você deve ver pelo menos 1 usuário com:
-- - email_login: seu email
-- - role: 'admin' ou 'funcionario'
-- - ativo: true
-- - Se funcionario: colaborador_id preenchido
-- ============================================================================
