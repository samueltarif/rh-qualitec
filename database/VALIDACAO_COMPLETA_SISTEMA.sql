-- =====================================================
-- VALIDAÇÃO COMPLETA DO SISTEMA PÓS-MIGRAÇÃO
-- =====================================================
-- Execute este script para garantir que tudo está OK
-- =====================================================

\echo '🔍 INICIANDO VALIDAÇÃO COMPLETA...'
\echo ''

-- =====================================================
-- 1. ESTRUTURA DAS TABELAS
-- =====================================================
\echo '1️⃣ VALIDANDO ESTRUTURA DAS TABELAS'

SELECT 
  '📊 TIPO DO ID' as validacao,
  table_name as tabela,
  column_name as coluna,
  data_type as tipo,
  CASE 
    WHEN data_type = 'uuid' THEN '✅ CORRETO'
    ELSE '❌ ERRO: Deveria ser UUID'
  END as status
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name IN ('colaboradores', 'app_users')
  AND column_name = 'id';

-- =====================================================
-- 2. UNIFICAÇÃO DE IDs
-- =====================================================
\echo ''
\echo '2️⃣ VALIDANDO UNIFICAÇÃO DE IDs'

SELECT 
  '🔗 UNIFICAÇÃO' as validacao,
  COUNT(*) as total,
  COUNT(*) FILTER (WHERE c.id = au.id) as unificados,
  COUNT(*) FILTER (WHERE c.id != au.id) as diferentes,
  CASE 
    WHEN COUNT(*) FILTER (WHERE c.id != au.id) = 0 THEN '✅ TODOS UNIFICADOS'
    ELSE '❌ ERRO: IDs DIFERENTES'
  END as status
FROM colaboradores c
INNER JOIN app_users au ON (
  LOWER(TRIM(au.email)) = LOWER(TRIM(c.email_pessoal))
  OR LOWER(TRIM(au.email)) = LOWER(TRIM(c.email_corporativo))
);

-- =====================================================
-- 3. SINCRONIZAÇÃO DE NOMES
-- =====================================================
\echo ''
\echo '3️⃣ VALIDANDO SINCRONIZAÇÃO DE NOMES'

SELECT 
  '📝 NOMES' as validacao,
  COUNT(*) as total,
  COUNT(*) FILTER (WHERE c.nome = au.nome) as sincronizados,
  COUNT(*) FILTER (WHERE c.nome != au.nome) as diferentes,
  CASE 
    WHEN COUNT(*) FILTER (WHERE c.nome != au.nome) = 0 THEN '✅ TODOS SINCRONIZADOS'
    WHEN COUNT(*) FILTER (WHERE c.nome != au.nome) <= 2 THEN '⚠️ POUCOS DIFERENTES'
    ELSE '❌ MUITOS DIFERENTES'
  END as status
FROM colaboradores c
INNER JOIN app_users au ON c.id = au.id;

-- =====================================================
-- 4. FOREIGN KEYS
-- =====================================================
\echo ''
\echo '4️⃣ VALIDANDO FOREIGN KEYS'

SELECT 
  '🔗 FOREIGN KEYS' as validacao,
  COUNT(*) as total_fks,
  COUNT(*) FILTER (WHERE ccu.table_name = 'colaboradores') as fks_colaboradores,
  CASE 
    WHEN COUNT(*) FILTER (WHERE ccu.table_name = 'colaboradores') >= 20 THEN '✅ FKs CORRETAS'
    ELSE '⚠️ VERIFICAR FKs'
  END as status
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_schema = 'public'
  AND ccu.table_name = 'colaboradores';

-- =====================================================
-- 5. RLS POLICIES
-- =====================================================
\echo ''
\echo '5️⃣ VALIDANDO RLS POLICIES'

SELECT 
  '🔒 RLS POLICIES' as validacao,
  COUNT(*) as total_policies,
  COUNT(DISTINCT tablename) as tabelas_com_rls,
  CASE 
    WHEN COUNT(*) >= 10 THEN '✅ POLICIES ATIVAS'
    ELSE '⚠️ POUCAS POLICIES'
  END as status
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('colaboradores', 'holerites', 'registros_ponto', 'ferias');

-- =====================================================
-- 6. TRIGGERS
-- =====================================================
\echo ''
\echo '6️⃣ VALIDANDO TRIGGERS'

SELECT 
  '⚡ TRIGGERS' as validacao,
  trigger_name,
  event_object_table as tabela,
  CASE 
    WHEN trigger_name LIKE '%uuid%' THEN '✅ ATUALIZADO'
    WHEN trigger_name LIKE '%email%' THEN '⚠️ OBSOLETO'
    ELSE '❓ VERIFICAR'
  END as status
FROM information_schema.triggers
WHERE trigger_schema = 'public'
  AND trigger_name LIKE '%sync%';

