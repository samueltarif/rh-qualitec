-- =====================================================
-- VERIFICAÇÃO PÓS-MIGRAÇÃO UUID
-- =====================================================
-- Execute este script para verificar se tudo está ok
-- =====================================================

-- 1. Verificar tipo da coluna id em colaboradores
SELECT 
  '1️⃣ TIPO DA COLUNA ID' as verificacao,
  column_name, 
  data_type,
  CASE 
    WHEN data_type = 'uuid' THEN '✅ CORRETO'
    ELSE '❌ ERRO: Deveria ser UUID'
  END as status
FROM information_schema.columns 
WHERE table_name = 'colaboradores' 
  AND column_name = 'id';

-- 2. Verificar se IDs estão unificados
SELECT 
  '2️⃣ UNIFICAÇÃO DE IDs' as verificacao,
  c.id as colaborador_id,
  au.id as app_user_id,
  c.nome,
  CASE 
    WHEN c.id = au.id THEN '✅ UNIFICADO'
    ELSE '❌ DIFERENTE'
  END as status
FROM colaboradores c
INNER JOIN app_users au ON (
  LOWER(TRIM(au.email)) = LOWER(TRIM(c.email_pessoal))
  OR LOWER(TRIM(au.email)) = LOWER(TRIM(c.email_corporativo))
)
ORDER BY c.nome;

-- 3. Verificar foreign keys
SELECT 
  '3️⃣ FOREIGN KEYS' as verificacao,
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS references_table,
  tc.constraint_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND ccu.table_name = 'colaboradores'
ORDER BY tc.table_name;

-- 4. Verificar integridade dos dados
SELECT 
  '4️⃣ INTEGRIDADE DOS DADOS' as verificacao,
  'holerites' as tabela,
  COUNT(*) as total,
  COUNT(colaborador_id) as com_colaborador,
  COUNT(*) - COUNT(colaborador_id) as sem_colaborador
FROM holerites
UNION ALL
SELECT 
  '4️⃣ INTEGRIDADE DOS DADOS',
  'registros_ponto',
  COUNT(*),
  COUNT(colaborador_id),
  COUNT(*) - COUNT(colaborador_id)
FROM registros_ponto
UNION ALL
SELECT 
  '4️⃣ INTEGRIDADE DOS DADOS',
  'ferias',
  COUNT(*),
  COUNT(colaborador_id),
  COUNT(*) - COUNT(colaborador_id)
FROM ferias;

-- 5. Verificar RLS policies
SELECT 
  '5️⃣ RLS POLICIES' as verificacao,
  tablename,
  policyname,
  '✅ EXISTE' as status
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('colaboradores', 'holerites', 'registros_ponto', 'ferias')
ORDER BY tablename, policyname;

-- 6. Verificar views
SELECT 
  '6️⃣ VIEWS' as verificacao,
  table_name as view_name,
  '✅ EXISTE' as status
FROM information_schema.views
WHERE table_schema = 'public'
  AND table_name IN (
    'vw_colaboradores_completo',
    'vw_ferias_completo',
    'vw_aniversariantes',
    'vw_dashboard_kpis',
    'vw_pendencias_aprovacao'
  );

-- 7. Resumo final
SELECT 
  '🎉 RESUMO FINAL' as verificacao,
  (SELECT COUNT(*) FROM colaboradores) as total_colaboradores,
  (SELECT COUNT(*) FROM app_users) as total_usuarios,
  (SELECT COUNT(*) FROM holerites) as total_holerites,
  (SELECT COUNT(*) FROM registros_ponto) as total_registros_ponto;
