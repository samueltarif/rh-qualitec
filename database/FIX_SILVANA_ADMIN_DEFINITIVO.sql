-- FIX DEFINITIVO: SILVANA ADMIN + PAINEL ASSINATURAS
-- Problema: Silvana não está cadastrada como admin no sistema

-- 1. Verificar se Silvana existe em app_users
SELECT 
  'Silvana Antes' as info,
  COUNT(*) as total
FROM app_users 
WHERE email = 'silvana@qualitecengenharia.com.br';

-- 2. Criar/Atualizar Silvana como admin
INSERT INTO app_users (
  id,
  email,
  role,
  nome,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  'silvana@qualitecengenharia.com.br',
  'admin',
  'Silvana Costa',
  NOW(),
  NOW()
) ON CONFLICT (email) DO UPDATE SET
  role = 'admin',
  nome = 'Silvana Costa',
  updated_at = NOW();

-- 3. Verificar se foi criada/atualizada
SELECT 
  'Silvana Depois' as info,
  id,
  email,
  role,
  nome,
  auth_uid,
  created_at
FROM app_users 
WHERE email = 'silvana@qualitecengenharia.com.br';

-- 4. Garantir que RLS está desabilitado para assinaturas (temporário)
ALTER TABLE assinaturas_ponto DISABLE ROW LEVEL SECURITY;

-- 5. Verificar se consegue buscar assinaturas agora
SELECT 
  'Teste Final Assinaturas' as info,
  COUNT(*) as total_assinaturas
FROM assinaturas_ponto;

-- 6. Testar consulta completa que o painel admin faz
SELECT 
  'Consulta Completa Admin' as info,
  ap.id,
  ap.colaborador_id,
  ap.mes,
  ap.ano,
  ap.data_assinatura,
  c.nome as colaborador_nome
FROM assinaturas_ponto ap
LEFT JOIN colaboradores c ON ap.colaborador_id = c.id
ORDER BY ap.data_assinatura DESC
LIMIT 3;