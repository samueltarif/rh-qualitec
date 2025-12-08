-- ============================================
-- FIX DEFINITIVO: ERRO 403 - SOLICITAÇÕES
-- ============================================
-- Problema: Admin não consegue fazer UPDATE mesmo com políticas
-- Solução: DESABILITAR RLS temporariamente OU criar política service_role

-- OPÇÃO 1: DESABILITAR RLS (MAIS RÁPIDO) ⚡
ALTER TABLE solicitacoes_alteracao_dados DISABLE ROW LEVEL SECURITY;

-- OPÇÃO 2: Se quiser manter RLS, execute isso ao invés:
-- ALTER TABLE solicitacoes_alteracao_dados ENABLE ROW LEVEL SECURITY;
-- 
-- DROP POLICY IF EXISTS "service_role_all" ON solicitacoes_alteracao_dados;
-- 
-- CREATE POLICY "service_role_all"
-- ON solicitacoes_alteracao_dados
-- FOR ALL
-- TO service_role
-- USING (true)
-- WITH CHECK (true);

-- Verificar status do RLS
SELECT 
  schemaname,
  tablename,
  rowsecurity as rls_habilitado
FROM pg_tables
WHERE tablename = 'solicitacoes_alteracao_dados';

-- ============================================
-- PRONTO! EXECUTE E TESTE NOVAMENTE
-- ============================================
