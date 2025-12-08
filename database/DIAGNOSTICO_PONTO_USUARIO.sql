-- ============================================================================
-- DIAGNÓSTICO: Por que não consigo bater ponto
-- ============================================================================

-- 1. Verificar se colaborador_id está preenchido
SELECT 
  u.id as app_user_id,
  u.auth_uid,
  u.nome as usuario_nome,
  u.email,
  u.role,
  u.colaborador_id,
  c.id as colaborador_id_real,
  c.nome as colaborador_nome,
  c.empresa_id
FROM app_users u
LEFT JOIN colaboradores c ON c.id = u.colaborador_id
WHERE u.role = 'funcionario'
ORDER BY u.nome;

-- 2. Verificar políticas RLS de registros_ponto
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE tablename = 'registros_ponto'
ORDER BY policyname;

-- 3. Testar acesso para um usuário específico
-- (substitua o email)
SELECT 
  'Teste de acesso' as teste,
  u.nome,
  u.email,
  u.colaborador_id,
  c.nome as colaborador,
  c.empresa_id,
  COUNT(rp.id) as total_registros_ponto
FROM app_users u
LEFT JOIN colaboradores c ON c.id = u.colaborador_id
LEFT JOIN registros_ponto rp ON rp.colaborador_id = u.colaborador_id
WHERE u.email = 'samuel@qualitec.ind.br' -- ALTERE AQUI
GROUP BY u.id, u.nome, u.email, u.colaborador_id, c.nome, c.empresa_id;

-- ============================================================================
-- RESULTADO ESPERADO:
-- ✅ colaborador_id deve estar preenchido
-- ✅ colaborador deve ter empresa_id
-- ✅ Políticas RLS devem permitir INSERT/SELECT via colaborador_id
-- ============================================================================
