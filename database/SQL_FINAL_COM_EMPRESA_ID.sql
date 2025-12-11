-- SQL FINAL COM EMPRESA_ID - EXECUTAR AGORA

-- 1. Primeiro, descobrir o empresa_id do colaborador CARLOS
SELECT 
  'EMPRESA DO CARLOS' as info,
  c.id as colaborador_id,
  c.nome,
  c.empresa_id
FROM colaboradores c 
WHERE c.id = 'c79f679a-147a-47c1-9344-83833507adb0';

-- 2. Garantir vínculo auth_uid
UPDATE colaboradores 
SET auth_uid = 'cdefc7c4-0ac1-4f74-9fcb-f074ac0548b7'
WHERE id = 'c79f679a-147a-47c1-9344-83833507adb0';

-- 3. Limpar registros existentes do CARLOS
DELETE FROM registros_ponto 
WHERE colaborador_id = 'c79f679a-147a-47c1-9344-83833507adb0';

-- 4. Inserir registros novos COM empresa_id
INSERT INTO registros_ponto (
  empresa_id,
  colaborador_id,
  data,
  entrada_1,
  saida_1,
  entrada_2,
  saida_2,
  observacoes
) VALUES 
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'c79f679a-147a-47c1-9344-83833507adb0', '2025-12-10', '08:00:00', '12:00:00', '13:00:00', '17:00:00', 'Dia completo'),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'c79f679a-147a-47c1-9344-83833507adb0', '2025-12-09', '08:15:00', '12:15:00', '13:15:00', '17:15:00', 'Dia completo'),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'c79f679a-147a-47c1-9344-83833507adb0', '2025-12-08', '08:00:00', '12:00:00', '13:00:00', '17:00:00', 'Dia completo');

-- 5. Verificar resultado
SELECT 
  'SUCESSO!' as status,
  c.nome,
  c.auth_uid,
  COUNT(rp.id) as registros_criados
FROM colaboradores c
LEFT JOIN registros_ponto rp ON rp.colaborador_id = c.id
WHERE c.id = 'c79f679a-147a-47c1-9344-83833507adb0'
GROUP BY c.id, c.nome, c.auth_uid;