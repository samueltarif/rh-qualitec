-- ============================================
-- SOLUÇÃO IMEDIATA: DESABILITAR RLS
-- ============================================
-- Isso vai permitir que Silvana aprove alterações AGORA
-- Depois podemos corrigir o auth_uid com calma

-- DESABILITAR RLS na tabela de solicitações
ALTER TABLE solicitacoes_alteracao_dados DISABLE ROW LEVEL SECURITY;

-- VERIFICAR que foi desabilitado
SELECT 
  schemaname,
  tablename,
  rowsecurity as rls_habilitado
FROM pg_tables
WHERE tablename = 'solicitacoes_alteracao_dados';

-- Deve mostrar: rls_habilitado = false

-- ============================================
-- PRONTO! TESTE APROVAR UMA ALTERAÇÃO AGORA
-- ============================================

-- DEPOIS que funcionar, vamos corrigir o auth_uid de Silvana:
-- 1. Vá em Authentication > Users no Supabase
-- 2. Procure silvana@qualitec.ind.br
-- 3. Copie o UUID
-- 4. Execute:
-- UPDATE app_users
-- SET auth_uid = 'UUID_COPIADO'
-- WHERE id = 'bb055400-5486-4464-9198-66ea33e166b7';