-- =====================================================
-- 7. INTEGRIDADE DOS DADOS
-- =====================================================
\echo ''
\echo '7️⃣ VALIDANDO INTEGRIDADE DOS DADOS'

SELECT 
  '📊 INTEGRIDADE' as validacao,
  'holerites' as tabela,
  COUNT(*) as total,
  COUNT(colaborador_id) as com_fk,
  COUNT(*) - COUNT(colaborador_id) as sem_fk,
  CASE 
    WHEN COUNT(*) = COUNT(colaborador_id) THEN '✅ ÍNTEGRO'
    ELSE '❌ DADOS ÓRFÃOS'
  END as status
FROM holerites
UNION ALL
SELECT 
  '📊 INTEGRIDADE',
  'registros_ponto',
  COUNT(*),
  COUNT(colaborador_id),
  COUNT(*) - COUNT(colaborador_id),
  CASE 
    WHEN COUNT(*) = COUNT(colaborador_id) THEN '✅ ÍNTEGRO'
    ELSE '❌ DADOS ÓRFÃOS'
  END
FROM registros_ponto
UNION ALL
SELECT 
  '📊 INTEGRIDADE',
  'ferias',
  COUNT(*),
  COUNT(colaborador_id),
  COUNT(*) - COUNT(colaborador_id),
  CASE 
    WHEN COUNT(*) = COUNT(colaborador_id) THEN '✅ ÍNTEGRO'
    ELSE '❌ DADOS ÓRFÃOS'
  END
FROM ferias;

-- =====================================================
-- 8. VIEWS
-- =====================================================
\echo ''
\echo '8️⃣ VALIDANDO VIEWS'

SELECT 
  '👁️ VIEWS' as validacao,
  table_name as view_name,
  '✅ EXISTE' as status
FROM information_schema.views
WHERE table_schema = 'public'
  AND table_name IN (
    'vw_colaboradores_completo',
    'vw_ferias_completo',
    'vw_aniversariantes',
    'vw_dashboard_kpis'
  );

-- =====================================================
-- 9. ESTATÍSTICAS GERAIS
-- =====================================================
\echo ''
\echo '9️⃣ ESTATÍSTICAS GERAIS'

SELECT 
  '📈 ESTATÍSTICAS' as categoria,
  (SELECT COUNT(*) FROM colaboradores) as total_colaboradores,
  (SELECT COUNT(*) FROM app_users) as total_usuarios,
  (SELECT COUNT(*) FROM holerites) as total_holerites,
  (SELECT COUNT(*) FROM registros_ponto) as total_registros_ponto,
  (SELECT COUNT(*) FROM ferias) as total_ferias;

-- =====================================================
-- 10. RESUMO FINAL
-- =====================================================
\echo ''
\echo '🎯 RESUMO FINAL'

WITH validacoes AS (
  SELECT 
    CASE 
      WHEN (SELECT data_type FROM information_schema.columns 
            WHERE table_name = 'colaboradores' AND column_name = 'id') = 'uuid' 
      THEN 1 ELSE 0 
    END as estrutura_ok,
    CASE 
      WHEN (SELECT COUNT(*) FROM colaboradores c 
            INNER JOIN app_users au ON c.id = au.id) = 
           (SELECT COUNT(*) FROM colaboradores) 
      THEN 1 ELSE 0 
    END as ids_ok,
    CASE 
      WHEN (SELECT COUNT(*) FROM pg_policies 
            WHERE schemaname = 'public') >= 10 
      THEN 1 ELSE 0 
    END as rls_ok,
    CASE 
      WHEN (SELECT COUNT(*) FROM information_schema.table_constraints 
            WHERE constraint_type = 'FOREIGN KEY' 
            AND table_schema = 'public') >= 20 
      THEN 1 ELSE 0 
    END as fks_ok
)
SELECT 
  '🎉 RESULTADO' as categoria,
  CASE 
    WHEN estrutura_ok + ids_ok + rls_ok + fks_ok = 4 
    THEN '✅ SISTEMA 100% VALIDADO!'
    WHEN estrutura_ok + ids_ok + rls_ok + fks_ok >= 3 
    THEN '⚠️ SISTEMA OK COM RESSALVAS'
    ELSE '❌ SISTEMA COM PROBLEMAS'
  END as status,
  estrutura_ok as estrutura,
  ids_ok as unificacao,
  rls_ok as seguranca,
  fks_ok as integridade
FROM validacoes;

\echo ''
\echo '✅ VALIDAÇÃO COMPLETA FINALIZADA!'
\echo ''
\echo '📝 PRÓXIMOS PASSOS:'
\echo '1. Se houver nomes diferentes, execute: SINCRONIZAR_NOMES_DEFINITIVO.sql'
\echo '2. Se houver triggers obsoletos, execute: TRIGGER_SINCRONIZACAO_ATUALIZADO.sql'
\echo '3. Para limpar objetos antigos, execute: MARCAR_SCRIPTS_OBSOLETOS.sql'
\echo ''
