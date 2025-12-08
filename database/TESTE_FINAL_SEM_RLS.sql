-- ============================================================================
-- TESTE FINAL: Desabilitar RLS temporariamente para testar
-- ============================================================================

-- Passo 1: Ver quantos registros existem
SELECT COUNT(*) as total FROM log_atividades;

-- Passo 2: Ver os registros diretamente (sem RLS)
SELECT 
  la.id,
  u.nome,
  u.email,
  la.tipo_acao,
  la.modulo,
  la.descricao,
  la.created_at
FROM log_atividades la
JOIN users u ON u.id = la.user_id
ORDER BY la.created_at DESC
LIMIT 10;

-- Passo 3: DESABILITAR RLS TEMPORARIAMENTE
ALTER TABLE log_atividades DISABLE ROW LEVEL SECURITY;

-- Passo 4: Testar a view SEM RLS
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
LIMIT 10;

-- ============================================================================
-- AGORA TESTE NO DASHBOARD:
-- 1. Vá para /admin
-- 2. Clique no botão de recarregar no widget
-- 3. Você DEVE ver as atividades agora
-- ============================================================================

-- ============================================================================
-- DEPOIS DO TESTE, REABILITE O RLS:
-- ALTER TABLE log_atividades ENABLE ROW LEVEL SECURITY;
-- ============================================================================
