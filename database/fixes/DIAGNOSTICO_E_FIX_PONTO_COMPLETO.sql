-- ============================================================================
-- DIAGNÓSTICO E FIX COMPLETO: Sistema de Ponto
-- Execute este SQL no Supabase SQL Editor
-- ============================================================================

-- PARTE 1: DIAGNÓSTICO
-- ============================================================================

-- 1. Verificar se a tabela existe
SELECT 
  table_name, 
  table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name = 'registros_ponto';

-- 2. Verificar estrutura da tabela
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'registros_ponto'
ORDER BY ordinal_position;

-- 3. Verificar se RLS está ativo
SELECT 
  schemaname, 
  tablename, 
  rowsecurity
FROM pg_tables
WHERE tablename = 'registros_ponto';

-- 4. Verificar políticas RLS existentes
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
WHERE tablename = 'registros_ponto'
ORDER BY policyname;

-- 5. Verificar dados de teste (usando auth.users)
SELECT 
  au.email,
  u.role,
  u.colaborador_id,
  c.nome as colaborador_nome,
  c.empresa_id
FROM app_users u
LEFT JOIN auth.users au ON au.id = u.auth_uid
LEFT JOIN colaboradores c ON c.id = u.colaborador_id
WHERE au.email LIKE '%samuel%' OR au.email LIKE '%teste%'
LIMIT 5;

-- 6. Verificar registros de ponto existentes
SELECT 
  rp.id,
  rp.empresa_id,
  rp.colaborador_id,
  c.nome as colaborador_nome,
  rp.data,
  rp.entrada_1,
  rp.saida_1,
  rp.entrada_2,
  rp.saida_2,
  rp.status
FROM registros_ponto rp
LEFT JOIN colaboradores c ON c.id = rp.colaborador_id
ORDER BY rp.data DESC
LIMIT 10;

-- ============================================================================
-- PARTE 2: FIX - REMOVER POLÍTICAS ANTIGAS
-- ============================================================================

-- Remover TODAS as políticas antigas
DROP POLICY IF EXISTS "funcionarios_view_own_ponto" ON registros_ponto;
DROP POLICY IF EXISTS "funcionarios_insert_own_ponto" ON registros_ponto;
DROP POLICY IF EXISTS "funcionarios_update_own_ponto" ON registros_ponto;
DROP POLICY IF EXISTS "admins_all_ponto" ON registros_ponto;
DROP POLICY IF EXISTS "service_role_ponto" ON registros_ponto;
DROP POLICY IF EXISTS "users_select_ponto" ON registros_ponto;
DROP POLICY IF EXISTS "users_insert_ponto" ON registros_ponto;
DROP POLICY IF EXISTS "users_update_ponto" ON registros_ponto;
DROP POLICY IF EXISTS "users_delete_ponto" ON registros_ponto;
DROP POLICY IF EXISTS "admins_rh_all_ponto" ON registros_ponto;
DROP POLICY IF EXISTS "admins_rh_gestores_all_ponto" ON registros_ponto;

-- ============================================================================
-- PARTE 3: FIX - CRIAR POLÍTICAS CORRETAS
-- ============================================================================

-- 1. Service role tem acesso total (SEMPRE PRIMEIRO)
CREATE POLICY "service_role_ponto" ON registros_ponto
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- 2. Admins, RH e Gestores podem fazer TUDO
CREATE POLICY "admins_rh_gestores_all_ponto" ON registros_ponto
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM app_users
      WHERE auth_uid = auth.uid()
      AND role IN ('admin', 'rh', 'gestor')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM app_users
      WHERE auth_uid = auth.uid()
      AND role IN ('admin', 'rh', 'gestor')
    )
  );

-- 3. Funcionários podem VER seus próprios registros
CREATE POLICY "funcionarios_view_own_ponto" ON registros_ponto
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM app_users
      WHERE auth_uid = auth.uid()
      AND colaborador_id = registros_ponto.colaborador_id
      AND role = 'funcionario'
    )
  );

-- 4. Funcionários podem INSERIR seus próprios registros
CREATE POLICY "funcionarios_insert_own_ponto" ON registros_ponto
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM app_users
      WHERE auth_uid = auth.uid()
      AND colaborador_id = registros_ponto.colaborador_id
      AND role = 'funcionario'
    )
  );

-- 5. Funcionários podem ATUALIZAR seus próprios registros (apenas hoje)
CREATE POLICY "funcionarios_update_own_ponto" ON registros_ponto
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM app_users
      WHERE auth_uid = auth.uid()
      AND colaborador_id = registros_ponto.colaborador_id
      AND role = 'funcionario'
    )
    AND registros_ponto.data = CURRENT_DATE
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM app_users
      WHERE auth_uid = auth.uid()
      AND colaborador_id = registros_ponto.colaborador_id
      AND role = 'funcionario'
    )
    AND registros_ponto.data = CURRENT_DATE
  );

-- ============================================================================
-- PARTE 4: GARANTIR QUE RLS ESTÁ ATIVO
-- ============================================================================

ALTER TABLE registros_ponto ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- PARTE 5: VERIFICAÇÃO FINAL
-- ============================================================================

-- Verificar políticas criadas
SELECT 
  policyname, 
  cmd, 
  roles,
  CASE 
    WHEN qual IS NOT NULL THEN 'Tem USING'
    ELSE 'Sem USING'
  END as using_clause,
  CASE 
    WHEN with_check IS NOT NULL THEN 'Tem WITH CHECK'
    ELSE 'Sem WITH CHECK'
  END as check_clause
FROM pg_policies
WHERE tablename = 'registros_ponto'
ORDER BY policyname;

-- Contar registros (deve funcionar para admins)
SELECT COUNT(*) as total_registros FROM registros_ponto;

-- ============================================================================
-- MENSAGEM FINAL
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '✅ FIX COMPLETO EXECUTADO!';
  RAISE NOTICE '';
  RAISE NOTICE '📋 Próximos passos:';
  RAISE NOTICE '1. Verifique os resultados acima';
  RAISE NOTICE '2. Reinicie o servidor Nuxt (Ctrl+C e npm run dev)';
  RAISE NOTICE '3. Teste o registro de ponto como funcionário';
  RAISE NOTICE '4. Teste a visualização de ponto como admin';
  RAISE NOTICE '';
  RAISE NOTICE '🔍 Se ainda houver erro:';
  RAISE NOTICE '- Verifique se o usuário tem colaborador_id preenchido';
  RAISE NOTICE '- Verifique se o colaborador tem empresa_id preenchido';
  RAISE NOTICE '- Verifique os logs do servidor para detalhes do erro';
END $$;
