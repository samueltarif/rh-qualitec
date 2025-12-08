-- ============================================================================
-- DEBUG: Verificar colaboradores existentes e políticas RLS
-- Execute este SQL no Supabase SQL Editor
-- ============================================================================

-- 1. Ver TODOS os colaboradores (ignorando RLS temporariamente)
-- Execute como service_role ou admin
SELECT 
  id, 
  empresa_id, 
  nome, 
  cpf, 
  matricula, 
  email_corporativo,
  status,
  created_at
FROM colaboradores
ORDER BY created_at DESC
LIMIT 10;

-- 2. Verificar se há colaboradores sem empresa_id
SELECT COUNT(*) as sem_empresa_id
FROM colaboradores
WHERE empresa_id IS NULL;

-- 3. Verificar empresas existentes
SELECT id, razao_social, nome_fantasia, cnpj
FROM empresas
LIMIT 5;

-- 4. SOLUÇÃO: Se houver colaboradores órfãos (sem empresa_id), associá-los à primeira empresa
UPDATE colaboradores
SET empresa_id = (SELECT id FROM empresas LIMIT 1)
WHERE empresa_id IS NULL;

-- 5. SOLUÇÃO: Deletar colaboradores duplicados ou com problemas
-- CUIDADO: Isso vai deletar colaboradores! Verifique antes!
-- DELETE FROM colaboradores WHERE cpf = 'SEU_CPF_AQUI';

-- ============================================================================
-- VERIFICAR POLÍTICAS RLS ATIVAS
-- ============================================================================

-- Ver políticas da tabela colaboradores
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
WHERE tablename = 'colaboradores';

-- ============================================================================
-- RECRIAR POLÍTICAS RLS CORRETAS (se necessário)
-- ============================================================================

-- Remover políticas antigas conflitantes
DROP POLICY IF EXISTS "colaborador_view_self" ON colaboradores;
DROP POLICY IF EXISTS "gestor_view_team" ON colaboradores;
DROP POLICY IF EXISTS "admin_view_colaboradores" ON colaboradores;
DROP POLICY IF EXISTS "admin_manage_colaboradores" ON colaboradores;
DROP POLICY IF EXISTS "admin_update_colaboradores" ON colaboradores;
DROP POLICY IF EXISTS "admin_delete_colaboradores" ON colaboradores;
DROP POLICY IF EXISTS "colaboradores_select_own" ON colaboradores;
DROP POLICY IF EXISTS "app_colaboradores_select" ON colaboradores;
DROP POLICY IF EXISTS "app_employee_view_own" ON colaboradores;

-- Criar política simples: Admin vê tudo
CREATE POLICY "admin_full_access_colaboradores" ON colaboradores
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM app_users 
      WHERE auth_uid = auth.uid() 
      AND role = 'admin'
      AND ativo = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM app_users 
      WHERE auth_uid = auth.uid() 
      AND role = 'admin'
      AND ativo = true
    )
  );

-- Funcionário vê apenas seu próprio registro
CREATE POLICY "employee_view_own_colaborador" ON colaboradores
  FOR SELECT
  TO authenticated
  USING (
    id = (
      SELECT colaborador_id FROM app_users 
      WHERE auth_uid = auth.uid() 
      AND ativo = true
    )
  );

-- ============================================================================
-- TESTE: Verificar se consegue ver colaboradores agora
-- ============================================================================

SELECT 
  id, 
  nome, 
  cpf, 
  email_corporativo,
  status
FROM colaboradores
ORDER BY created_at DESC
LIMIT 5;
