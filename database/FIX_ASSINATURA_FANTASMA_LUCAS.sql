-- FIX ASSINATURA FANTASMA DO LUCAS
-- Remove assinaturas inválidas e corrige vínculos

-- 1. Verificar assinaturas existentes para dezembro 2025
SELECT 
  ap.id,
  ap.colaborador_id,
  c.nome,
  ap.mes,
  ap.ano,
  ap.data_assinatura,
  ap.hash_assinatura
FROM assinaturas_ponto ap
JOIN colaboradores c ON c.id = ap.colaborador_id
WHERE ap.mes = 12 AND ap.ano = 2025
ORDER BY ap.data_assinatura DESC;

-- 2. Remover assinaturas inválidas (sem hash ou dados incompletos)
DELETE FROM assinaturas_ponto 
WHERE mes = 12 AND ano = 2025 
AND (hash_assinatura IS NULL OR hash_assinatura = '' OR LENGTH(hash_assinatura) < 10);

-- 3. Verificar se Lucas tem vinculação correta
SELECT 
  'COLABORADORES' as tabela,
  c.id,
  c.nome,
  c.email,
  c.auth_uid
FROM colaboradores c
WHERE c.nome ILIKE '%lucas%';

-- 4. Verificar app_users do Lucas
SELECT 
  'APP_USERS' as tabela,
  au.id,
  au.auth_uid,
  au.colaborador_id,
  au.nome,
  au.email
FROM app_users au
WHERE au.nome ILIKE '%lucas%' OR au.email ILIKE '%lucas%';

-- 5. Corrigir vinculação se necessário
-- Se Lucas existe em colaboradores mas não tem auth_uid correto:
UPDATE colaboradores 
SET auth_uid = (
  SELECT auth_uid FROM app_users 
  WHERE nome ILIKE '%lucas%' 
  LIMIT 1
)
WHERE nome ILIKE '%lucas%' AND auth_uid IS NULL;

-- 6. Verificar registros de ponto do Lucas para dezembro 2025
SELECT 
  rp.id,
  rp.colaborador_id,
  c.nome,
  rp.data,
  rp.entrada_1,
  rp.saida_1,
  rp.entrada_2,
  rp.saida_2
FROM registros_ponto rp
JOIN colaboradores c ON c.id = rp.colaborador_id
WHERE c.nome ILIKE '%lucas%'
AND rp.data >= '2025-12-01'
AND rp.data <= '2025-12-31'
ORDER BY rp.data DESC;