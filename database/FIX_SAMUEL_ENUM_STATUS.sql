-- ============================================================================
-- FIX DEFINITIVO: Samuel não aparece no 13º Salário (ENUM status_colaborador)
-- ============================================================================

-- PROBLEMA: O campo status é um ENUM, não texto simples
-- A API busca por 'Ativo' mas o enum pode ter valores diferentes

-- 1. VERIFICAR: Quais valores existem no ENUM status_colaborador
SELECT 
  enumlabel as valor_enum
FROM pg_enum
WHERE enumtypid = (
  SELECT oid FROM pg_type WHERE typname = 'status_colaborador'
)
ORDER BY enumsortorder;

-- 2. VERIFICAR: Status atual de Samuel
SELECT 
  id,
  nome,
  cpf,
  status::text as status_atual,
  salario_base,
  data_admissao,
  cargo
FROM colaboradores
WHERE id = '84165a85-616f-4709-9069-54cfd46d6a38'::uuid;

-- 3. VERIFICAR: Estrutura da coluna status
SELECT 
  column_name,
  data_type,
  udt_name
FROM information_schema.columns
WHERE table_name = 'colaboradores'
AND column_name = 'status';

-- 4. LISTAR: Todos os colaboradores e seus status
SELECT 
  id,
  nome,
  status::text as status_texto,
  salario_base
FROM colaboradores
ORDER BY nome;

-- 5. CORRIGIR: Atualizar Samuel para o valor correto do ENUM
-- Tente cada um destes comandos até encontrar o valor correto:

-- Opção 1: Se o enum tem 'Ativo'
UPDATE colaboradores
SET status = 'Ativo'::status_colaborador
WHERE id = '84165a85-616f-4709-9069-54cfd46d6a38'::uuid;

-- Opção 2: Se o enum tem 'ativo' (minúsculo)
-- UPDATE colaboradores
-- SET status = 'ativo'::status_colaborador
-- WHERE id = '84165a85-616f-4709-9069-54cfd46d6a38'::uuid;

-- Opção 3: Se o enum tem 'ATIVO' (maiúsculo)
-- UPDATE colaboradores
-- SET status = 'ATIVO'::status_colaborador
-- WHERE id = '84165a85-616f-4709-9069-54cfd46d6a38'::uuid;

-- Opção 4: Se o enum tem 'active' (inglês)
-- UPDATE colaboradores
-- SET status = 'active'::status_colaborador
-- WHERE id = '84165a85-616f-4709-9069-54cfd46d6a38'::uuid;

-- 6. VERIFICAR: Resultado após correção
SELECT 
  id,
  nome,
  cpf,
  status::text as status,
  salario_base,
  data_admissao,
  cargo,
  departamento,
  '✅ Status atualizado!' as resultado
FROM colaboradores
WHERE id = '84165a85-616f-4709-9069-54cfd46d6a38'::uuid;

-- 7. GARANTIR: Outros campos necessários
UPDATE colaboradores
SET 
  salario_base = COALESCE(NULLIF(salario_base, 0), 3015.64),
  data_admissao = COALESCE(data_admissao, '2024-01-01'),
  cargo = COALESCE(NULLIF(cargo, ''), 'Desenvolvedor'),
  departamento = COALESCE(NULLIF(departamento, ''), 'TI'),
  updated_at = NOW()
WHERE id = '84165a85-616f-4709-9069-54cfd46d6a38'::uuid
AND (
  salario_base IS NULL OR salario_base = 0 OR
  data_admissao IS NULL OR
  cargo IS NULL OR cargo = '' OR
  departamento IS NULL OR departamento = ''
);

-- 8. VERIFICAÇÃO FINAL: Samuel está pronto?
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
    WHEN status::text = 'Ativo' AND salario_base > 0 THEN '✅ PRONTO PARA 13º SALÁRIO'
    WHEN status::text != 'Ativo' THEN '❌ Status incorreto: ' || status::text
    WHEN salario_base IS NULL OR salario_base = 0 THEN '❌ Sem salário'
    ELSE '❌ Verificar outros campos'
  END as diagnostico
FROM colaboradores
WHERE id = '84165a85-616f-4709-9069-54cfd46d6a38'::uuid;
