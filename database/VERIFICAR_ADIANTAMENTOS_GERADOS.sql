-- ============================================
-- VERIFICAR ADIANTAMENTOS GERADOS
-- ============================================

-- Ver todos os holerites de adiantamento
SELECT 
  id,
  colaborador_id,
  nome_colaborador,
  mes,
  ano,
  tipo,
  salario_bruto,
  salario_liquido as valor_adiantamento,
  created_at
FROM holerites
WHERE tipo = 'adiantamento'
ORDER BY created_at DESC;

-- Ver quantos adiantamentos por mês
SELECT 
  mes,
  ano,
  COUNT(*) as total_adiantamentos,
  SUM(salario_liquido) as valor_total
FROM holerites
WHERE tipo = 'adiantamento'
GROUP BY mes, ano
ORDER BY ano DESC, mes DESC;

-- Ver colaboradores SEM adiantamento no mês atual
SELECT 
  c.id,
  c.nome,
  c.salario,
  (c.salario * 0.40) as adiantamento_esperado
FROM colaboradores c
WHERE c.status = 'Ativo'
  AND c.salario > 0
  AND NOT EXISTS (
    SELECT 1 
    FROM holerites h 
    WHERE h.colaborador_id = c.id 
      AND h.tipo = 'adiantamento'
      AND h.mes = EXTRACT(MONTH FROM CURRENT_DATE)
      AND h.ano = EXTRACT(YEAR FROM CURRENT_DATE)
  )
ORDER BY c.nome;
