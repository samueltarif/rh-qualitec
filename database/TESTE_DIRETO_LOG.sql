-- ============================================================================
-- TESTE DIRETO: Log de Atividades (SEM usar auth.uid())
-- Execute este SQL no Supabase SQL Editor
-- ============================================================================

-- Passo 1: Ver seus usuários
SELECT 'Seus usuários:' as info;
SELECT id, nome, email FROM users LIMIT 5;

-- Passo 2: Inserir atividade de teste DIRETAMENTE
-- (Substitua o user_id pelo ID de um usuário real da query acima)
INSERT INTO log_atividades (user_id, tipo_acao, modulo, descricao, detalhes)
SELECT 
  id,
  'create',
  'configuracoes',
  '🎯 TESTE DIRETO - Se você vê isso no dashboard, está funcionando!',
  '{"teste": true}'::jsonb
FROM users
LIMIT 1;

-- Passo 3: Ver se foi inserido
SELECT 'Atividade inserida:' as info;
SELECT * FROM log_atividades ORDER BY created_at DESC LIMIT 1;

-- Passo 4: Ver pela view
SELECT 'Pela view:' as info;
SELECT 
  nome,
  email,
  role,
  tipo_acao,
  modulo,
  descricao,
  created_at
FROM vw_atividades_recentes
ORDER BY created_at DESC
LIMIT 1;

-- Passo 5: Ver todas as atividades
SELECT 'Todas as atividades:' as info;
SELECT 
  nome,
  role,
  tipo_acao,
  modulo,
  descricao,
  created_at AT TIME ZONE 'America/Sao_Paulo' as horario_brasilia
FROM vw_atividades_recentes
ORDER BY created_at DESC
LIMIT 10;

-- ============================================================================
-- AGORA:
-- 1. Vá para o dashboard admin (/admin)
-- 2. Clique no botão de recarregar (🔄) no widget "Últimas Atividades"
-- 3. Você DEVE ver a atividade de teste: "🎯 TESTE DIRETO..."
-- ============================================================================

-- ============================================================================
-- SE NÃO APARECER NO DASHBOARD:
-- ============================================================================
-- Problema pode ser:
-- 1. RLS bloqueando (você não está logado como admin/gestor)
-- 2. Frontend não está buscando corretamente
-- 3. Cache do navegador
--
-- SOLUÇÃO:
-- - Faça logout e login novamente como admin
-- - Limpe o cache do navegador (Ctrl+Shift+Delete)
-- - Tente em aba anônima
-- ============================================================================
