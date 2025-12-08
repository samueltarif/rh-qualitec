-- ============================================================================
-- TESTE RÁPIDO: Log de Atividades
-- Execute este SQL no Supabase SQL Editor
-- ============================================================================

-- Passo 1: Verificar se tudo existe
SELECT 
  EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'log_atividades') as tem_tabela,
  EXISTS (SELECT FROM information_schema.views WHERE table_name = 'vw_atividades_recentes') as tem_view,
  EXISTS (SELECT FROM pg_proc WHERE proname = 'fn_registrar_atividade') as tem_funcao;

-- Passo 2: Ver quantos registros existem
SELECT COUNT(*) as total_atividades FROM log_atividades;

-- Passo 3: Ver últimas 10 atividades
SELECT 
  nome,
  role,
  tipo_acao,
  modulo,
  descricao,
  created_at,
  created_at AT TIME ZONE 'America/Sao_Paulo' as horario_brasilia
FROM vw_atividades_recentes
ORDER BY created_at DESC
LIMIT 10;

-- Passo 4: Inserir atividade de teste
SELECT fn_registrar_atividade(
  'create',
  'configuracoes',
  '🎯 TESTE - Se você vê isso no dashboard, está funcionando!',
  '{"teste": true}'::jsonb
) as id_atividade_teste;

-- Passo 5: Ver a atividade de teste
SELECT 
  nome,
  email,
  role,
  tipo_acao,
  descricao,
  created_at
FROM vw_atividades_recentes
WHERE descricao LIKE '%TESTE%'
ORDER BY created_at DESC
LIMIT 1;

-- ============================================================================
-- RESULTADO ESPERADO:
-- ============================================================================
-- Passo 1: tem_tabela=true, tem_view=true, tem_funcao=true
-- Passo 2: Número >= 0
-- Passo 3: Lista de atividades (pode estar vazia)
-- Passo 4: Retorna um UUID
-- Passo 5: Mostra a atividade de teste com seu nome
-- ============================================================================

-- ============================================================================
-- AGORA:
-- 1. Vá para o dashboard admin (/admin)
-- 2. Clique no botão de recarregar (🔄) no widget "Últimas Atividades"
-- 3. Você DEVE ver a atividade de teste: "🎯 TESTE - Se você vê isso..."
-- ============================================================================
