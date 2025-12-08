-- ============================================================================
-- DIAGNÓSTICO: Sistema de Log de Atividades
-- ============================================================================

-- 1. Verificar se a tabela existe
SELECT 'Verificando tabela log_atividades...' as etapa;
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'log_atividades'
) as tabela_existe;

-- 2. Verificar se a view existe
SELECT 'Verificando view vw_atividades_recentes...' as etapa;
SELECT EXISTS (
  SELECT FROM information_schema.views 
  WHERE table_schema = 'public' 
  AND table_name = 'vw_atividades_recentes'
) as view_existe;

-- 3. Verificar se a função existe
SELECT 'Verificando função fn_registrar_atividade...' as etapa;
SELECT EXISTS (
  SELECT FROM pg_proc 
  WHERE proname = 'fn_registrar_atividade'
) as funcao_existe;

-- 4. Contar registros na tabela
SELECT 'Contando registros...' as etapa;
SELECT COUNT(*) as total_atividades FROM log_atividades;

-- 5. Ver últimas 5 atividades (se existirem)
SELECT 'Últimas 5 atividades...' as etapa;
SELECT 
  id,
  user_id,
  tipo_acao,
  modulo,
  descricao,
  created_at
FROM log_atividades
ORDER BY created_at DESC
LIMIT 5;

-- 6. Verificar view com dados
SELECT 'Testando view...' as etapa;
SELECT 
  id,
  nome,
  email,
  role,
  tipo_acao,
  modulo,
  descricao,
  created_at
FROM vw_atividades_recentes
LIMIT 5;

-- 7. Testar função manualmente
SELECT 'Testando função fn_registrar_atividade...' as etapa;
SELECT fn_registrar_atividade(
  'create',
  'configuracoes',
  'Teste de diagnóstico do sistema de log',
  '{"teste": true}'::jsonb
) as resultado_teste;

-- 8. Ver o registro de teste criado
SELECT 'Verificando registro de teste...' as etapa;
SELECT * FROM vw_atividades_recentes 
WHERE descricao LIKE '%diagnóstico%'
ORDER BY created_at DESC
LIMIT 1;

-- ============================================================================
-- RESULTADO ESPERADO:
-- ============================================================================
-- Se tudo estiver OK, você deve ver:
-- ✅ tabela_existe = true
-- ✅ view_existe = true
-- ✅ funcao_existe = true
-- ✅ total_atividades >= 0
-- ✅ Últimas atividades listadas
-- ✅ View funcionando
-- ✅ Função retorna UUID
-- ✅ Registro de teste aparece
-- ============================================================================
