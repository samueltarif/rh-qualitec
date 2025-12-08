-- Debug: Verificar holerites gerados
SELECT 
  id,
  colaborador_id,
  nome_colaborador,
  mes,
  ano,
  tipo,
  parcela_13,
  salario_liquido,
  observacoes,
  created_at
FROM holerites
WHERE ano = 2025
  AND nome_colaborador LIKE '%SAMUEL%'
ORDER BY mes, tipo, parcela_13;

-- Verificar índices
SELECT 
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename = 'holerites'
  AND indexname LIKE 'idx_holerites_unique%';

-- Contar holerites por tipo
SELECT 
  mes,
  tipo,
  parcela_13,
  COUNT(*) as total
FROM holerites
WHERE ano = 2025
GROUP BY mes, tipo, parcela_13
ORDER BY mes, tipo, parcela_13;
