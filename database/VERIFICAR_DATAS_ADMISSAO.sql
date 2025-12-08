-- =====================================================
-- Verificar Datas de Admissão dos Colaboradores
-- =====================================================

SELECT 
  id,
  nome,
  data_admissao,
  EXTRACT(YEAR FROM data_admissao) as ano_admissao,
  EXTRACT(MONTH FROM data_admissao) as mes_admissao,
  -- Calcular meses trabalhados em 2025
  CASE 
    WHEN EXTRACT(YEAR FROM data_admissao) > 2025 THEN 0
    WHEN EXTRACT(YEAR FROM data_admissao) < 2025 THEN 12
    ELSE 12 - EXTRACT(MONTH FROM data_admissao) + 1
  END as meses_trabalhados_2025,
  salario_base,
  status
FROM colaboradores
WHERE status = 'Ativo'
ORDER BY nome;

-- =====================================================
-- Verificar especificamente Samuel
-- =====================================================

SELECT 
  nome,
  data_admissao,
  EXTRACT(MONTH FROM data_admissao) as mes_admissao,
  12 - EXTRACT(MONTH FROM data_admissao) + 1 as meses_calculados,
  salario_base
FROM colaboradores
WHERE nome ILIKE '%samuel%';

-- =====================================================
-- Se Samuel está com 6 meses ao invés de 5:
-- Significa que data_admissao está em julho (mês 7)
-- Quando deveria estar em agosto (mês 8)
-- =====================================================

-- Corrigir data de admissão do Samuel (se necessário)
-- UPDATE colaboradores
-- SET data_admissao = '2025-08-01'
-- WHERE nome ILIKE '%samuel%';
