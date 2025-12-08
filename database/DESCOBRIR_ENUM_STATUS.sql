-- ============================================================================
-- PASSO 1: Descobrir valores do ENUM status_colaborador
-- ============================================================================

-- Execute este script PRIMEIRO para descobrir os valores corretos

-- 1. Ver todos os valores possíveis do ENUM
SELECT 
  enumlabel as '📋 Valores Possíveis do ENUM',
  enumsortorder as ordem
FROM pg_enum
WHERE enumtypid = (
  SELECT oid FROM pg_type WHERE typname = 'status_colaborador'
)
ORDER BY enumsortorder;

-- 2. Ver qual valor Samuel tem atualmente
SELECT 
  'Samuel tem status:' as info,
  status::text as valor_atual
FROM colaboradores
WHERE id = '84165a85-616f-4709-9069-54cfd46d6a38'::uuid;

-- 3. Ver qual valor a API está buscando
SELECT 
  'A API busca por:' as info,
  'Ativo' as valor_buscado;

-- 4. Comparar: Status de Samuel vs Status que a API busca
SELECT 
  nome,
  status::text as status_samuel,
  'Ativo' as status_api_busca,
  CASE 
    WHEN status::text = 'Ativo' THEN '✅ MATCH - Aparecerá no modal'
    ELSE '❌ NÃO MATCH - NÃO aparecerá no modal'
  END as resultado
FROM colaboradores
WHERE id = '84165a85-616f-4709-9069-54cfd46d6a38'::uuid;

-- 5. Ver todos os colaboradores e seus status
SELECT 
  nome,
  status::text as status,
  salario_base,
  CASE 
    WHEN status::text = 'Ativo' THEN '✅ Aparecerá'
    ELSE '❌ NÃO aparecerá'
  END as no_modal_13
FROM colaboradores
ORDER BY nome;
