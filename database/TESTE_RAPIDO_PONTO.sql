-- ============================================================================
-- TESTE RÁPIDO: Verificar configuração de Ponto
-- Execute no Supabase SQL Editor
-- ============================================================================

-- 1. Verificar se a tabela existe e tem RLS ativo
SELECT 
  tablename,
  rowsecurity as rls_ativo
FROM pg_tables
WHERE tablename = 'registros_ponto';

-- 2. Listar todas as políticas
SELECT 
  policyname,
  cmd as comando,
  roles as para_roles
FROM pg_policies
WHERE tablename = 'registros_ponto'
ORDER BY policyname;

-- 3. Verificar usuários e seus vínculos
SELECT 
  u.email,
  u.role,
  u.auth_uid,
  u.colaborador_id,
  c.nome as colaborador_nome,
  c.empresa_id,
  e.nome_fantasia as empresa
FROM app_users u
LEFT JOIN colaboradores c ON c.id = u.colaborador_id
LEFT JOIN empresas e ON e.id = c.empresa_id
ORDER BY u.created_at DESC
LIMIT 10;

-- 4. Verificar registros de ponto existentes
SELECT 
  rp.id,
  c.nome as colaborador,
  rp.data,
  rp.entrada_1,
  rp.saida_1,
  rp.entrada_2,
  rp.saida_2,
  rp.status,
  rp.created_at
FROM registros_ponto rp
JOIN colaboradores c ON c.id = rp.colaborador_id
ORDER BY rp.created_at DESC
LIMIT 10;

-- 5. Contar registros por colaborador
SELECT 
  c.nome,
  COUNT(rp.id) as total_registros
FROM colaboradores c
LEFT JOIN registros_ponto rp ON rp.colaborador_id = c.id
GROUP BY c.id, c.nome
ORDER BY total_registros DESC;

-- 6. Verificar se há colaboradores sem empresa
SELECT 
  id,
  nome,
  email,
  empresa_id
FROM colaboradores
WHERE empresa_id IS NULL;

-- 7. Verificar se há usuários sem colaborador (role funcionario)
SELECT 
  email,
  role,
  colaborador_id
FROM app_users
WHERE role = 'funcionario' AND colaborador_id IS NULL;

-- ============================================================================
-- RESULTADO ESPERADO:
-- ============================================================================
-- ✅ RLS deve estar ativo (true)
-- ✅ Deve ter 5 políticas criadas
-- ✅ Todos os usuários 'funcionario' devem ter colaborador_id
-- ✅ Todos os colaboradores devem ter empresa_id
-- ============================================================================
