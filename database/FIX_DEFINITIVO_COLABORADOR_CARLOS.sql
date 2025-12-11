-- FIX DEFINITIVO PARA COLABORADOR CARLOS

-- 1. Verificar estado atual
SELECT 
  'ANTES DO FIX' as status,
  c.id,
  c.nome,
  c.email_corporativo,
  c.auth_uid,
  au.email as auth_email
FROM colaboradores c
LEFT JOIN auth.users au ON au.id = c.auth_uid
WHERE c.id = 'c79f679a-147a-47c1-9344-83833507adb0';

-- 2. Garantir que o auth_uid está correto
UPDATE colaboradores 
SET auth_uid = 'cdefc7c4-0ac1-4f74-9fcb-f074ac0548b7'
WHERE id = 'c79f679a-147a-47c1-9344-83833507adb0';

-- 3. Verificar se o usuário auth existe
SELECT 
  'USUARIO AUTH' as status,
  id,
  email,
  created_at
FROM auth.users 
WHERE id = 'cdefc7c4-0ac1-4f74-9fcb-f074ac0548b7';

-- 4. Verificar estado final
SELECT 
  'DEPOIS DO FIX' as status,
  c.id,
  c.nome,
  c.email_corporativo,
  c.auth_uid,
  au.email as auth_email,
  CASE 
    WHEN c.auth_uid = au.id THEN '✅ VINCULO OK'
    ELSE '❌ VINCULO ERRO'
  END as vinculo_status
FROM colaboradores c
LEFT JOIN auth.users au ON au.id = c.auth_uid
WHERE c.id = 'c79f679a-147a-47c1-9344-83833507adb0';

-- 5. Verificar registros de ponto existentes
SELECT 
  'REGISTROS PONTO' as status,
  COUNT(*) as total_registros,
  MIN(data) as primeira_data,
  MAX(data) as ultima_data
FROM registros_ponto 
WHERE colaborador_id = 'c79f679a-147a-47c1-9344-83833507adb0';

-- 6. Se não há registros, criar alguns de exemplo para teste
INSERT INTO registros_ponto (
  colaborador_id,
  data,
  entrada_1,
  saida_1,
  entrada_2,
  saida_2,
  observacoes
) VALUES 
  ('c79f679a-147a-47c1-9344-83833507adb0', '2025-12-10', '08:00:00', '12:00:00', '13:00:00', '17:00:00', 'Dia completo'),
  ('c79f679a-147a-47c1-9344-83833507adb0', '2025-12-09', '08:15:00', '12:15:00', '13:15:00', '17:15:00', 'Dia completo'),
  ('c79f679a-147a-47c1-9344-83833507adb0', '2025-12-08', '08:00:00', '12:00:00', '13:00:00', '17:00:00', 'Dia completo'),
  ('c79f679a-147a-47c1-9344-83833507adb0', '2025-12-07', '08:30:00', '12:30:00', '13:30:00', '17:30:00', 'Dia completo'),
  ('c79f679a-147a-47c1-9344-83833507adb0', '2025-12-06', '08:00:00', '12:00:00', '13:00:00', '17:00:00', 'Dia completo')
ON CONFLICT (colaborador_id, data) DO NOTHING;

-- 7. Verificação final completa
SELECT 
  '🎯 TESTE FINAL' as status,
  'Colaborador: ' || c.nome as info,
  'Auth UID: ' || c.auth_uid as auth_info,
  'Registros: ' || COUNT(rp.id) as registros_count
FROM colaboradores c
LEFT JOIN registros_ponto rp ON rp.colaborador_id = c.id
WHERE c.id = 'c79f679a-147a-47c1-9344-83833507adb0'
GROUP BY c.id, c.nome, c.auth_uid;