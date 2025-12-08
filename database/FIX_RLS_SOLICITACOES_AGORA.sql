-- ============================================
-- FIX DEFINITIVO: ERRO 403 ALTERAÇÕES DE DADOS
-- ============================================

-- PROBLEMA: Silvana (admin) recebe 403 ao tentar acessar alterações
-- CAUSA: Políticas RLS muito restritivas
-- SOLUÇÃO: Criar políticas separadas para cada operação

-- PASSO 1: REMOVER TODAS AS POLÍTICAS ANTIGAS
DROP POLICY IF EXISTS "Admins podem atualizar solicitações" ON solicitacoes_alteracao_dados;
DROP POLICY IF EXISTS "service_role_solic_alt" ON solicitacoes_alteracao_dados;
DROP POLICY IF EXISTS "Admin pode aprovar solicitações" ON solicitacoes_alteracao_dados;
DROP POLICY IF EXISTS "Admins podem gerenciar solicitações" ON solicitacoes_alteracao_dados;
DROP POLICY IF EXISTS "Funcionários podem ver suas solicitações" ON solicitacoes_alteracao_dados;
DROP POLICY IF EXISTS "Funcionários podem criar solicitações" ON solicitacoes_alteracao_dados;

-- PASSO 2: CRIAR POLÍTICAS PARA ADMINS (SELECT, INSERT, UPDATE, DELETE)
CREATE POLICY "Admin SELECT solicitações"
ON solicitacoes_alteracao_dados
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM app_users
    WHERE app_users.auth_uid = auth.uid()
    AND app_users.role = 'admin'
  )
);

CREATE POLICY "Admin UPDATE solicitações"
ON solicitacoes_alteracao_dados
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM app_users
    WHERE app_users.auth_uid = auth.uid()
    AND app_users.role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM app_users
    WHERE app_users.auth_uid = auth.uid()
    AND app_users.role = 'admin'
  )
);

CREATE POLICY "Admin DELETE solicitações"
ON solicitacoes_alteracao_dados
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM app_users
    WHERE app_users.auth_uid = auth.uid()
    AND app_users.role = 'admin'
  )
);

-- PASSO 3: CRIAR POLÍTICAS PARA FUNCIONÁRIOS
CREATE POLICY "Funcionário SELECT suas solicitações"
ON solicitacoes_alteracao_dados
FOR SELECT
TO authenticated
USING (
  colaborador_id IN (
    SELECT id FROM colaboradores
    WHERE user_id IN (
      SELECT id FROM app_users
      WHERE auth_uid = auth.uid()
    )
  )
);

CREATE POLICY "Funcionário INSERT suas solicitações"
ON solicitacoes_alteracao_dados
FOR INSERT
TO authenticated
WITH CHECK (
  colaborador_id IN (
    SELECT id FROM colaboradores
    WHERE user_id IN (
      SELECT id FROM app_users
      WHERE auth_uid = auth.uid()
    )
  )
);

-- PASSO 4: VERIFICAR POLÍTICAS CRIADAS
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
WHERE tablename = 'solicitacoes_alteracao_dados'
ORDER BY cmd, policyname;

-- PASSO 5: TESTAR ACESSO
SELECT 
  'Teste de acesso' as teste,
  COUNT(*) as total_solicitacoes
FROM solicitacoes_alteracao_dados;

-- ============================================
-- PRONTO! EXECUTE ESTE SQL NO SUPABASE
-- ============================================
