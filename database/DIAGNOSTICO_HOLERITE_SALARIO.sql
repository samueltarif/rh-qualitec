-- DIAGNÓSTICO: Verificar dados do colaborador para geração de holerite

-- 1. Ver todos os colaboradores e seus salários
SELECT 
  id,
  nome,  -- ou nome_completo, dependendo da sua estrutura
  cpf,
  cargo,
  departamento,
  salario,
  CASE 
    WHEN salario IS NULL THEN '❌ SALÁRIO NULL'
    WHEN salario = 0 THEN '❌ SALÁRIO ZERO'
    WHEN salario > 0 THEN '✅ SALÁRIO OK'
  END as status_salario,
  data_admissao,
  status
FROM colaboradores
ORDER BY nome;

-- 2. Ver estrutura da tabela colaboradores
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'colaboradores'
  AND column_name IN ('salario', 'salario_base', 'remuneracao')
ORDER BY ordinal_position;

-- 3. Ver holerites já gerados
SELECT 
  h.id,
  h.nome_colaborador,
  h.mes,
  h.ano,
  h.salario_base,
  h.salario_liquido,
  h.status,
  h.gerado_em
FROM holerites h
ORDER BY h.gerado_em DESC
LIMIT 10;

-- 4. Ver colaboradores SEM holerite gerado
SELECT 
  c.id,
  c.nome,
  c.salario,
  c.cargo,
  COUNT(h.id) as total_holerites
FROM colaboradores c
LEFT JOIN holerites h ON h.colaborador_id = c.id
GROUP BY c.id, c.nome, c.salario, c.cargo
HAVING COUNT(h.id) = 0;
