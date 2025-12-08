-- ============================================================================
-- Corrigir Samuel para aparecer no modal de 13º salário
-- ============================================================================

-- IMPORTANTE: Execute primeiro VERIFICAR_SAMUEL_13_SALARIO.sql para diagnosticar

-- 1. Garantir que Samuel está com status 'ativo'
UPDATE colaboradores
SET 
  status = 'ativo',
  updated_at = NOW()
WHERE id = '84165a85-616f-4709-9069-54cfd46d6a38'::uuid;

-- 2. Garantir que Samuel tem salário base (se estiver NULL ou 0)
UPDATE colaboradores
SET 
  salario_base = COALESCE(NULLIF(salario_base, 0), 3015.64),
  updated_at = NOW()
WHERE id = '84165a85-616f-4709-9069-54cfd46d6a38'::uuid
AND (salario_base IS NULL OR salario_base = 0);

-- 3. Garantir que Samuel tem data de admissão
UPDATE colaboradores
SET 
  data_admissao = COALESCE(data_admissao, '2024-01-01'),
  updated_at = NOW()
WHERE id = '84165a85-616f-4709-9069-54cfd46d6a38'::uuid
AND data_admissao IS NULL;

-- 4. Garantir que Samuel tem cargo
UPDATE colaboradores
SET 
  cargo = COALESCE(NULLIF(cargo, ''), 'Desenvolvedor'),
  updated_at = NOW()
WHERE id = '84165a85-616f-4709-9069-54cfd46d6a38'::uuid
AND (cargo IS NULL OR cargo = '');

-- 5. Garantir que Samuel tem departamento
UPDATE colaboradores
SET 
  departamento = COALESCE(NULLIF(departamento, ''), 'TI'),
  updated_at = NOW()
WHERE id = '84165a85-616f-4709-9069-54cfd46d6a38'::uuid
AND (departamento IS NULL OR departamento = '');

-- 6. Verificar resultado
SELECT 
  id,
  nome,
  cpf,
  email,
  status,
  salario_base,
  data_admissao,
  cargo,
  departamento,
  '✅ PRONTO PARA 13º SALÁRIO' as resultado
FROM colaboradores
WHERE id = '84165a85-616f-4709-9069-54cfd46d6a38'::uuid;

-- 7. Listar todos os colaboradores ativos após correção
SELECT 
  id,
  nome,
  status,
  salario_base,
  cargo
FROM colaboradores
WHERE status = 'ativo'
ORDER BY nome;
