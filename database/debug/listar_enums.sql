-- ============================================================================
-- LISTAR TODOS OS ENUMS E SEUS VALORES
-- Execute no Supabase SQL Editor para ver os valores válidos
-- ============================================================================

SELECT 
    t.typname as nome_enum,
    string_agg(e.enumlabel, ', ' ORDER BY e.enumsortorder) as valores_validos
FROM pg_type t 
JOIN pg_enum e ON t.oid = e.enumtypid  
JOIN pg_catalog.pg_namespace n ON n.oid = t.typnamespace
WHERE n.nspname = 'public'
GROUP BY t.typname
ORDER BY t.typname;
