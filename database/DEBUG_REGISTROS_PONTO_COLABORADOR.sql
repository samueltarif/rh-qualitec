-- 🔍 DEBUG: Ver registros de ponto do Corinthians em dezembro/2024

-- 1. Ver todos os registros de dezembro
SELECT 
  data,
  TO_CHAR(data, 'DD/MM/YYYY') as data_formatada,
  TO_CHAR(data, 'Day') as dia_semana,
  entrada_1,
  saida_1,
  entrada_2,
  saida_2,
  status,
  created_at
FROM registros_ponto
WHERE colaborador_id = (
  SELECT id FROM colaboradores WHERE nome ILIKE '%corinthians%'
)
AND data >= '2024-12-01'
AND data <= '2024-12-31'
ORDER BY data ASC;

-- 2. Contar registros por mês
SELECT 
  TO_CHAR(data, 'YYYY-MM') as mes_ano,
  COUNT(*) as total_registros,
  MIN(data) as primeira_data,
  MAX(data) as ultima_data
FROM registros_ponto
WHERE colaborador_id = (
  SELECT id FROM colaboradores WHERE nome ILIKE '%corinthians%'
)
GROUP BY TO_CHAR(data, 'YYYY-MM')
ORDER BY mes_ano DESC;

-- 3. Ver se tem registros de novembro
SELECT 
  data,
  TO_CHAR(data, 'DD/MM/YYYY') as data_formatada,
  entrada_1,
  saida_1,
  entrada_2,
  saida_2
FROM registros_ponto
WHERE colaborador_id = (
  SELECT id FROM colaboradores WHERE nome ILIKE '%corinthians%'
)
AND data >= '2024-11-01'
AND data < '2024-12-01'
ORDER BY data ASC;

-- 4. Ver informações do colaborador
SELECT 
  id,
  nome,
  auth_uid,
  jornada_id,
  created_at
FROM colaboradores
WHERE nome ILIKE '%corinthians%';
