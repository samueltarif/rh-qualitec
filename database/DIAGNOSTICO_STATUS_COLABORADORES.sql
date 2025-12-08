-- ============================================================================
-- Diagnóstico: Problema de Case Sensitivity no Status
-- ============================================================================

-- PROBLEMA IDENTIFICADO:
-- A API busca por status = 'Ativo' (com A maiúsculo)
-- Mas os colaboradores podem estar com 'ativo' (minúsculo)

-- 1. Verificar todos os valores de status (case sensitive)
SELECT 
  status,
  COUNT(*) as total,
  CASE 
    WHEN status = 'Ativo' THEN '✅ CORRETO (será encontrado pela API)'
    WHEN status = 'ativo' THEN '❌ ERRADO (não será encontrado - minúsculo)'
    WHEN status = 'ATIVO' THEN '❌ ERRADO (não será encontrado - maiúsculo)'
    WHEN status IS NULL THEN '❌ ERRADO (NULL)'
    ELSE '❌ ERRADO (valor diferente)'
  END as diagnostico
FROM colaboradores
GROUP BY status
ORDER BY total DESC;

-- 2. Verificar especificamente o Samuel
SELECT 
  id,
  nome,
  cpf,
  status,
  CASE 
    WHEN status = 'Ativo' THEN '✅ OK - Aparecerá no modal'
    WHEN status = 'ativo' THEN '❌ PROBLEMA - Não aparecerá (minúsculo)'
    ELSE '❌ PROBLEMA - Status: ' || COALESCE(status, 'NULL')
  END as diagnostico
FROM colaboradores
WHERE id = '84165a85-616f-4709-9069-54cfd46d6a38'::uuid;

-- 3. Listar todos os colaboradores que NÃO aparecerão no modal
SELECT 
  id,
  nome,
  cpf,
  status,
  'Não aparecerá porque status != "Ativo"' as motivo
FROM colaboradores
WHERE status != 'Ativo' OR status IS NULL;

-- 4. Listar todos os colaboradores que APARECERÃO no modal
SELECT 
  id,
  nome,
  cpf,
  status,
  salario_base,
  '✅ Aparecerá no modal' as status_modal
FROM colaboradores
WHERE status = 'Ativo'
ORDER BY nome;

-- 5. Verificar se há enum definido para status
SELECT 
  n.nspname as schema,
  t.typname as enum_name,
  e.enumlabel as enum_value
FROM pg_type t 
JOIN pg_enum e ON t.oid = e.enumtypid  
JOIN pg_catalog.pg_namespace n ON n.oid = t.typnamespace
WHERE t.typname LIKE '%status%'
ORDER BY t.typname, e.enumsortorder;
