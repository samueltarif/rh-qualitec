-- ============================================
-- FIX CIRÚRGICO: RLS SOLICITAÇÕES
-- ============================================
-- Problema: Políticas RLS não estão funcionando para UPDATE
-- Causa: A verificação do admin pode estar falhando
-- Solução: Simplificar as políticas

-- PASSO 1: REMOVER TODAS AS POLÍTICAS
DROP POLICY IF EXISTS "Admin SELECT solicitações" ON solicitacoes_alteracao_dados;
DROP POLICY IF EXISTS "Admin UPDATE solicitações" ON solicitacoes_alteracao_dados;
DROP POLICY IF EXISTS "Admin DELETE solicitações" ON solicitacoes_alteracao_dados;
DROP POLICY IF EXISTS "Funcionário SELECT suas solicitações" ON solicitacoes_alteracao_dados;
DROP POLICY IF EXISTS "Funcionário INSERT suas solicitações" ON solicitacoes_alteracao_dados;

-- PASSO 2: CRIAR POLÍTICA SIMPLES PARA ADMINS (TODAS OPERAÇÕES)
CREATE POLICY "admin_all_solicitacoes"
ON solicitacoes_alteracao_dados
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 
    FROM app_users
    WHERE app_users.auth_uid = auth.uid()
    AND app_users.role IN ('admin', 'gestor')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 
    FROM app_users
    WHERE app_users.auth_uid = auth.uid()
    AND app_users.role IN ('admin', 'gestor')
  )
);

-- PASSO 3: CRIAR POLÍTICA PARA FUNCIONÁRIOS (SELECT E INSERT)
CREATE POLICY "funcionario_suas_solicitacoes"
ON solicitacoes_alteracao_dados
FOR SELECT
TO authenticated
USING (
  colaborador_id IN (
    SELECT c.id 
    FROM colaboradores c
    INNER JOIN app_users u ON c.user_id = u.id
    WHERE u.auth_uid = auth.uid()
  )
);

CREATE POLICY "funcionario_criar_solicitacoes"
ON solicitacoes_alteracao_dados
FOR INSERT
TO authenticated
WITH CHECK (
  colaborador_id IN (
    SELECT c.id 
    FROM colaboradores c
    INNER JOIN app_users u ON c.user_id = u.id
    WHERE u.auth_uid = auth.uid()
  )
);

-- PASSO 4: VERIFICAR POLÍTICAS
SELECT 
  policyname,
  cmd,
  roles
FROM pg_policies
WHERE tablename = 'solicitacoes_alteracao_dados'
ORDER BY policyname;

-- PASSO 5: TESTAR SE SILVANA É ADMIN
SELECT 
  u.id,
  u.nome,
  u.email,
  u.role,
  u.auth_uid,
  auth.uid() as current_auth_uid,
  CASE 
    WHEN u.auth_uid = auth.uid() THEN '✅ MATCH'
    ELSE '❌ NO MATCH'
  END as status
FROM app_users u
WHERE u.email ILIKE '%silvana%';

-- ============================================
-- EXECUTE E TESTE NOVAMENTE
-- ============================================
