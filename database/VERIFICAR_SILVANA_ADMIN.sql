-- ============================================
-- VERIFICAR SE SILVANA É ADMIN
-- ============================================

-- Ver dados de Silvana
SELECT 
  id,
  nome,
  email,
  role,
  ativo,
  auth_uid,
  created_at
FROM app_users
WHERE email ILIKE '%silvana%'
   OR nome ILIKE '%silvana%';

-- Se Silvana NÃO for admin, execute:
-- UPDATE app_users 
-- SET role = 'admin', ativo = true
-- WHERE email = 'silvana@qualitec.com.br';

-- Verificar políticas ativas
SELECT 
  policyname,
  cmd,
  qual::text as condicao
FROM pg_policies
WHERE tablename = 'solicitacoes_alteracao_dados'
ORDER BY cmd, policyname;
