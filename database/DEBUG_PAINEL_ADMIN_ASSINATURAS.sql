-- DEBUG COMPLETO: PAINEL ADMIN NÃO MOSTRA ASSINATURAS
-- Problema: Assinaturas existem mas não aparecem no painel admin

-- 1. Verificar se as assinaturas existem
SELECT 
  'Assinaturas Existentes' as info,
  COUNT(*) as total
FROM assinaturas_ponto;

-- 2. Ver todas as assinaturas com detalhes
SELECT 
  'Detalhes Assinaturas' as info,
  ap.id,
  ap.colaborador_id,
  c.nome as colaborador_nome,
  ap.mes,
  ap.ano,
  ap.data_assinatura,
  ap.created_at
FROM assinaturas_ponto ap
LEFT JOIN colaboradores c ON ap.colaborador_id = c.id
ORDER BY ap.created_at DESC;

-- 3. Verificar se Silvana tem acesso admin
SELECT 
  'Silvana Admin' as info,
  id,
  email,
  role,
  auth_uid,
  created_at
FROM app_users 
WHERE email = 'silvana@qualitecengenharia.com.br';

-- 4. Testar consulta exata que o painel admin faz
SELECT 
  'Consulta Painel Admin' as info,
  ap.id,
  ap.colaborador_id,
  ap.mes,
  ap.ano,
  ap.data_assinatura,
  ap.ip_assinatura,
  ap.user_agent,
  ap.hash_assinatura,
  ap.created_at,
  c.id as colaborador_id_join,
  c.nome as colaborador_nome,
  c.cpf as colaborador_cpf
FROM assinaturas_ponto ap
LEFT JOIN colaboradores c ON ap.colaborador_id = c.id
ORDER BY ap.data_assinatura DESC;

-- 5. Verificar RLS da tabela assinaturas_ponto
SELECT 
  'RLS Status' as info,
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE tablename = 'assinaturas_ponto';

-- 6. Ver políticas RLS
SELECT 
  'Políticas RLS' as info,
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'assinaturas_ponto';

-- 7. Testar se consegue buscar como service_role (sem RLS)
-- Esta consulta simula o que o endpoint deveria retornar
SELECT 
  'Simulação Endpoint' as info,
  json_build_object(
    'id', ap.id,
    'colaborador_id', ap.colaborador_id,
    'mes', ap.mes,
    'ano', ap.ano,
    'data_assinatura', ap.data_assinatura,
    'ip_assinatura', ap.ip_assinatura,
    'user_agent', ap.user_agent,
    'hash_assinatura', ap.hash_assinatura,
    'total_dias', ap.total_dias,
    'total_horas', ap.total_horas,
    'observacoes', ap.observacoes,
    'created_at', ap.created_at,
    'colaborador', json_build_object(
      'id', c.id,
      'nome', c.nome,
      'cpf', c.cpf
    )
  ) as resultado
FROM assinaturas_ponto ap
LEFT JOIN colaboradores c ON ap.colaborador_id = c.id
ORDER BY ap.data_assinatura DESC
LIMIT 5;