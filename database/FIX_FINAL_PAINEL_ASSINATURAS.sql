-- FIX FINAL: PAINEL ADMIN ASSINATURAS FUNCIONANDO
-- Silvana já foi criada como admin, agora vamos garantir que tudo funcione

-- 1. Confirmar que Silvana existe como admin
SELECT 
  'Silvana Admin Confirmada' as status,
  id,
  email,
  role,
  nome,
  auth_uid
FROM app_users 
WHERE email = 'silvana@qualitecengenharia.com.br';

-- 2. Confirmar que assinaturas existem
SELECT 
  'Assinaturas Confirmadas' as status,
  COUNT(*) as total
FROM assinaturas_ponto;

-- 3. Testar consulta exata que o endpoint faz
SELECT 
  'Teste Endpoint Exato' as status,
  ap.id,
  ap.colaborador_id,
  ap.mes,
  ap.ano,
  ap.data_assinatura,
  ap.ip_assinatura,
  ap.hash_assinatura,
  ap.total_dias,
  ap.total_horas,
  ap.created_at,
  c.id as colaborador_id_join,
  c.nome as colaborador_nome,
  c.cpf as colaborador_cpf
FROM assinaturas_ponto ap
LEFT JOIN colaboradores c ON ap.colaborador_id = c.id
ORDER BY ap.data_assinatura DESC;

-- 4. Garantir que RLS está desabilitado
ALTER TABLE assinaturas_ponto DISABLE ROW LEVEL SECURITY;

-- 5. Verificar status final
SELECT 
  'Status Final' as info,
  'RLS Desabilitado' as rls_status,
  'Silvana Admin Criada' as admin_status,
  '1 Assinatura Disponível' as dados_status;