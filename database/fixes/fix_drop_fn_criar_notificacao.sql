-- Remover função fn_criar_notificacao
-- Execute este script no Supabase SQL Editor

-- Remover a função problemática
DROP FUNCTION IF EXISTS fn_criar_notificacao CASCADE;
DROP FUNCTION IF EXISTS public.fn_criar_notificacao CASCADE;

-- Verificar se foi removida
SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM pg_proc p
      JOIN pg_namespace n ON p.pronamespace = n.oid
      WHERE p.proname = 'fn_criar_notificacao'
      AND n.nspname = 'public'
    )
    THEN 'Função fn_criar_notificacao ainda existe'
    ELSE 'Função fn_criar_notificacao removida com sucesso!'
  END as status;
