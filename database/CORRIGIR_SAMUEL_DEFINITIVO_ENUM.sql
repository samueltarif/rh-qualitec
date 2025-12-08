-- ============================================================================
-- PASSO 2: Corrigir Samuel após descobrir o valor correto do ENUM
-- ============================================================================

-- IMPORTANTE: Execute DESCOBRIR_ENUM_STATUS.sql PRIMEIRO!
-- Depois volte aqui e use o valor correto que você descobriu

-- ============================================================================
-- OPÇÃO A: Se o ENUM tem 'Ativo' (com A maiúsculo)
-- ============================================================================
UPDATE colaboradores
SET 
  status = 'Ativo'::status_colaborador,
  salario_base = COALESCE(NULLIF(salario_base, 0), 3015.64),
  data_admissao = COALESCE(data_admissao, '2024-01-01'),
  cargo = COALESCE(NULLIF(cargo, ''), 'Desenvolvedor'),
  departamento = COALESCE(NULLIF(departamento, ''), 'TI'),
  updated_at = NOW()
WHERE id = '84165a85-616f-4709-9069-54cfd46d6a38'::uuid;

-- ============================================================================
-- OPÇÃO B: Se o ENUM tem 'ativo' (minúsculo) - DESCOMENTE SE NECESSÁRIO
-- ============================================================================
-- UPDATE colaboradores
-- SET 
--   status = 'ativo'::status_colaborador,
--   salario_base = COALESCE(NULLIF(salario_base, 0), 3015.64),
--   data_admissao = COALESCE(data_admissao, '2024-01-01'),
--   cargo = COALESCE(NULLIF(cargo, ''), 'Desenvolvedor'),
--   departamento = COALESCE(NULLIF(departamento, ''), 'TI'),
--   updated_at = NOW()
-- WHERE id = '84165a85-616f-4709-9069-54cfd46d6a38'::uuid;

-- ============================================================================
-- OPÇÃO C: Se o ENUM tem 'ATIVO' (tudo maiúsculo) - DESCOMENTE SE NECESSÁRIO
-- ============================================================================
-- UPDATE colaboradores
-- SET 
--   status = 'ATIVO'::status_colaborador,
--   salario_base = COALESCE(NULLIF(salario_base, 0), 3015.64),
--   data_admissao = COALESCE(data_admissao, '2024-01-01'),
--   cargo = COALESCE(NULLIF(cargo, ''), 'Desenvolvedor'),
--   departamento = COALESCE(NULLIF(departamento, ''), 'TI'),
--   updated_at = NOW()
-- WHERE id = '84165a85-616f-4709-9069-54cfd46d6a38'::uuid;

-- ============================================================================
-- VERIFICAÇÃO FINAL
-- ============================================================================
SELECT 
  id,
  nome,
  cpf,
  status::text as status,
  salario_base,
  data_admissao,
  cargo,
  departamento,
  CASE 
    WHEN status::text = 'Ativo' AND salario_base > 0 THEN '✅ PRONTO! Aparecerá no modal de 13º'
    WHEN status::text != 'Ativo' THEN '⚠️ Status: ' || status::text || ' (API busca "Ativo")'
    WHEN salario_base IS NULL OR salario_base = 0 THEN '❌ Sem salário base'
    ELSE '❌ Verificar'
  END as resultado
FROM colaboradores
WHERE id = '84165a85-616f-4709-9069-54cfd46d6a38'::uuid;

-- ============================================================================
-- LISTAR TODOS OS COLABORADORES QUE APARECERÃO NO MODAL
-- ============================================================================
SELECT 
  id,
  nome,
  cpf,
  status::text as status,
  salario_base,
  '✅ Aparecerá no modal de 13º salário' as info
FROM colaboradores
WHERE status::text = 'Ativo'
AND salario_base > 0
ORDER BY nome;
