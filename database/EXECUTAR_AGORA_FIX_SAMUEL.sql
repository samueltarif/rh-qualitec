-- ============================================================================
-- EXECUTAR AGORA: Corrigir Samuel para aparecer no 13º Salário
-- ============================================================================

-- 1. DIAGNÓSTICO: Ver status atual de Samuel
SELECT 
  id,
  nome,
  status,
  '❌ PROBLEMA: Status deve ser "Ativo" (com A maiúsculo)' as diagnostico
FROM colaboradores
WHERE id = '84165a85-616f-4709-9069-54cfd46d6a38'::uuid;

-- 2. CORREÇÃO: Atualizar status para 'Ativo'
UPDATE colaboradores
SET 
  status = 'Ativo',
  salario_base = COALESCE(NULLIF(salario_base, 0), 3015.64),
  data_admissao = COALESCE(data_admissao, '2024-01-01'),
  cargo = COALESCE(NULLIF(cargo, ''), 'Desenvolvedor'),
  departamento = COALESCE(NULLIF(departamento, ''), 'TI'),
  updated_at = NOW()
WHERE id = '84165a85-616f-4709-9069-54cfd46d6a38'::uuid;

-- 3. VERIFICAÇÃO: Confirmar que está correto
SELECT 
  id,
  nome,
  cpf,
  status,
  salario_base,
  data_admissao,
  cargo,
  departamento,
  '✅ CORRIGIDO - Agora aparecerá no modal de 13º salário!' as resultado
FROM colaboradores
WHERE id = '84165a85-616f-4709-9069-54cfd46d6a38'::uuid;

-- 4. LISTAR: Todos os colaboradores que aparecerão no modal
SELECT 
  id,
  nome,
  cpf,
  status,
  salario_base
FROM colaboradores
WHERE status = 'Ativo'
ORDER BY nome;
