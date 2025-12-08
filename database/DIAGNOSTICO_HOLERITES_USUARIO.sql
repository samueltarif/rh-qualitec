-- ============================================================================
-- DIAGNÓSTICO: Por que holerites não aparecem no perfil do usuário
-- ============================================================================

-- 1. Verificar estrutura de relacionamento
SELECT 
  'Estrutura app_users' as tabela,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'app_users'
  AND column_name IN ('id', 'auth_uid', 'colaborador_id', 'user_id')
ORDER BY ordinal_position;

-- 2. Verificar estrutura de colaboradores
SELECT 
  'Estrutura colaboradores' as tabela,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'colaboradores'
  AND column_name IN ('id', 'user_id', 'nome', 'email_corporativo')
ORDER BY ordinal_position;

-- 3. Ver usuários e seus vínculos
SELECT 
  u.id as app_user_id,
  u.auth_uid,
  u.nome as usuario_nome,
  u.email as usuario_email,
  u.role,
  u.colaborador_id as colaborador_id_direto,
  c1.id as colaborador_via_colaborador_id,
  c1.nome as colaborador_nome_direto,
  c2.id as colaborador_via_user_id,
  c2.nome as colaborador_nome_user_id
FROM app_users u
LEFT JOIN colaboradores c1 ON c1.id = u.colaborador_id
LEFT JOIN colaboradores c2 ON c2.user_id = u.id
WHERE u.role = 'funcionario'
ORDER BY u.nome;

-- 4. Ver holerites existentes
SELECT 
  h.id,
  h.colaborador_id,
  h.nome_colaborador,
  h.mes,
  h.ano,
  h.tipo,
  h.salario_liquido,
  c.nome as nome_colaborador_atual,
  c.user_id as colaborador_user_id
FROM holerites h
LEFT JOIN colaboradores c ON c.id = h.colaborador_id
ORDER BY h.ano DESC, h.mes DESC
LIMIT 10;

-- 5. Verificar se colaborador_id está preenchido em app_users
SELECT 
  COUNT(*) FILTER (WHERE colaborador_id IS NOT NULL) as com_colaborador_id,
  COUNT(*) FILTER (WHERE colaborador_id IS NULL) as sem_colaborador_id,
  COUNT(*) as total
FROM app_users
WHERE role = 'funcionario';

-- 6. Verificar políticas RLS da tabela holerites
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
WHERE tablename = 'holerites'
ORDER BY policyname;

-- 7. Teste de acesso: simular busca de holerites para um usuário específico
-- (substitua o email pelo usuário que está testando)
SELECT 
  'Teste de acesso para usuário' as teste,
  u.nome as usuario,
  u.email,
  u.colaborador_id,
  COUNT(h.id) as total_holerites
FROM app_users u
LEFT JOIN holerites h ON h.colaborador_id = u.colaborador_id
WHERE u.email = 'samuel@qualitec.ind.br' -- ALTERE AQUI
GROUP BY u.id, u.nome, u.email, u.colaborador_id;

-- ============================================================================
-- RESULTADO ESPERADO:
-- - app_users deve ter coluna colaborador_id
-- - colaborador_id deve estar preenchido para funcionários
-- - holerites devem ter colaborador_id correspondente
-- - Políticas RLS devem permitir acesso via colaborador_id
-- ============================================================================
