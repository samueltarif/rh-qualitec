-- ============================================================================
-- FIX: Desabilitar RLS para solicitacoes_alteracao_dados
-- O RLS está bloqueando os inserts dos funcionários
-- ============================================================================

-- Remover políticas existentes
DROP POLICY IF EXISTS "service_role_solic_alt" ON solicitacoes_alteracao_dados;

-- Desabilitar RLS (mais simples e funcional)
ALTER TABLE solicitacoes_alteracao_dados DISABLE ROW LEVEL SECURITY;

-- OU se preferir manter RLS, use estas políticas:
-- ALTER TABLE solicitacoes_alteracao_dados ENABLE ROW LEVEL SECURITY;
-- 
-- -- Política para service_role (bypass total)
-- CREATE POLICY "service_role_all" ON solicitacoes_alteracao_dados
--   FOR ALL TO service_role USING (true) WITH CHECK (true);
-- 
-- -- Política para authenticated users poderem inserir
-- CREATE POLICY "authenticated_insert" ON solicitacoes_alteracao_dados
--   FOR INSERT TO authenticated WITH CHECK (true);
-- 
-- -- Política para authenticated users verem suas próprias solicitações
-- CREATE POLICY "authenticated_select_own" ON solicitacoes_alteracao_dados
--   FOR SELECT TO authenticated USING (
--     colaborador_id IN (
--       SELECT colaborador_id FROM app_users WHERE auth_uid = auth.uid()
--     )
--   );
