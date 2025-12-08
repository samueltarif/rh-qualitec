-- Encontrar e remover funções que referenciam notifications
-- Execute este script no Supabase SQL Editor

-- Passo 1: Encontrar todas as funções que mencionam 'notifications'
SELECT 
  n.nspname as schema,
  p.proname as function_name
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE pg_get_functiondef(p.oid) ILIKE '%notifications%'
AND n.nspname = 'public'
AND p.prokind = 'f';

-- Passo 2: Remover funções problemáticas
DO $$
DECLARE
  func_rec RECORD;
BEGIN
  FOR func_rec IN 
    SELECT 
      p.oid,
      n.nspname as schema,
      p.proname as function_name
    FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE pg_get_functiondef(p.oid) ILIKE '%notifications%'
    AND n.nspname = 'public'
    AND p.prokind = 'f'
  LOOP
    BEGIN
      EXECUTE format('DROP FUNCTION IF EXISTS %I.%I CASCADE', 
        func_rec.schema, func_rec.function_name);
      RAISE NOTICE 'Função %.% removida', func_rec.schema, func_rec.function_name;
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE 'Erro ao remover função %.%: %', func_rec.schema, func_rec.function_name, SQLERRM;
    END;
  END LOOP;
END $$;

-- Passo 3: Verificar se ainda existem referências
SELECT 
  n.nspname as schema,
  p.proname as function_name
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE pg_get_functiondef(p.oid) ILIKE '%notifications%'
AND n.nspname = 'public'
AND p.prokind = 'f';
